import pandas as pd
import requests
import time
import os
import re
import unicodedata
from dotenv import load_dotenv

# ─── Configurações ───────────────────────────────────────────────────────────

load_dotenv()
API_KEY = os.getenv("GOOGLE_GEOCODING_API_KEY")

if not API_KEY:
    raise ValueError("Chave do Google não encontrada. Verifique o arquivo .env")

INPUT_FILE  = os.path.join("data", "farmacias_clean.csv")
OUTPUT_FILE = os.path.join("data", "farmacias_geocoded.csv")

PRECISAO_ACEITA = {"ROOFTOP", "RANGE_INTERPOLATED"}
MAX_RETRIES     = 3

# ─── Limpeza de endereço ─────────────────────────────────────────────────────

ABREVIACOES = {
    r'\bR\b\.?':        'RUA',
    r'\bAV\b\.?':       'AVENIDA',
    r'\bAVE\b\.?':      'AVENIDA',
    r'\bALM\b\.?':      'ALMIRANTE',
    r'\bCEL\b\.?':      'CORONEL',
    r'\bCOL\b\.?':      'CORONEL',
    r'\bDR\b\.?':       'DOUTOR',
    r'\bDRA\b\.?':      'DOUTORA',
    r'\bEST\b\.?':      'ESTRADA',
    r'\bROD\b\.?':      'RODOVIA',
    r'\bTRAV\b\.?':     'TRAVESSA',
    r'\bPC\b\.?':       'PRACA',
    r'\bPCA\b\.?':      'PRACA',
    r'\bPRA\b\.?':      'PRACA',
    r'\bPRCA\b\.?':     'PRACA',
    r'\bLG\b\.?':       'LARGO',
    r'\bVIA\b\.?\s':    'VIA ',
    r'\bCOND\b\.?':     'CONDOMINIO',
    r'\bLOT\b\.?':      'LOTEAMENTO',
    r'\bJD\b\.?':       'JARDIM',
    r'\bVL\b\.?':       'VILA',
    r'\bST\b\.?':       'SETOR',
    r'\bQD\b\.?':       'QUADRA',
    r'\bQ\b\.?\s':      'QUADRA ',
    r'\bLT\b\.?':       'LOTE',
}

TOKENS_REMOVER = (
    r'\bS/?N°?\b', r'\bSN\b', r'\bS\.N\.\b',
    r'\bCAIXA POSTAL\b.*',
    r'\bCX\.?\s*POSTAL\b.*',
    r'\bFUNDOS\b', r'\bANEXO\b', r'\bTERREO\b',
    r'\bSALA\s+\w+', r'\bAPTO?\s+\w+',
    r'\bLOJA\s+\w+', r'\bBLOCO\s+\w+', r'\bBL\s+\w+',
    r'\bGALPAO\b', r'\bGALP[ÃA]O\b',
    r'N°\s*S/?N',
    r'\s{2,}',
)

def normalizar_texto(texto: str) -> str:
    return (
        unicodedata.normalize("NFKD", texto)
        .encode("ascii", "ignore")
        .decode("ascii")
        .upper()
        .strip()
    )

def limpar_endereco(endereco) -> str:
    if pd.isna(endereco) or not isinstance(endereco, str):
        return ""
    e = normalizar_texto(endereco)
    for padrao in TOKENS_REMOVER:
        e = re.sub(padrao, ' ', e, flags=re.IGNORECASE)
    for padrao, substituto in ABREVIACOES.items():
        e = re.sub(padrao, substituto + ' ', e, flags=re.IGNORECASE)
    e = re.sub(r'N[°º]\s*(\d+)', r'\1', e)
    e = re.sub(r'\s+', ' ', e).strip().strip(',').strip()
    return e

# ─── Geocodificação com retry ─────────────────────────────────────────────────

def chamar_api(params: dict, tentativa: int = 1) -> dict:
    """Chama a API do Google com retry exponencial em caso de rate limit."""
    try:
        resp = requests.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            params=params,
            timeout=10
        )
        data = resp.json()
        status = data.get('status')

        # Rate limit — espera e tenta de novo
        if status in ('OVER_QUERY_LIMIT', 'REQUEST_DENIED') and tentativa <= MAX_RETRIES:
            espera = 2 ** tentativa  # 2s, 4s, 8s
            print(f"\n  [rate limit] aguardando {espera}s (tentativa {tentativa}/{MAX_RETRIES})...")
            time.sleep(espera)
            return chamar_api(params, tentativa + 1)

        return data

    except Exception as e:
        if tentativa <= MAX_RETRIES:
            espera = 2 ** tentativa
            print(f"\n  [erro conexão] aguardando {espera}s...")
            time.sleep(espera)
            return chamar_api(params, tentativa + 1)
        return {'status': 'ERRO_CONEXAO'}


def geocodificar(row) -> tuple:
    endereco_limpo = limpar_endereco(str(row.get('endereco', '')))
    bairro  = normalizar_texto(str(row.get('bairro',    ''))) if pd.notna(row.get('bairro'))    else ''
    cidade  = normalizar_texto(str(row.get('municipio', ''))) if pd.notna(row.get('municipio')) else ''
    uf      = str(row.get('uf', '')).upper().strip()

    if not endereco_limpo or len(endereco_limpo) < 5:
        return None, None, 'sem_endereco'

    busca = f"{endereco_limpo}, {bairro}, {cidade}, {uf}, Brasil"
    busca = re.sub(r',\s*,', ',', busca)

    params = {
        'address':    busca,
        'key':        API_KEY,
        'language':   'pt-BR',
        'region':     'br',
        'components': 'country:BR',
    }

    data = chamar_api(params)
    status = data.get('status')

    if status == 'OK' and data.get('results'):
        resultado     = data['results'][0]
        location_type = resultado['geometry']['location_type']
        if location_type in PRECISAO_ACEITA:
            lat = resultado['geometry']['location']['lat']
            lng = resultado['geometry']['location']['lng']
            return lat, lng, 'sucesso'
        else:
            return None, None, f'impreciso_{location_type}'

    elif status == 'ZERO_RESULTS':
        return None, None, 'sem_resultado'

    else:
        return None, None, f'erro_{status}'

# ─── Pipeline principal ───────────────────────────────────────────────────────

def main():
    if os.path.exists(OUTPUT_FILE):
        print("Checkpoint encontrado — retomando de onde parou...")
        df = pd.read_csv(OUTPUT_FILE, dtype=str)
    else:
        print("Iniciando geocodificação com Google Geocoding API...")
        df = pd.read_csv(INPUT_FILE, dtype=str)
        df['lat']            = None
        df['lng']            = None
        df['geocode_status'] = 'pendente'

    pendentes = df[
        df['lat'].isna() | df['geocode_status'].eq('pendente')
    ].index

    total = len(pendentes)
    print(f"Registros na fila: {total}")
    print(f"Estimativa de custo: ${total * 0.005:.2f} USD\n")

    for i, idx in enumerate(pendentes, 1):
        row = df.loc[idx]
        cidade_uf    = f"{row.get('municipio', '')}/{row.get('uf', '')}"
        endereco_raw = str(row.get('endereco', ''))[:40]
        print(f"[{i}/{total}] {cidade_uf} | {endereco_raw}...")

        lat, lng, status = geocodificar(row)

        df.loc[idx, 'lat']            = lat
        df.loc[idx, 'lng']            = lng
        df.loc[idx, 'geocode_status'] = status

        if i % 100 == 0:
            df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
            sucessos = (df['geocode_status'] == 'sucesso').sum()
            print(f"  💾 Checkpoint salvo — {sucessos} com coordenada exata até agora")

        # 0.12s = ~8 req/s — dentro do limite do Google
        time.sleep(0.12)

    df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')

    print("\n" + "─" * 50)
    print("✅ GEOCODIFICAÇÃO CONCLUÍDA")
    print("─" * 50)

    status_counts = df['geocode_status'].value_counts()
    total_geral   = len(df)
    sucesso       = status_counts.get('sucesso', 0)
    sem_resultado = status_counts.get('sem_resultado', 0)
    sem_endereco  = status_counts.get('sem_endereco', 0)
    imprecisos    = sum(v for k, v in status_counts.items() if k.startswith('impreciso'))
    erros         = sum(v for k, v in status_counts.items() if k.startswith('erro'))

    print(f"Total de farmácias:           {total_geral}")
    print(f"  ✅ Geocodificadas (exatas):  {sucesso} ({sucesso/total_geral*100:.1f}%)")
    print(f"  ❌ Sem resultado:            {sem_resultado}")
    print(f"  ❌ Sem endereço:             {sem_endereco}")
    print(f"  ⚠️  Imprecisas (descartadas): {imprecisos}")
    print(f"  ⚠️  Erros de API:             {erros}")
    print(f"\nAproveitamento no mapa:       {sucesso/total_geral*100:.1f}%")

if __name__ == "__main__":
    main()