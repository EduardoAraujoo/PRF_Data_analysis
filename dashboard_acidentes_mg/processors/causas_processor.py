#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador de Causas de Acidentes
Calcula distribuição de causas principais
"""

import pandas as pd
import numpy as np
from utils import load_data, save_json, clean_string


def process_causas():
    """
    Processa causas de acidentes
    Gera arquivo causas.json
    """
    print("\n🔍 Processando causas de acidentes...")
    
    # Carregar dados
    df_master, df_previsao = load_data()
    
    # Limpar e agrupar por causa
    df_master['causa_limpa'] = df_master['causa_acidente_x'].apply(clean_string)
    
    # Remover valores nulos
    df_causas = df_master[df_master['causa_limpa'].notna()]
    
    # Agrupar por causa e contar acidentes únicos
    causas = df_causas.groupby('causa_limpa').agg({
        'id': 'nunique',
        'mortos_x': 'sum',
        'feridos': 'sum'
    }).reset_index()
    
    causas.columns = ['causa', 'total_acidentes', 'total_mortos', 'total_feridos']
    
    # Ordenar por total de acidentes
    causas = causas.sort_values('total_acidentes', ascending=False)
    
    # Calcular percentuais
    total_geral = causas['total_acidentes'].sum()
    causas['percentual'] = round((causas['total_acidentes'] / total_geral) * 100, 2)
    
    # Pegar top 10
    top_causas = causas.head(10)
    
    # Converter para lista de dicts
    causas_list = []
    for idx, row in top_causas.iterrows():
        causas_list.append({
            "causa": row['causa'],
            "total_acidentes": int(row['total_acidentes']),
            "total_mortos": int(row['total_mortos']),
            "total_feridos": int(row['total_feridos']),
            "percentual": float(row['percentual'])
        })
    
    # Estrutura final
    resultado = {
        "top_causas": causas_list,
        "metadata": {
            "total_causas_distintas": len(causas),
            "ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }
    
    # Salvar JSON
    save_json(resultado, 'causas.json')
    
    return resultado


if __name__ == "__main__":
    process_causas()
