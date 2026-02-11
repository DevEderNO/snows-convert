import { FileVideo, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileSelectorProps {
  selectedFile: string | null;
  onSelect: () => void;
  disabled?: boolean;
}

export function FileSelector({ selectedFile, onSelect, disabled }: FileSelectorProps) {
  const fileName = selectedFile ? selectedFile.split("/").pop() ?? selectedFile : null;

  return (
    <Card className="border-dashed border-2 transition-all duration-200 hover:border-primary/50">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
        {selectedFile ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <FileVideo className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{fileName}</p>
              <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
                {selectedFile}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onSelect} disabled={disabled}>
              Trocar arquivo
            </Button>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Upload className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Selecionar vídeo MP4</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Clique para escolher o arquivo de vídeo
              </p>
            </div>
            <Button onClick={onSelect} disabled={disabled}>
              <Upload className="mr-2 h-4 w-4" />
              Escolher arquivo
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
