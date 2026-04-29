import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Farmacia } from '../data/mock';

// ─── Busca por filtros (UF, cidade, bairro) ───────────────────────────────────
export function useFarmacias(uf?: string, cidade?: string, bairro?: string) {
  return useQuery({
    queryKey: ['farmacias', uf, cidade, bairro],
    queryFn: async () => {
      let query = supabase.from('farmacias').select('*').limit(200);

      if (uf) query = query.eq('uf', uf);
      if (cidade) query = query.ilike('municipio', `%${cidade}%`);
      if (bairro) query = query.ilike('bairro', `%${bairro}%`);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return mapRows(data);
    },
    enabled: !!(uf || cidade || bairro),
  });
}

// ─── Busca por proximidade (lat/lng + raio em km) ─────────────────────────────
export function useFarmaciasProximas(
  lat: number | null,
  lng: number | null,
  raioKm: number = 5
) {
  return useQuery({
    queryKey: ['farmacias-proximas', lat, lng, raioKm],
    queryFn: async () => {
      if (lat === null || lng === null) return [];

      const BUSCA_KM = raioKm * 4; // margem generosa para bounding box
      const deltaLat = BUSCA_KM / 111;
      const deltaLng = BUSCA_KM / (111 * Math.cos(lat * Math.PI / 180));

      const latMin = lat - deltaLat;
      const latMax = lat + deltaLat;
      const lngMin = lng - deltaLng;
      const lngMax = lng + deltaLng;

      // ── Estratégia 1: cast float8 via PostgREST ──────────────────────────
      // Funciona corretamente mesmo quando a coluna lat/lng é TEXT no banco,
      // pois o PostgreSQL converte antes de comparar.
      const { data: castData, error: castError } = await supabase
        .from('farmacias')
        .select('*')
        .filter('lat::float8', 'gte', latMin)
        .filter('lat::float8', 'lte', latMax)
        .filter('lng::float8', 'gte', lngMin)
        .filter('lng::float8', 'lte', lngMax)
        .limit(500);

      let candidatos: any[] = [];

      if (!castError && castData && castData.length > 0) {
        candidatos = castData;
      } else {
        // ── Estratégia 2: fallback — 2 páginas em paralelo ───────────────
        // Busca 2000 registros em paralelo para aumentar a cobertura
        const [p1, p2] = await Promise.all([
          supabase.from('farmacias').select('*').range(0, 999),
          supabase.from('farmacias').select('*').range(1000, 1999),
        ]);

        if (p1.data) candidatos = candidatos.concat(p1.data);
        if (p2.data) candidatos = candidatos.concat(p2.data);
      }

      if (candidatos.length === 0) return [];

      // Filtra com Haversine (preciso, independe do tipo da coluna)
      const rows = mapRows(candidatos);
      return rows
        .filter((f) => !isNaN(f.lat) && !isNaN(f.lng))
        .map((f) => ({ ...f, distancia: haversineKm(lat, lng, f.lat, f.lng) }))
        .filter((f) => f.distancia <= raioKm)
        .sort((a, b) => a.distancia - b.distancia);
    },
    enabled: lat !== null && lng !== null,
    retry: false,            // não tenta de novo em caso de erro — evita loading eterno
    staleTime: 2 * 60 * 1000,
  });
}


// ─── Lista de cidades únicas por UF (para autocomplete) ───────────────────────
// IMPORTANTE: só busca quando UF estiver selecionada — evita paginação de todo o Brasil
export function useCidades(uf?: string) {
  return useQuery({
    queryKey: ['cidades', uf],
    queryFn: async () => {
      if (!uf) return [];

      const PAGE = 1000;
      let from = 0;
      let allData: string[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('farmacias')
          .select('municipio')
          .eq('uf', uf)
          .range(from, from + PAGE - 1)
          .order('municipio');

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) break;

        allData = allData.concat(data.map((d: any) => d.municipio as string));
        if (data.length < PAGE) break; // última página
        from += PAGE;
      }

      return Array.from(new Set(allData)).filter(Boolean).sort();
    },
    enabled: !!uf,            // ← só busca quando UF for selecionada
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Lista de bairros únicos por UF + cidade (para autocomplete) ──────────────
export function useBairros(uf?: string, cidade?: string) {
  return useQuery({
    queryKey: ['bairros', uf, cidade],
    queryFn: async () => {
      if (!uf || !cidade) return [];

      const PAGE = 1000;
      let from = 0;
      let allData: string[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('farmacias')
          .select('bairro')
          .eq('uf', uf)
          .ilike('municipio', `%${cidade}%`)
          .range(from, from + PAGE - 1)
          .order('bairro');

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) break;

        allData = allData.concat(data.map((d: any) => d.bairro as string));
        if (data.length < PAGE) break;
        from += PAGE;
      }

      return Array.from(new Set(allData)).filter(Boolean).sort();
    },
    enabled: !!uf && !!cidade,  // ← só busca quando ambos estiverem preenchidos
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapRows(data: any[]): Farmacia[] {
  return data.map((item: any) => ({
    id: item.id ?? Math.random(),
    nome: item.farmacia || 'Farmácia sem nome',
    endereco: item.endereco || 'Endereço não informado',
    bairro: item.bairro || '',
    cidade: item.municipio || '',
    uf: item.uf || '',
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lng),
    telefone: item.telefone || '',
    distancia: undefined,
  }));
}

/** Fórmula de Haversine — retorna distância em km entre dois pontos GPS */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
