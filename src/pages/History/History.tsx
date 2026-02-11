import { Clock } from "lucide-react";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent } from "@/components/ui/card";

export function History() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <Header
        title="Histórico"
        description="Suas conversões anteriores aparecerão aqui."
      />

      {/* Empty State */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium">Nenhuma conversão ainda</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Quando você converter um vídeo, ele aparecerá aqui com detalhes
              do arquivo, formato e data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
