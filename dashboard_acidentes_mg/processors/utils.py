import pandas as pd
import numpy as np
import json
import os
from pathlib import Path


# =========================
# CAMINHOS
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent
CSV_MASTER = BASE_DIR / "acidentes_mg_dashboard_master.csv"
CSV_PREVISAO = BASE_DIR / "previsao_acidentes_2026.csv"
DATA_DIR = BASE_DIR / "data"


# =========================
# LEITURA DO CSV
# =========================
def get_df():
    if not CSV_MASTER.exists():
        raise FileNotFoundError(f"CSV não encontrado em: {CSV_MASTER}")
    df = pd.read_csv(CSV_MASTER, sep=';', encoding='utf-8', low_memory=False)
    df['data_inversa_x'] = pd.to_datetime(df['data_inversa_x'], errors='coerce')
    df['ano'] = df['data_inversa_x'].dt.year.astype('Int64').astype(str)
    df['mes'] = df['data_inversa_x'].dt.month.astype('Int64').astype(str).str.zfill(2)
    df['hora_int'] = pd.to_datetime(df['horario_x'], format='%H:%M:%S', errors='coerce').dt.hour
    return df


def load_data():
    """Compatibilidade com processadores antigos."""
    df_master = get_df()
    df_previsao = None
    if CSV_PREVISAO.exists():
        try:
            df_previsao = pd.read_csv(CSV_PREVISAO, sep=';', encoding='utf-8', low_memory=False)
        except Exception:
            df_previsao = None
    return df_master, df_previsao


# =========================
# FILTRO CENTRAL (AND completo)
# =========================
def get_filtered_df(ano=None, mes=None, hora_inicio=None, hora_fim=None, condicao=None):
    df = get_df()
    if ano:
        df = df[df['ano'] == str(ano)]
    if mes:
        df = df[df['mes'] == str(mes).zfill(2)]
    if hora_inicio is not None:
        df = df[df['hora_int'] >= int(hora_inicio)]
    if hora_fim is not None:
        df = df[df['hora_int'] <= int(hora_fim)]
    if condicao:
        df = df[df['condicao_metereologica_x'] == condicao]
    return df


# =========================
# SALVAR JSON
# =========================
def save_json(data, filename):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / filename
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    print(f"  ✅ Salvo: {path}")


# =========================
# HELPERS DE DATA
# =========================
def get_month_year(date):
    if pd.isna(date):
        return None
    return date.strftime('%Y-%m')


def get_last_two_months(df):
    df = df.copy()
    df['ano_mes'] = df['data_inversa_x'].apply(get_month_year)
    meses = sorted(df['ano_mes'].dropna().unique())
    if len(meses) == 0:
        return pd.DataFrame(), pd.DataFrame(), None, None
    mes_atual = meses[-1]
    mes_anterior = meses[-2] if len(meses) >= 2 else None
    df_atual = df[df['ano_mes'] == mes_atual]
    df_anterior = df[df['ano_mes'] == mes_anterior] if mes_anterior else pd.DataFrame()
    return df_atual, df_anterior, mes_atual, mes_anterior


# =========================
# HELPERS DE CÁLCULO
# =========================
def calculate_percentage_change(atual, anterior):
    if anterior is None or anterior == 0:
        return None
    return round(((atual - anterior) / anterior) * 100, 2)


def format_trend(value):
    if value is None:
        return "Estável"
    if value > 0:
        return f"+{value}%"
    return f"{value}%"


def calculate_severity_index(mortos, feridos_graves, feridos_leves):
    return round((mortos * 13 + feridos_graves * 5 + feridos_leves * 1), 2)


def clean_string(value):
    if pd.isna(value):
        return None
    return str(value).strip()
