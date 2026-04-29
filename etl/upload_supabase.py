import pandas as pd
import requests
import os
import math
from dotenv import load_dotenv

# ─── Configurações ───────────────────────────────────────────────────────────

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL ou SUPABASE_SECRET_KEY não encontrados no .env")

INPUT_FILE = os.path.join("data", "farmacias_geocoded.csv")
TABELA     = "farmacias"
BATCH_SIZE = 500  # registros por request

HEADERS = {
    "apikey":        SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=minimal",
}

# ─── Preparação dos dados ─────────────────────────────────────────────────────

def preparar_df(df: pd.DataFrame) -> pd.DataFrame:
    # Só sobe as geocodificadas com precisão real
    df = df[df["geocode_status"] == "sucesso"].copy()

    # Converte lat/lng pra float
    df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
    df["lng"] = pd.to_numeric(df["lng"], errors="coerce")

    # Remove as que ficaram sem coordenada após conversão
    df = df.dropna(subset=["lat", "lng"])

    # tem_numero vira boolean real
    if "tem_numero" in df.columns:
        df["tem_numero"] = df["tem_numero"].map(
            {"True": True, "False": False, True: True, False: False}
        )

    # Seleciona só as colunas que existem na tabela
    colunas = [
        "uf", "cod_municipio", "municipio", "cnpj", "farmacia",
        "endereco", "bairro", "data_credenciamento",
        "tem_numero", "geocode_status", "endereco_completo",
        "lat", "lng"
    ]
    colunas_existentes = [c for c in colunas if c in df.columns]
    df = df[colunas_existentes]

    # Substitui NaN por None (vira null no JSON)
    df = df.where(pd.notna(df), None)

    return df

# ─── Upload em batches ────────────────────────────────────────────────────────

def upload_batch(registros: list, batch_num: int, total_batches: int) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/{TABELA}"
    resp = requests.post(url, headers=HEADERS, json=registros, timeout=30)

    if resp.status_code in (200, 201):
        return True
    else:
        print(f"\n  [!] Erro no batch {batch_num}: {resp.status_code} — {resp.text[:200]}")
        return False

def main():
    print(f"Carregando {INPUT_FILE}...")
    df_raw = pd.read_csv(INPUT_FILE, dtype=str)
    print(f"Total no CSV: {len(df_raw)} registros")

    df = preparar_df(df_raw)
    print(f"Com geocodificação exata: {len(df)} registros — esses vão pro Supabase\n")

    registros = df.to_dict(orient="records")
    total_batches = math.ceil(len(registros) / BATCH_SIZE)
    sucessos = 0
    falhas   = 0

    for i in range(total_batches):
        inicio = i * BATCH_SIZE
        fim    = inicio + BATCH_SIZE
        batch  = registros[inicio:fim]

        print(f"[{i+1}/{total_batches}] Enviando registros {inicio+1}–{min(fim, len(registros))}...", end=" ")

        if upload_batch(batch, i + 1, total_batches):
            sucessos += len(batch)
            print("✅")
        else:
            falhas += len(batch)
            print("❌")

    print("\n" + "─" * 50)
    print("✅ UPLOAD CONCLUÍDO")
    print("─" * 50)
    print(f"  Enviados com sucesso: {sucessos}")
    print(f"  Com falha:           {falhas}")
    print(f"\nVerifique em: {SUPABASE_URL}/project/default/editor")

if __name__ == "__main__":
    main()