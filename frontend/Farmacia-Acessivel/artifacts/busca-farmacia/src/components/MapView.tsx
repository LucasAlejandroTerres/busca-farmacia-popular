import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Farmacia } from "@/data/mock";

import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const goldIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 46], iconAnchor: [15, 46], popupAnchor: [1, -38], shadowSize: [41, 41],
});

/** Pin "Você está aqui" com label acima usando DivIcon customizado */
const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="
        background:#1d4ed8;
        color:#fff;
        font-size:11px;
        font-weight:700;
        padding:3px 8px;
        border-radius:999px;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        letter-spacing:0.02em;
      ">📍 Você está aqui</div>
      <img
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
        style="width:25px;height:41px;display:block"
      />
    </div>
  `,
  iconSize: [80, 72],
  iconAnchor: [40, 72],
  popupAnchor: [0, -72],
});

interface MapViewProps {
  farmacias: Farmacia[];
  selectedId?: number | null;
  userLocation?: { lat: number; lng: number } | null;
  hasBairro?: boolean;
  isLoading?: boolean;
  gpsMode?: boolean;
  searchId?: number;
}

/** Voa para a localização do usuário quando ela muda — zoom 15 (quarteirão) */
function FlyToUser({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef<string>("");
  useEffect(() => {
    const key = `${lat},${lng}`;
    if (key !== prev.current) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
      prev.current = key;
    }
  }, [lat, lng, map]);
  return null;
}

/** Voa para a farmácia selecionada quando o card é clicado */
function FlyToSelected({ farmacias, selectedId }: { farmacias: Farmacia[]; selectedId?: number | null }) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevId.current) return;
    prevId.current = selectedId;

    const f = farmacias.find((x) => x.id === selectedId);
    if (f?.lat && f?.lng) {
      map.flyTo([f.lat, f.lng], 16, { duration: 0.9 });
    }
  }, [selectedId, farmacias, map]);
  return null;
}

/** Ajusta o mapa para abranger todos os marcadores.
 *  Usa o padrão key={searchId} para garantir remonta limpa a cada nova busca. */
function FitBounds({ farmacias, zoomBairro }: { farmacias: Farmacia[]; zoomBairro?: boolean }) {
  const map = useMap();

  useEffect(() => {
    const valid = farmacias.filter((f) => f.lat && f.lng);
    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.flyTo([valid[0].lat, valid[0].lng], zoomBairro ? 16 : 15, { duration: 1 });
    } else if (zoomBairro) {
      const bounds = L.latLngBounds(valid.map((f) => [f.lat, f.lng]));
      map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 15, duration: 1 });
    } else {
      const bounds = L.latLngBounds(valid.map((f) => [f.lat, f.lng]));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
    }
  }, [farmacias, map, zoomBairro]);
  return null;
}

function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}


export function MapView({ farmacias, selectedId, userLocation, hasBairro, isLoading, gpsMode, searchId }: MapViewProps) {
  const defaultCenter: [number, number] = [-14.235, -51.925];
  const defaultZoom = 4;

  return (
    <div
      className="relative w-full h-[400px] md:h-[520px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ isolation: "isolate" /* cria stacking context isolado — Leaflet não vaza sobre o header */ }}
    >

      {/* Overlay de carregamento */}
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold text-green-800">Buscando farmácias...</p>
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Pin de localização do usuário com label customizado */}
        {userLocation && (
          <>
            <FlyToUser lat={userLocation.lat} lng={userLocation.lng} />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup>
                <strong>📍 Você está aqui</strong>
              </Popup>
            </Marker>
          </>
        )}

        {/* Voa para a farmácia ao clicar no card */}
        <FlyToSelected farmacias={farmacias} selectedId={selectedId} />

        {/* FitBounds só no modo filtro manual.
            key={searchId} força remonta limpa a cada nova busca. */}
        {farmacias.length > 0 && !gpsMode && (
          <FitBounds
            key={searchId ?? 0}
            farmacias={farmacias}
            zoomBairro={hasBairro}
          />
        )}

        {farmacias.map((f) => (
          f.lat && f.lng ? (
            <Marker
              key={f.id}
              position={[f.lat, f.lng]}
              icon={selectedId === f.id ? goldIcon : greenIcon}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 4 }}>
                    {f.nome}
                  </p>
                  <p style={{ fontSize: 12, color: "#4B5563", marginBottom: 2 }}>
                    {[f.bairro, f.cidade, f.uf].filter(Boolean).join(" — ")}
                  </p>
                  {f.distancia !== undefined && (
                    <span style={{
                      display: "inline-block", marginTop: 4,
                      background: "#dcfce7", color: "#15803d",
                      fontSize: 11, fontWeight: 600,
                      padding: "2px 8px", borderRadius: 999,
                    }}>
                      {f.distancia} km de você
                    </span>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={googleMapsUrl(f.lat, f.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "#16a34a", color: "#fff",
                        fontWeight: 700, fontSize: 12,
                        padding: "5px 12px", borderRadius: 8, textDecoration: "none",
                      }}
                    >
                      📍 Como chegar
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
