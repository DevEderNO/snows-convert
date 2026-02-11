import { useCallback } from "react";
import { pickVideoFile, pickOutputDirectory } from "@/services/tauriCommands";

export function useFileDialog() {
  const selectVideoFile = useCallback(async (): Promise<string | null> => {
    try {
      return await pickVideoFile();
    } catch (error) {
      console.error("Error selecting video file:", error);
      return null;
    }
  }, []);

  const selectOutputDirectory = useCallback(async (): Promise<string | null> => {
    try {
      return await pickOutputDirectory();
    } catch (error) {
      console.error("Error selecting output directory:", error);
      return null;
    }
  }, []);

  return { selectVideoFile, selectOutputDirectory };
}
