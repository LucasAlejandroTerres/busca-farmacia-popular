import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onUseLocation: () => void;
  loading: boolean;
}

export function HeroSection({ onUseLocation, loading }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-b from-green-50 to-white pt-24 pb-12 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="pt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Encontre farmácias credenciadas ao{" "}
            <span className="text-green-600">Farmácia Popular</span>
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
          Localize os pontos de retirada de remédios gratuitos{" "}
          <strong>perto de você.</strong>
        </p>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-lg shadow-green-200 transition-all hover:shadow-green-300 hover:scale-105 w-full sm:w-auto"
          onClick={onUseLocation}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-6 h-6 mr-2" />
          )}
          {loading ? "Buscando farmácias próximas..." : "Usar minha localização atual"}
        </Button>
        <p className="mt-4 text-gray-400 text-base">
          ou pesquise por cidade logo abaixo
        </p>
      </div>
    </section>
  );
}
