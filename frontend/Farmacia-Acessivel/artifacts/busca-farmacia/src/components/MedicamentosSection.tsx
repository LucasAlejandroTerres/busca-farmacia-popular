import { useState } from "react";
import { Search, X, CheckCircle2 } from "lucide-react";
import { MEDICAMENTOS_MOCK, type Medicamento, type CategoriaRemedio } from "@/data/mock";

const CATEGORIAS: Array<"Todos" | CategoriaRemedio> = [
  "Todos",
  "Hipertensão",
  "Diabetes",
  "Asma",
  "Anticoncepção",
  "Dislipidemia",
  "Osteoporose",
  "Doença de Parkinson",
  "Glaucoma",
  "Rinite",
  "Diabetes Mellitus + Doença Cardiovascular",
  "Dignidade e Bem-Estar",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Hipertensão":                               "bg-red-50 text-red-700 border-red-200",
  "Diabetes":                                  "bg-blue-50 text-blue-700 border-blue-200",
  "Diabetes Mellitus + Doença Cardiovascular": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Asma":                                      "bg-purple-50 text-purple-700 border-purple-200",
  "Rinite":                                    "bg-violet-50 text-violet-700 border-violet-200",
  "Dislipidemia":                              "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Anticoncepção":                             "bg-pink-50 text-pink-700 border-pink-200",
  "Osteoporose":                               "bg-amber-50 text-amber-700 border-amber-200",
  "Doença de Parkinson":                       "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Glaucoma":                                  "bg-teal-50 text-teal-700 border-teal-200",
  "Dignidade e Bem-Estar":                     "bg-orange-50 text-orange-700 border-orange-200",
};

const PAGE_SIZE = 5;

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function MedicamentosSection() {
  const [categoria, setCategoria] = useState<"Todos" | CategoriaRemedio>("Todos");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);

  const termo = normalizar(busca.trim());

  const filtrados = MEDICAMENTOS_MOCK.filter((m) => {
    const matchCategoria = categoria === "Todos" || m.categoria === categoria;
    const matchBusca = !termo || normalizar(m.principioAtivo).includes(termo) || m.nomesComerciais?.some(n => normalizar(n).includes(termo));
    return matchCategoria && matchBusca;
  });

  const paginados = filtrados.slice(0, page * PAGE_SIZE);
  const hasMore = page * PAGE_SIZE < filtrados.length;
  const buscaAtiva = busca.trim().length > 0;

  function handleCategoria(cat: "Todos" | CategoriaRemedio) {
    setCategoria(cat);
    setPage(1);
  }

  function limparBusca() {
    setBusca("");
    setPage(1);
  }

  return (
    <section id="medicamentos" className="py-24 px-4 bg-slate-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Remédios <span className="text-green-600">100% Gratuitos</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Consulte a lista oficial pesquisando por ativo ou nome comercial.
          </p>
        </div>

        {/* Barra de busca e filtros aprimorada c/ bordas ativas */}
        <div className="max-w-3xl mx-auto mb-10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPage(1); }}
              placeholder="Ex: Metformina, Glifage, Losartana..."
              className="w-full pl-11 pr-11 py-3.5 text-base rounded-2xl bg-white border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50/50 placeholder:text-gray-400 transition-all font-medium text-gray-800 shadow-sm"
            />
            {buscaAtiva && (
              <button
                onClick={limparBusca}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Limpar busca"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="sm:w-64 shrink-0">
            <select
              value={categoria}
              onChange={(e) => handleCategoria(e.target.value as any)}
              className="w-full py-3.5 px-4 text-base text-gray-700 bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50/50 transition-all font-medium appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
            >
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Resultados em lista fluida estilo bulário */}
        {filtrados.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-xl font-bold text-gray-700 mb-1">Nenhum resultado</p>
            <p className="text-gray-500">Tente buscar por outro nome ou princípio ativo.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden ring-1 ring-black/5">
            <ul className="divide-y divide-gray-100">
              {paginados.map((med) => (
                <li key={med.id} className="p-4 sm:px-6 hover:bg-slate-100/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-start gap-4">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border shrink-0 w-fit sm:self-center ${CATEGORY_COLORS[med.categoria] || "bg-gray-100 text-gray-600"}`}>
                    {med.categoria}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 text-[17px] capitalize">
                      {highlight(med.principioAtivo, termo)}
                    </p>
                    {med.nomesComerciais && med.nomesComerciais.length > 0 && (
                      <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wide">
                        Referência: <span className="font-bold text-gray-600">{highlight(med.nomesComerciais.join(", "), termo)}</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            
            {hasMore ? (
              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="font-bold text-green-700 hover:text-green-800 text-sm hover:underline underline-offset-4 px-4 py-2"
                >
                  Carregar mais ({filtrados.length - page * PAGE_SIZE} itens restantes)
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fim da lista</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function highlight(texto: string, termo: string) {
  if (!termo) return <>{texto}</>;
  const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const partes = texto.split(regex);
  return (
    <>
      {partes.map((parte, i) =>
        normalizar(parte) === termo ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5 not-italic">
            {parte}
          </mark>
        ) : (
          parte
        )
      )}
    </>
  );
}
