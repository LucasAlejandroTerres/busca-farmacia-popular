import { createClient } from "@supabase/supabase-js";

// Pegamos as informações das variáveis de ambiente (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltam as variáveis de ambiente do Supabase!");
}

// Criamos a "ponte" de conexão (cliente) que será usada na nossa aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
