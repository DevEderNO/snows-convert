import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, Zap, Shield, Cpu } from "lucide-react";
import { Header } from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Alta Qualidade",
    description: "Pipeline de 2 passes com palette generation para GIFs com cores superiores.",
  },
  {
    icon: Cpu,
    title: "Multi-thread",
    description: "Conversões rodam em threads separadas, sem travar a interface.",
  },
  {
    icon: Shield,
    title: "FFmpeg Integrado",
    description: "FFmpeg empacotado com o app. Sem necessidade de instalação externa.",
  },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <Header
        title="Bem-vindo ao Snows Convert"
        description="Converta seus vídeos MP4 para GIF animado com alta qualidade."
      />

      {/* Hero Card */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 text-primary animate-pulse-glow">
            <ArrowRightLeft className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold">MP4 → GIF</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Transforme seus vídeos em GIFs animados perfeitos para compartilhar.
              Controle FPS, dimensões e qualidade.
            </p>
          </div>
          <Button
            size="lg"
            className="mt-2"
            onClick={() => navigate("/convert")}
          >
            <ArrowRightLeft className="mr-2 h-5 w-5" />
            Iniciar Conversão
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="transition-all duration-200 hover:border-primary/20 hover:-translate-y-0.5">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
