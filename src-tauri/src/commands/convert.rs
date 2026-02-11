use tauri::AppHandle;

use crate::converter::ffmpeg::FfmpegConverter;
use crate::converter::options::ConversionOptions;

#[tauri::command]
pub async fn start_conversion(
    app: AppHandle,
    input_path: String,
    output_dir: String,
    options: ConversionOptions,
) -> Result<String, String> {
    // Run the conversion in a blocking thread to avoid blocking the async runtime
    let result = tokio::task::spawn_blocking(move || {
        FfmpegConverter::convert_to_gif(&app, &input_path, &output_dir, &options)
    })
    .await
    .map_err(|e| format!("Thread error: {}", e))?;

    result.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_ffmpeg(app: AppHandle) -> Result<bool, String> {
    Ok(FfmpegConverter::check_available(&app))
}
