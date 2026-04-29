import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Info, Loader2, ChevronDown } from "lucide-react";
import { MapView } from "./MapView";
import { FarmaciaCard } from "./FarmaciaCard";
import { FARMACIAS_MOCK, ESTADOS_BRASIL } from "@/data/mock";
import { useFarmacias, useFarmaciasProximas, useCidades, useBairros } from "@/hooks/useFarmacias";

interface BuscaSectionProps {
  locationActive: boolean;
  userLocation: { lat: number; lng: number } | null;
}

// ─── Utilitários de texto ──────────────────────────────────────────────────────

/** Remove acentos e converte para minúsculas — para comparação insensível a acento */
function semAcento(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Converte "SAO PAULO" → "Sao Paulo" (Title Case) para exibição mais agradável */
function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Componente reutilizável: campo de texto com dropdown ─────────────────────
interface AutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  opcoes: string[];
  opcional?: boolean;
  onInputChange: (v: string) => void;
  onSelect: (rawValue: string) => void;
}

function Autocomplete({ label, placeholder, value, opcoes, opcional, onInputChange, onSelect }: AutocompleteProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Filtra ignorando acentos de ambos os lados: digitar "sao paulo" acha "SAO PAULO"
  const filtradas = opcoes.filter((o) => semAcento(o).includes(semAcento(value)));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{" "}
        {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onInputChange(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-9 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {aberto && filtradas.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-52 overflow-y-auto">
          {filtradas.map((o) => (
            <li
              key={o}
              onMouseDown={() => { onSelect(o); setAberto(false); }}
              className="px-4 py-2.5 text-sm text-gray-800 cursor-pointer hover:bg-green-50 hover:text-green-800 first:rounded-t-xl last:rounded-b-xl"
            >
              {/* Exibe em Title Case: "SAO PAULO" vira "Sao Paulo" */}
              {titleCase(o)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── BuscaSection principal ────────────────────────────────────────────────────
export function BuscaSection({ locationActive, userLocation }: BuscaSectionProps) {
  const [uf, setUf] = useState("PR");

  // Cidade
  const [cidadeInput, setCidadeInput] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");

  // Bairro
  const [bairroInput, setBairroInput] = useState("");
  const [bairroSelecionado, setBairroSelecionado] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Busca ativa (só dispara quando o usuário clica em Buscar)
  const [activeSearch, setActiveSearch] = useState<{ uf: string; cidade: string; bairro: string } | null>(null);
  const [searched, setSearched] = useState(false);
  // searchId incrementa a cada busca — garante que FitBounds sempre re-dispara
  const [searchId, setSearchId] = useState(0);
  // Quando true, a busca manual tem prioridade sobre o GPS
  const [manualOverride, setManualOverride] = useState(false);

  // Autocomplete: cidades filtradas por UF
  const { data: listaCidades = [] } = useCidades(uf);

  // Autocomplete: bairros filtrados por UF + cidade selecionada
  const { data: listaBairros = [] } = useBairros(uf, cidadeSelecionada || cidadeInput);

  // Busca normal (filtros)
  const { data: resultadosFiltro, isLoading: loadingFiltro, error: errorFiltro } = useFarmacias(
    activeSearch?.uf,
    activeSearch?.cidade,
    activeSearch?.bairro
  );

  // Busca por GPS — só habilita quando userLocation já chegou
  const gpsLat = (locationActive && userLocation) ? userLocation.lat : null;
  const gpsLng = (locationActive && userLocation) ? userLocation.lng : null;
  const { data: resultadosProximos, isLoading: loadingProximos, error: errorProximos } = useFarmaciasProximas(
    gpsLat,
    gpsLng,
    5
  );

  // GPS ativo = locationActive E o usuário não clicou em "Buscar" manualmente depois
  const modoGPS = locationActive && !manualOverride;

  // loadingGPS só é true quando temos coords e a query está rodando
  const loadingGPS = modoGPS && gpsLat !== null && loadingProximos;

  const farmaciasVisiveis = modoGPS
    ? (resultadosProximos ?? [])
    : searched
    ? (resultadosFiltro ?? [])
    : FARMACIAS_MOCK;

  const isLoading = modoGPS ? loadingGPS : loadingFiltro;
  const error = modoGPS ? errorProximos : errorFiltro;


  // Zoom de bairro quando há filtro de bairro ativo
  const hasBairro = !!(activeSearch?.bairro);

  function handleUfChange(novaUf: string) {
    setUf(novaUf);
    setCidadeInput(""); setCidadeSelecionada("");
    setBairroInput(""); setBairroSelecionado("");
  }

  function handleCidadeSelect(c: string) {
    setCidadeInput(c); setCidadeSelecionada(c);
    setBairroInput(""); setBairroSelecionado(""); // limpa bairro ao trocar cidade
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setManualOverride(true); // busca manual assume prioridade sobre GPS
    setActiveSearch({
      uf,
      cidade: cidadeSelecionada || cidadeInput,
      bairro: bairroSelecionado || bairroInput,
    });
    setSearched(true);
    setSelectedId(null);
    setSearchId((n) => n + 1);
  }

  // Limite de cards exibidos — cresce ao clicar "Ver mais"
  const [limite, setLimite] = useState(3);
  const mapRef = useRef<HTMLDivElement>(null);

  // Reseta o limite quando há nova busca
  useEffect(() => { setLimite(3); }, [searchId]);

  // Quando o usuário clica em "Localização Atual", volta ao modo GPS.
  // Observa TAMBÉM userLocation: mesmo que locationActive já seja true, um novo
  // clique no GPS cria um novo objeto userLocation, disparando o reset.
  useEffect(() => {
    if (locationActive) setManualOverride(false);
  }, [locationActive, userLocation]);

  const farmaciasExibidas = farmaciasVisiveis.slice(0, limite);
  const temMais = farmaciasVisiveis.length > limite;
  const restantes = farmaciasVisiveis.length - limite;

  const mostrando = farmaciasVisiveis.length;
  const mostandoTexto = modoGPS
    ? `${mostrando} farmácia${mostrando !== 1 ? "s" : ""} num raio de 5 km`
    : searched && !isLoading
    ? `${mostrando} resultado${mostrando !== 1 ? "s" : ""} encontrado${mostrando !== 1 ? "s" : ""}`
    : null;

  function handleCardClick(id: number) {
    setSelectedId(id === selectedId ? null : id);
    // Rola suavemente até o mapa em qualquer dispositivo
    setTimeout(() => {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  return (
    <section id="buscar" className="py-10 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Buscar Farmácias Credenciadas
        </h2>

        {/*
          Desktop: sidebar (form) | coluna direita (mapa + lista grade)
          Mobile:  form → mapa → lista vertical
        */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar: só o formulário ── */}
          <div className="lg:w-72 shrink-0">
            <form
              onSubmit={handleSearch}
              className="bg-gray-50 rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 sticky top-4"
            >
              {modoGPS && (
                <div className="flex items-center gap-2 bg-green-50 text-green-800 rounded-xl px-3 py-2.5 text-sm font-semibold border border-green-200">
                  <MapPin className="w-4 h-4 shrink-0" />
                  Localização ativa — raio de 5 km
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado (UF)</label>
                <select
                  value={uf}
                  onChange={(e) => handleUfChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Todos</option>
                  {ESTADOS_BRASIL.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Autocomplete
                label="Cidade" placeholder="Digite ou selecione..."
                value={cidadeInput} opcoes={listaCidades}
                onInputChange={(v) => { setCidadeInput(v); setCidadeSelecionada(""); }}
                onSelect={handleCidadeSelect}
              />
              <Autocomplete
                label="Bairro" placeholder="Digite ou selecione..."
                value={bairroInput} opcoes={listaBairros} opcional
                onInputChange={(v) => { setBairroInput(v); setBairroSelecionado(""); }}
                onSelect={(b) => { setBairroInput(b); setBairroSelecionado(b); }}
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-3 rounded-xl transition-colors shadow-sm"
              >
                <Search className="w-5 h-5" />
                Buscar Farmácias
              </button>
            </form>
          </div>

          {/* ── Coluna direita: mapa + lista abaixo ── */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Mapa */}
            <div id="mapa" ref={mapRef} className="scroll-mt-24">
              <MapView
                farmacias={farmaciasVisiveis}
                selectedId={searched || modoGPS ? selectedId : null}
                userLocation={modoGPS ? userLocation : null}
                hasBairro={hasBairro}
                gpsMode={modoGPS}
                isLoading={isLoading && (searched || modoGPS)}
                searchId={searchId}
              />
            </div>

            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <Info className="w-4 h-4 text-green-700 shrink-0" />
              <p className="text-green-900 text-sm font-semibold">
                Clique nos pinos verdes para ver detalhes e rotas de cada farmácia.
              </p>
            </div>

            {/* Contagem */}
            {mostandoTexto && (
              <p className="text-xs font-semibold text-gray-500 text-center">{mostandoTexto}</p>
            )}

            {/* Estados de loading / erro / vazio */}
            {isLoading && (modoGPS || searched) && (
              <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-green-600" />
                <p className="text-base font-medium">Buscando na base oficial...</p>
              </div>
            )}
            {error && (
              <div className="text-center text-red-500 py-6">
                <p className="text-lg font-medium">Erro ao buscar dados</p>
                <p className="text-sm mt-1">Tente novamente mais tarde.</p>
              </div>
            )}
            {!isLoading && !error && farmaciasVisiveis.length === 0 && (modoGPS || searched) && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-base font-medium">Nenhuma farmácia encontrada</p>
                <p className="text-sm mt-1">
                  {modoGPS ? "Nenhuma farmácia num raio de 5 km." : "Tente buscar por outra cidade ou UF."}
                </p>
              </div>
            )}

            {/* Grade de cards: 1 col mobile · 2 col tablet · 3 col desktop */}
            {!isLoading && !error && farmaciasExibidas.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {farmaciasExibidas.map((f) => (
                  <FarmaciaCard
                    key={f.id}
                    farmacia={f}
                    selected={selectedId === f.id}
                    onClick={() => handleCardClick(f.id)}
                  />
                ))}
              </div>
            )}

            {/* Botão Ver mais */}
            {!isLoading && !error && temMais && (
              <button
                onClick={() => setLimite((l) => l + 6)}
                className="w-full py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-800 text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                Ver mais {Math.min(restantes, 6)} resultado{restantes !== 1 ? "s" : ""} (ainda {restantes} no total)
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}



