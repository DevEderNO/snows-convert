import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ConversionStatus = "idle" | "converting" | "done" | "error";

interface ConversionProgressProps {
  status: ConversionStatus;
  progress: number;
  message?: string;
}

export function ConversionProgress({ status, progress, message }: ConversionProgressProps) {
  if (status === "idle") return null;

  return (
    <Card className="animate-fade-in overflow-hidden">
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {status === "converting" && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            {status === "done" && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">
              {status === "converting" && "Convertendo..."}
              {status === "done" && "Conversão concluída!"}
              {status === "error" && "Erro na conversão"}
            </span>
          </div>
          <Badge
            variant={
              status === "done"
                ? "default"
                : status === "error"
                ? "destructive"
                : "secondary"
            }
          >
            {status === "converting" ? `${Math.round(progress)}%` : status}
          </Badge>
        </div>

        {status === "converting" && (
          <Progress value={progress} className="h-2" />
        )}

        {message && (
          <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
