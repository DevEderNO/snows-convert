import { FolderOpen, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DirectorySelectorProps {
  selectedDir: string | null;
  onSelect: () => void;
  disabled?: boolean;
}

export function DirectorySelector({ selectedDir, onSelect, disabled }: DirectorySelectorProps) {
  return (
    <Card className="transition-all duration-200 hover:border-primary/30">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-accent-foreground">
          {selectedDir ? (
            <FolderOpen className="h-5 w-5 text-primary" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {selectedDir ? "Diretório de saída" : "Selecionar diretório de saída"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {selectedDir ?? "Onde o GIF será salvo"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onSelect} disabled={disabled}>
          {selectedDir ? "Alterar" : "Escolher"}
        </Button>
      </CardContent>
    </Card>
  );
}
