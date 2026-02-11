import { useState, useEffect, useCallback } from "react";
import { startConversion, type ConversionOptions } from "@/services/tauriCommands";
import {
  onConversionProgress,
  onConversionComplete,
  onConversionError,
} from "@/services/tauriEvents";
import type { ConversionStatus } from "@/components/ConversionProgress/ConversionProgress";

interface UseConversionReturn {
  status: ConversionStatus;
  progress: number;
  message: string;
  outputPath: string | null;
  convert: (inputPath: string, outputDir: string, options: ConversionOptions) => Promise<void>;
  reset: () => void;
}

export function useConversion(): UseConversionReturn {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [outputPath, setOutputPath] = useState<string | null>(null);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    const setup = async () => {
      const unlistenProgress = await onConversionProgress((payload) => {
        setProgress(payload.percentage);
        setMessage(payload.message);
        setStatus("converting");
      });
      unlisteners.push(unlistenProgress);

      const unlistenComplete = await onConversionComplete((path) => {
        setStatus("done");
        setProgress(100);
        setOutputPath(path);
        setMessage("GIF gerado com sucesso!");
      });
      unlisteners.push(unlistenComplete);

      const unlistenError = await onConversionError((error) => {
        setStatus("error");
        setMessage(error);
      });
      unlisteners.push(unlistenError);
    };

    setup();

    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, []);

  const convert = useCallback(
    async (inputPath: string, outputDir: string, options: ConversionOptions) => {
      try {
        setStatus("converting");
        setProgress(0);
        setMessage("Iniciando conversão...");
        setOutputPath(null);
        await startConversion(inputPath, outputDir, options);
      } catch (error) {
        setStatus("error");
        setMessage(String(error));
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setMessage("");
    setOutputPath(null);
  }, []);

  return { status, progress, message, outputPath, convert, reset };
}
