import { MapPin, Navigation } from "lucide-react";
import type { Farmacia } from "@/data/mock";

interface FarmaciaCardProps {
  farmacia: Farmacia;
  onClick?: () => void;
  selected?: boolean;
}

function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function FarmaciaCard({ farmacia, onClick, selected }: FarmaciaCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-4 border transition-all ${
        selected
          ? "border-green-500 bg-green-50 shadow-md"
          : "border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-green-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-gray-900 text-lg leading-snug">{farmacia.nome}</h3>
        {farmacia.distancia !== undefined && (
          <span className="shrink-0 inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            <MapPin className="w-3.5 h-3.5" />
            {farmacia.distancia}km
          </span>
        )}
      </div>
      <p className="text-gray-600 text-base mb-1">
        {farmacia.endereco} — {farmacia.bairro}
      </p>
      <p className="text-gray-500 text-sm">
        {farmacia.cidade} / {farmacia.uf}
      </p>
      <a
        href={googleMapsUrl(farmacia.lat, farmacia.lng)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-3 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
      >
        <Navigation className="w-3.5 h-3.5" />
        Como chegar
      </a>
    </div>
  );
}
