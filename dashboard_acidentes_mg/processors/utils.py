#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Módulo de Utilidades Comuns
Funções reutilizáveis para processamento de dados de acidentes
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json
import os
from pathlib import Path


def load_data():
    """
    Carrega os arquivos CSV de acidentes
    
    Returns:
        tuple: (df_master, df_previsao)
    """
    print("�� Carregando dados...")
    
    # Carregar dados históricos
    df_master = pd.read_csv(
        os.path.join(os.path.dirname(__file__), '../acidentes_mg_dashboard_master.csv'),
        sep=';',
        encoding='latin-1'
    )
    
    # Carregar previsões
    df_previsao = pd.read_csv(
        os.path.join(os.path.dirname(__file__), '../previsao_acidentes_2026.csv'),
        sep=';',
        encoding='latin-1'
    )
    
    # Converter datas
    df_master['data_inversa_x'] = pd.to_datetime(df_master['data_inversa_x'])
    df_previsao['data_inversa'] = pd.to_datetime(df_previsao['data_inversa'])
    
    print(f"   ✓ {len(df_master)} registros históricos carregados")
    print(f"   ✓ {len(df_previsao)} dias de previsão carregados")
    
    return df_master, df_previsao


def get_month_year(date):
    if pd.isna(date):
        return None
    if isinstance(date, str):
        date = pd.to_datetime(date)
    return date.strftime('%Y-%m')


def calculate_percentage_change(current, previous):
    if previous == 0 or pd.isna(previous) or pd.isna(current):
        return None
    return round(((current - previous) / previous) * 100, 2)


def format_trend(value):
    if value is None or pd.isna(value):
        return None
    sign = '+' if value >= 0 else ''
    return f"{sign}{value}%"


def save_json(data, filename):
    output_dir = Path(os.path.join(os.path.dirname(__file__), '../data'))
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / filename
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"   ✓ {filename} salvo com sucesso")


def get_last_two_months(df):
    df['ano_mes'] = df['data_inversa_x'].apply(get_month_year)
    meses_unicos = sorted(df['ano_mes'].dropna().unique(), reverse=True)
    if len(meses_unicos) < 2:
        mes_atual_str = meses_unicos[0] if len(meses_unicos) > 0 else None
        mes_anterior_str = None
        df_mes_atual = df[df['ano_mes'] == mes_atual_str] if mes_atual_str else df
        df_mes_anterior = pd.DataFrame()
    else:
        mes_atual_str = meses_unicos[0]
        mes_anterior_str = meses_unicos[1]
        df_mes_atual = df[df['ano_mes'] == mes_atual_str]
        df_mes_anterior = df[df['ano_mes'] == mes_anterior_str]
    return df_mes_atual, df_mes_anterior, mes_atual_str, mes_anterior_str


def calculate_severity_index(mortos, feridos_graves, feridos_leves):
    total_vitimas = mortos + feridos_graves + feridos_leves
    if total_vitimas == 0:
        return 0.0
    weighted_sum = (mortos * 5) + (feridos_graves * 3) + (feridos_leves * 1)
    severity = weighted_sum / total_vitimas
    return round(severity, 2)


def clean_string(s):
    if pd.isna(s) or s == '' or s == 'Não':
        return None
    return str(s).strip()
