#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador de Evolução Mensal
Calcula série temporal de acidentes e mortos
"""

import pandas as pd
import numpy as np
from utils import load_data, save_json, get_month_year


def process_evolucao_mensal():
    """
    Processa evolução mensal de acidentes e mortos
    Gera arquivo evolucao_mensal.json
    """
    print("\n📈 Processando evolução mensal...")
    
    # Carregar dados
    df_master, df_previsao = load_data()
    
    # Adicionar coluna ano-mês
    df_master['ano_mes'] = df_master['data_inversa_x'].apply(get_month_year)
    
    # Agrupar por mês (usando id único para contar acidentes)
    evolucao = df_master.groupby('ano_mes').agg({
        'id': 'nunique',  # Total de acidentes únicos
        'mortos_x': 'sum',  # Total de mortos
        'feridos': 'sum'  # Total de feridos
    }).reset_index()
    
    evolucao.columns = ['mes', 'total_acidentes', 'total_mortos', 'total_feridos']
    
    # Ordenar por mês
    evolucao = evolucao.sort_values('mes')
    
    # Converter para formato JSON
    evolucao_list = []
    for _, row in evolucao.iterrows():
        evolucao_list.append({
            "mes": row['mes'],
            "total_acidentes": int(row['total_acidentes']),
            "total_mortos": int(row['total_mortos']),
            "total_feridos": int(row['total_feridos'])
        })
    
    # Estrutura final
    resultado = {
        "evolucao": evolucao_list,
        "metadata": {
            "total_meses": len(evolucao_list),
            "periodo": f"{evolucao_list[0]['mes']} a {evolucao_list[-1]['mes']}" if len(evolucao_list) > 0 else None,
            "ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }
    
    # Salvar JSON
    save_json(resultado, 'evolucao_mensal.json')
    
    return resultado


if __name__ == "__main__":
    process_evolucao_mensal()
