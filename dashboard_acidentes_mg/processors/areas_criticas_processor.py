#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador de Áreas Críticas
Identifica municípios e BRs com maiores índices de risco
"""

import pandas as pd
import numpy as np
from utils import load_data, save_json, clean_string, calculate_severity_index


def process_areas_criticas(save=True):
    """
    Processa áreas críticas (maior índice de gravidade e taxa de mortalidade)
    Gera arquivo areas_criticas.json
    """
    print("\n⚠️  Processando áreas críticas...")
    
    # Carregar dados
    df_master, df_previsao = load_data()
    
    # === MUNICÍPIOS COM MAIOR ÍNDICE DE GRAVIDADE ===
    
    df_master['municipio_limpo'] = df_master['municipio_x'].apply(clean_string)
    df_municipios = df_master[df_master['municipio_limpo'].notna()]
    
    # Agrupar por município
    municipios_gravidade = df_municipios.groupby('municipio_limpo').agg({
        'id': 'nunique',
        'mortos_x': 'sum',
        'feridos_graves_x': 'sum',
        'feridos_leves_x': 'sum',
        'feridos': 'sum'
    }).reset_index()
    
    municipios_gravidade.columns = ['municipio', 'total_acidentes', 'mortos', 'feridos_graves', 'feridos_leves', 'total_feridos']
    
    # Calcular índice de gravidade para cada município
    municipios_gravidade['indice_gravidade'] = municipios_gravidade.apply(
        lambda row: calculate_severity_index(row['mortos'], row['feridos_graves'], row['feridos_leves']),
        axis=1
    )
    
    # Filtrar municípios com pelo menos 5 acidentes
    municipios_gravidade = municipios_gravidade[municipios_gravidade['total_acidentes'] >= 5]
    
    # Ordenar por índice de gravidade e pegar top 10
    municipios_gravidade = municipios_gravidade.sort_values('indice_gravidade', ascending=False).head(10)
    
    # Converter para lista
    municipios_criticos = []
    for idx, (_, row) in enumerate(municipios_gravidade.iterrows(), 1):
        municipios_criticos.append({
            "posicao": idx,
            "municipio": row['municipio'],
            "indice_gravidade": float(row['indice_gravidade']),
            "total_acidentes": int(row['total_acidentes']),
            "total_mortos": int(row['mortos']),
            "total_feridos": int(row['total_feridos'])
        })
    
    # === BRs COM MAIOR TAXA DE MORTALIDADE ===
    
    df_master['br_limpa'] = df_master['br_x'].apply(clean_string)
    df_brs = df_master[df_master['br_limpa'].notna()]
    
    # Agrupar por BR
    brs_mortalidade = df_brs.groupby('br_limpa').agg({
        'id': 'nunique',
        'mortos_x': 'sum',
        'feridos': 'sum'
    }).reset_index()
    
    brs_mortalidade.columns = ['br', 'total_acidentes', 'mortos', 'feridos']
    
    # Calcular taxa de mortalidade
    brs_mortalidade['total_vitimas'] = brs_mortalidade['mortos'] + brs_mortalidade['feridos']
    brs_mortalidade['taxa_mortalidade'] = brs_mortalidade.apply(
        lambda row: round((row['mortos'] / row['total_vitimas'] * 100), 2) if row['total_vitimas'] > 0 else 0,
        axis=1
    )
    
    # Filtrar BRs com pelo menos 10 acidentes
    brs_mortalidade = brs_mortalidade[brs_mortalidade['total_acidentes'] >= 10]
    
    # Ordenar por taxa de mortalidade e pegar top 10
    brs_mortalidade = brs_mortalidade.sort_values('taxa_mortalidade', ascending=False).head(10)
    
    # Converter para lista
    brs_criticas = []
    for idx, (_, row) in enumerate(brs_mortalidade.iterrows(), 1):
        brs_criticas.append({
            "posicao": idx,
            "br": row['br'],
            "taxa_mortalidade": float(row['taxa_mortalidade']),
            "total_acidentes": int(row['total_acidentes']),
            "total_mortos": int(row['mortos']),
            "total_feridos": int(row['feridos'])
        })
    
    # Estrutura final
    resultado = {
        "municipios_criticos": {
            "criterio": "Maior índice de gravidade (mínimo 5 acidentes)",
            "dados": municipios_criticos
        },
        "brs_criticas": {
            "criterio": "Maior taxa de mortalidade (mínimo 10 acidentes)",
            "dados": brs_criticas
        },
        "metadata": {
            "ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }
    
    if save:
        save_json(resultado, 'areas_criticas.json')
    
    return resultado


if __name__ == "__main__":
    process_areas_criticas()
