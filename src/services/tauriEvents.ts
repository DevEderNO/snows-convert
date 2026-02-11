import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface ProgressPayload {
  percentage: number;
  status: string;
  message: string;
}

export function onConversionProgress(
  callback: (payload: ProgressPayload) => void
): Promise<UnlistenFn> {
  return listen<ProgressPayload>("conversion://progress", (event) => {
    callback(event.payload);
  });
}

export function onConversionComplete(
  callback: (outputPath: string) => void
): Promise<UnlistenFn> {
  return listen<string>("conversion://complete", (event) => {
    callback(event.payload);
  });
}

export function onConversionError(
  callback: (error: string) => void
): Promise<UnlistenFn> {
  return listen<string>("conversion://error", (event) => {
    callback(event.payload);
  });
}
