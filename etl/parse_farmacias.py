import requests
import pandas as pd
import unicodedata
import re
import os
from io import BytesIO

# ─── Configurações ───────────────────────────────────────────────────────────

URL_XLSX = (
    "https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular"
    "/publicacoes/farmacias_credenciadas_pfpb_atualizada.xlsx"
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "farmacias_clean.csv")

# ─── Utilitários ──────────────────────────────────────────────────────────────

def normalizar(texto: str) -> str:
    """Remove acentos e converte pra minúsculo — usado pra comparar nomes de colunas."""
    return unicodedata.normalize("NFKD", str(texto)).encode("ascii", "ignore").decode("ascii").lower().strip()

# ─── Download ─────────────────────────────────────────────────────────────────

def download_xlsx(url: str) -> BytesIO:
    print(f"Baixando XLSX de: {url}")
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    print(f"Download concluído ({len(response.content) / 1024:.1f} KB)")
    return BytesIO(response.content)

# ─── Parse ────────────────────────────────────────────────────────────────────

def parse_xlsx(file: BytesIO) -> pd.DataFrame:
    """
    O XLSX do gov.br tem linhas de cabeçalho institucionais antes da tabela real.
    Procuramos a linha que contém 'UF' para encontrar onde começa o dado de fato.
    """
    raw = pd.read_excel(file, header=None, dtype=str)

    header_row = None
    for i, row in raw.iterrows():
        if row.astype(str).str.strip().eq("UF").any():
            header_row = i
            break

    if header_row is None:
        raise ValueError("Não foi possível encontrar o cabeçalho da tabela no XLSX.")

    print(f"Cabeçalho encontrado na linha {header_row}")

    file.seek(0)
    df = pd.read_excel(file, header=header_row, dtype=str)
    return df

# ─── Limpeza ──────────────────────────────────────────────────────────────────

def renomear_colunas(df: pd.DataFrame) -> pd.DataFrame:
    """
    Renomeia colunas usando matching por substring normalizada (sem acentos).
    Robusto contra variações entre versões do XLSX.
    """
    keyword_map = {
    "cod": "cod_municipio",   # deve vir antes de "municipio"
    "municipio": "municipio",
    "cnpj": "cnpj",
    "farmacia": "farmacia",
    "endereco": "endereco",
    "bairro": "bairro",
    "credenciamento": "data_credenciamento",
    "uf": "uf",
}

    rename_result = {}
    usados = set()

    for col in df.columns:
        col_norm = normalizar(col)
        for keyword, target in keyword_map.items():
            if keyword in col_norm and target not in usados:
                rename_result[col] = target
                usados.add(target)
                break

    df = df.rename(columns=rename_result)
    print("Colunas mapeadas:", rename_result)
    return df


def tem_numero_endereco(endereco) -> bool:
    """Verifica se o endereço contém algum número."""
    if pd.isna(endereco):
        return False
    return bool(re.search(r'\d', str(endereco)))


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = df.columns.str.strip()
    df = renomear_colunas(df)

    df = df.dropna(how="all")

    if "uf" in df.columns:
        df = df[df["uf"].str.strip().str.len() == 2]

    str_cols = df.select_dtypes(include="object").columns
    df[str_cols] = df[str_cols].apply(lambda col: col.str.strip())

    # ── Flag de qualidade do endereço ──
    if "endereco" in df.columns:
        df["tem_numero"] = df["endereco"].apply(tem_numero_endereco)
        df["geocode_status"] = df["tem_numero"].map({True: "pendente", False: "sem_numero"})
    else:
        df["tem_numero"] = False
        df["geocode_status"] = "sem_endereco"

    # ── Endereço completo para geocodificação ──
    def montar_endereco_completo(row):
        partes = [
            row.get("endereco", ""),
            row.get("bairro", ""),
            row.get("municipio", ""),
            row.get("uf", ""),
            "Brasil",
        ]
        return ", ".join([str(p) for p in partes if pd.notna(p) and str(p).strip()])

    df["endereco_completo"] = df.apply(montar_endereco_completo, axis=1)

    df["lat"] = None
    df["lng"] = None

    return df

# ─── Export ───────────────────────────────────────────────────────────────────

def export(df: pd.DataFrame):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
    print(f"\nArquivo salvo em: {OUTPUT_FILE}")
    print(f"Total de registros: {len(df)}")
    print(f"  Com número no endereço: {df['tem_numero'].sum()}")
    print(f"  Sem número (flagados):  {(~df['tem_numero']).sum()}")

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    file = download_xlsx(URL_XLSX)
    df = parse_xlsx(file)
    df = clean(df)
    export(df)

    cols_preview = ["uf", "municipio", "farmacia", "endereco", "geocode_status"]
    cols_existentes = [c for c in cols_preview if c in df.columns]
    print("\nPrimeiras linhas do resultado:")
    print(df[cols_existentes].head(10).to_string())

if __name__ == "__main__":
    main()