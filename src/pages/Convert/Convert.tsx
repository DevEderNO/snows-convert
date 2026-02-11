import { useState } from "react";
import { Play, RotateCcw, Settings2 } from "lucide-react";
import { Header } from "@/components/Layout/Header";
import { FileSelector } from "@/components/FileSelector/FileSelector";
import { DirectorySelector } from "@/components/DirectorySelector/DirectorySelector";
import { ConversionProgress } from "@/components/ConversionProgress/ConversionProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useConversion } from "@/hooks/useConversion";
import { useFileDialog } from "@/hooks/useFileDialog";
import type { ConversionOptions } from "@/services/tauriCommands";

export function Convert() {
  const [inputFile, setInputFile] = useState<string | null>(null);
  const [outputDir, setOutputDir] = useState<string | null>(null);
  const [conversionType, setConversionType] = useState("gif");
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [quality, setQuality] = useState<ConversionOptions["quality"]>("high");

  const { status, progress, message, convert, reset } = useConversion();
  const { selectVideoFile, selectOutputDirectory } = useFileDialog();

  const isConverting = status === "converting";
  const canConvert = inputFile && outputDir && !isConverting;

  const handleSelectFile = async () => {
    const file = await selectVideoFile();
    if (file) setInputFile(file);
  };

  const handleSelectDir = async () => {
    const dir = await selectOutputDirectory();
    if (dir) setOutputDir(dir);
  };

  const handleConvert = async () => {
    if (!inputFile || !outputDir) return;
    await convert(inputFile, outputDir, { fps, width, quality });
  };

  const handleReset = () => {
    reset();
    setInputFile(null);
    setOutputDir(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      <Header
        title="Converter Vídeo"
        description="Selecione o arquivo, configure as opções e inicie a conversão."
      />

      {/* Conversion Type */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-40 shrink-0">
              Tipo de conversão
            </label>
            <Select value={conversionType} onValueChange={setConversionType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gif">MP4 → GIF</SelectItem>
                <SelectItem value="webp" disabled>
                  MP4 → WebP (em breve)
                </SelectItem>
                <SelectItem value="apng" disabled>
                  MP4 → APNG (em breve)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* File Selection */}
      <FileSelector
        selectedFile={inputFile}
        onSelect={handleSelectFile}
        disabled={isConverting}
      />

      {/* Output Directory */}
      <DirectorySelector
        selectedDir={outputDir}
        onSelect={handleSelectDir}
        disabled={isConverting}
      />

      {/* Advanced Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings2 className="h-4 w-4" />
            Opções avançadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* FPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">FPS</label>
              <span className="text-sm font-medium">{fps}</span>
            </div>
            <Slider
              value={[fps]}
              onValueChange={([v]) => setFps(v)}
              min={5}
              max={30}
              step={1}
              disabled={isConverting}
            />
          </div>

          <Separator />

          {/* Width */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-muted-foreground w-40 shrink-0">
              Largura (px)
            </label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={100}
              max={1920}
              disabled={isConverting}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Quality */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-muted-foreground w-40 shrink-0">
              Qualidade
            </label>
            <Select
              value={quality}
              onValueChange={(v) => setQuality(v as ConversionOptions["quality"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa (menor arquivo)</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta (melhor qualidade)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Progress */}
      <ConversionProgress status={status} progress={progress} message={message} />

      {/* Action Buttons */}
      <div className="flex gap-3">
        {status === "done" || status === "error" ? (
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Nova conversão
          </Button>
        ) : (
          <Button
            onClick={handleConvert}
            disabled={!canConvert}
            className="flex-1"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            {isConverting ? "Convertendo..." : "Converter"}
          </Button>
        )}
      </div>
    </div>
  );
}
