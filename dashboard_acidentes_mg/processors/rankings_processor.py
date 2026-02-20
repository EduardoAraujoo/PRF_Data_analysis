#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador de Rankings
Calcula top 10 municípios e BRs por número de acidentes
"""

import pandas as pd
import numpy as np
from utils import load_data, save_json, clean_string


def process_rankings():
    """
    Processa rankings de municípios e BRs
    Gera arquivo rankings.json
    """
    print("\n🏆 Processando rankings...")
    
    # Carregar dados
    df_master, df_previsao = load_data()
    
    # === RANKING DE MUNICÍPIOS ===
    
    # Limpar nomes de municípios
    df_master['municipio_limpo'] = df_master['municipio_x'].apply(clean_string)
    df_municipios = df_master[df_master['municipio_limpo'].notna()]
    
    # Agrupar por município
    rank_municipios = df_municipios.groupby('municipio_limpo').agg({
        'id': 'nunique',
        'mortos_x': 'sum',
        'feridos': 'sum'
    }).reset_index()
    
    rank_municipios.columns = ['municipio', 'total_acidentes', 'total_mortos', 'total_feridos']
    
    # Ordenar e pegar top 10
    rank_municipios = rank_municipios.sort_values('total_acidentes', ascending=False).head(10)
    
    # Converter para lista
    municipios_list = []
    for idx, (_, row) in enumerate(rank_municipios.iterrows(), 1):
        municipios_list.append({
            "posicao": idx,
            "municipio": row['municipio'],
            "total_acidentes": int(row['total_acidentes']),
            "total_mortos": int(row['total_mortos']),
            "total_feridos": int(row['total_feridos'])
        })
    
    # === RANKING DE BRs ===
    
    # Limpar BRs
    df_master['br_limpa'] = df_master['br_x'].apply(clean_string)
    df_brs = df_master[df_master['br_limpa'].notna()]
    
    # Agrupar por BR
    rank_brs = df_brs.groupby('br_limpa').agg({
        'id': 'nunique',
        'mortos_x': 'sum',
        'feridos': 'sum'
    }).reset_index()
    
    rank_brs.columns = ['br', 'total_acidentes', 'total_mortos', 'total_feridos']
    
    # Ordenar e pegar top 10
    rank_brs = rank_brs.sort_values('total_acidentes', ascending=False).head(10)
    
    # Converter para lista
    brs_list = []
    for idx, (_, row) in enumerate(rank_brs.iterrows(), 1):
        brs_list.append({
            "posicao": idx,
            "br": row['br'],
            "total_acidentes": int(row['total_acidentes']),
            "total_mortos": int(row['total_mortos']),
            "total_feridos": int(row['total_feridos'])
        })
    
    # Estrutura final
    resultado = {
        "top_municipios": municipios_list,
        "top_brs": brs_list,
        "metadata": {
            "ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }
    
    # Salvar JSON
    save_json(resultado, 'rankings.json')
    
    return resultado


if __name__ == "__main__":
    process_rankings()
