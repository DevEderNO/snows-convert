use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use tauri::{AppHandle, Emitter, Manager};

use crate::converter::options::ConversionOptions;
use crate::error::AppError;
use crate::events::progress::ProgressPayload;

pub struct FfmpegConverter;

impl FfmpegConverter {
    /// Get the path to the bundled ffmpeg sidecar binary
    fn get_ffmpeg_path(app: &AppHandle) -> Result<PathBuf, AppError> {
        let resource_dir = app
            .path()
            .resource_dir()
            .map_err(|e| AppError::FfmpegNotFound(format!("Cannot resolve resource dir: {}", e)))?;

        // Tauri sidecar binaries are in the resource directory with platform suffix
        let ffmpeg_name = if cfg!(target_os = "windows") {
            "ffmpeg.exe"
        } else {
            "ffmpeg"
        };

        // Try common locations for the sidecar
        let possible_paths: Vec<PathBuf> = vec![
            resource_dir.join("binaries").join(ffmpeg_name),
            resource_dir.join(ffmpeg_name),
        ];

        for path in &possible_paths {
            if path.exists() {
                return Ok(path.clone());
            }
        }

        // Fallback: try system ffmpeg
        if let Ok(output) = Command::new("which").arg("ffmpeg").output() {
            if output.status.success() {
                let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                return Ok(PathBuf::from(path_str));
            }
        }

        // On Windows, try "where ffmpeg"
        if cfg!(target_os = "windows") {
            if let Ok(output) = Command::new("where").arg("ffmpeg").output() {
                if output.status.success() {
                    let path_str = String::from_utf8_lossy(&output.stdout)
                        .lines()
                        .next()
                        .unwrap_or("")
                        .trim()
                        .to_string();
                    if !path_str.is_empty() {
                        return Ok(PathBuf::from(path_str));
                    }
                }
            }
        }

        Err(AppError::FfmpegNotFound(
            "FFmpeg not found. Please ensure it is installed or bundled with the app.".to_string(),
        ))
    }

    /// Check if ffmpeg is available
    pub fn check_available(app: &AppHandle) -> bool {
        if let Ok(ffmpeg_path) = Self::get_ffmpeg_path(app) {
            Command::new(&ffmpeg_path)
                .arg("-version")
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .status()
                .map(|s| s.success())
                .unwrap_or(false)
        } else {
            false
        }
    }

    /// Get the duration of a video in seconds
    fn get_duration(ffmpeg_path: &Path, input_path: &str) -> Result<f64, AppError> {
        let output = Command::new(ffmpeg_path)
            .args(["-i", input_path])
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .output()
            .map_err(|e| AppError::ConversionFailed(format!("Failed to probe file: {}", e)))?;

        let stderr = String::from_utf8_lossy(&output.stderr);

        for line in stderr.lines() {
            if line.contains("Duration:") {
                if let Some(duration_str) = line.split("Duration: ").nth(1) {
                    if let Some(time_str) = duration_str.split(',').next() {
                        let parts: Vec<&str> = time_str.trim().split(':').collect();
                        if parts.len() == 3 {
                            let hours: f64 = parts[0].parse().unwrap_or(0.0);
                            let minutes: f64 = parts[1].parse().unwrap_or(0.0);
                            let seconds: f64 = parts[2].parse().unwrap_or(0.0);
                            return Ok(hours * 3600.0 + minutes * 60.0 + seconds);
                        }
                    }
                }
            }
        }

        Err(AppError::ConversionFailed(
            "Could not determine video duration".to_string(),
        ))
    }

    /// Parse ffmpeg progress output to extract current time
    fn parse_time(line: &str) -> Option<f64> {
        // FFmpeg outputs lines like: frame=   30 fps=0.0 q=-0.0 size=     256kB time=00:00:02.00
        if let Some(time_idx) = line.find("time=") {
            let time_str = &line[time_idx + 5..];
            if let Some(end_idx) = time_str.find(' ') {
                let time_val = &time_str[..end_idx];
                let parts: Vec<&str> = time_val.split(':').collect();
                if parts.len() == 3 {
                    let hours: f64 = parts[0].parse().unwrap_or(0.0);
                    let minutes: f64 = parts[1].parse().unwrap_or(0.0);
                    let seconds: f64 = parts[2].parse().unwrap_or(0.0);
                    return Some(hours * 3600.0 + minutes * 60.0 + seconds);
                }
            }
        }
        None
    }

    /// Convert MP4 to GIF using a 2-pass palette-based pipeline
    pub fn convert_to_gif(
        app: &AppHandle,
        input_path: &str,
        output_dir: &str,
        options: &ConversionOptions,
    ) -> Result<String, AppError> {
        let ffmpeg_path = Self::get_ffmpeg_path(app)?;

        // Validate input file
        if !Path::new(input_path).exists() {
            return Err(AppError::InvalidInput(format!(
                "Input file not found: {}",
                input_path
            )));
        }

        // Create output directory if needed
        std::fs::create_dir_all(output_dir)?;

        // Build output filename
        let input_name = Path::new(input_path)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("output");
        let output_path = Path::new(output_dir)
            .join(format!("{}.gif", input_name))
            .to_string_lossy()
            .to_string();

        // Get total duration for progress
        let total_duration = Self::get_duration(&ffmpeg_path, input_path).unwrap_or(10.0);

        // Emit starting progress
        let _ = app.emit(
            "conversion://progress",
            ProgressPayload {
                percentage: 0.0,
                status: "starting".to_string(),
                message: "Gerando palette de cores...".to_string(),
            },
        );

        // Build filter string
        let filter = format!(
            "fps={},scale={}:-1:flags=lanczos",
            options.fps, options.width
        );

        let dither = options.quality.dither_algo();
        let max_colors = options.quality.max_colors();

        // 2-pass conversion: palette generation + GIF encoding
        // Single command using split filter for efficiency
        let filter_complex = format!(
            "[0:v] {} ,split [a][b];[a] palettegen=max_colors={} [p];[b][p] paletteuse=dither={}",
            filter, max_colors, dither
        );

        let mut child = Command::new(&ffmpeg_path)
            .args([
                "-i",
                input_path,
                "-filter_complex",
                &filter_complex,
                "-y",
                "-progress",
                "pipe:2",
                &output_path,
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| {
                AppError::ConversionFailed(format!("Failed to start ffmpeg: {}", e))
            })?;

        // Read stderr for progress
        if let Some(stderr) = child.stderr.take() {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(line) = line {
                    if let Some(current_time) = Self::parse_time(&line) {
                        let percentage = (current_time / total_duration * 100.0).min(99.0);
                        let _ = app.emit(
                            "conversion://progress",
                            ProgressPayload {
                                percentage,
                                status: "converting".to_string(),
                                message: format!(
                                    "Processando... {:.1}s / {:.1}s",
                                    current_time, total_duration
                                ),
                            },
                        );
                    }
                }
            }
        }

        let status = child
            .wait()
            .map_err(|e| AppError::ConversionFailed(format!("FFmpeg process error: {}", e)))?;

        if !status.success() {
            let _ = app.emit("conversion://error", "FFmpeg exited with error".to_string());
            return Err(AppError::ConversionFailed(
                "FFmpeg exited with non-zero status".to_string(),
            ));
        }

        // Emit completion
        let _ = app.emit(
            "conversion://progress",
            ProgressPayload {
                percentage: 100.0,
                status: "done".to_string(),
                message: "Conversão concluída!".to_string(),
            },
        );
        let _ = app.emit("conversion://complete", output_path.clone());

        Ok(output_path)
    }
}
