import { invoke } from "@tauri-apps/api/core";

export interface ConversionOptions {
  fps: number;
  width: number;
  quality: "low" | "medium" | "high";
}

export async function pickVideoFile(): Promise<string | null> {
  return invoke<string | null>("pick_video_file");
}

export async function pickOutputDirectory(): Promise<string | null> {
  return invoke<string | null>("pick_output_directory");
}

export async function startConversion(
  inputPath: string,
  outputDir: string,
  options: ConversionOptions
): Promise<string> {
  return invoke<string>("start_conversion", {
    inputPath,
    outputDir,
    options,
  });
}

export async function checkFfmpeg(): Promise<boolean> {
  return invoke<boolean>("check_ffmpeg");
}
