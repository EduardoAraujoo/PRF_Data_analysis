#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador de Distribuições
Calcula distribuições por tipo, fase e clima
"""

import pandas as pd
import numpy as np
from utils import load_data, save_json, clean_string


def calcular_distribuicao(df, coluna, nome_categoria):
    """
    Calcula distribuição genérica para uma coluna
    
    Args:
        df: DataFrame
        coluna: nome da coluna
        nome_categoria: nome da categoria para o JSON
        
    Returns:
        list: lista de dicts com a distribuição
    """
    # Limpar dados
    df_temp = df.copy()
    df_temp['valor_limpo'] = df_temp[coluna].apply(clean_string)
    df_temp = df_temp[df_temp['valor_limpo'].notna()]
    
    # Agrupar e contar
    dist = df_temp.groupby('valor_limpo').agg({
        'id': 'nunique'
    }).reset_index()
    
    dist.columns = ['categoria', 'total']
    
    # Calcular percentuais
    total_geral = dist['total'].sum()
    dist['percentual'] = round((dist['total'] / total_geral) * 100, 2)
    
    # Ordenar por total
    dist = dist.sort_values('total', ascending=False)
    
    # Converter para lista
    resultado = []
    for _, row in dist.iterrows():
        resultado.append({
            nome_categoria: row['categoria'],
            "total": int(row['total']),
            "percentual": float(row['percentual'])
        })
    
    return resultado


def process_distribuicoes():
    """
    Processa distribuições por tipo, fase e clima
    Gera arquivo distribuicoes.json
    """
    print("\n📊 Processando distribuições...")
    
    # Carregar dados
    df_master, df_previsao = load_data()
    
    # Calcular distribuições
    dist_tipo = calcular_distribuicao(df_master, 'tipo_acidente_x', 'tipo')
    dist_fase = calcular_distribuicao(df_master, 'fase_dia_x', 'fase')
    dist_clima = calcular_distribuicao(df_master, 'condicao_metereologica_x', 'condicao')
    
    # Estrutura final
    resultado = {
        "por_tipo_acidente": dist_tipo,
        "por_fase_dia": dist_fase,
        "por_condicao_meteorologica": dist_clima,
        "metadata": {
            "ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }
    
    # Salvar JSON
    save_json(resultado, 'distribuicoes.json')
    
    return resultado


if __name__ == "__main__":
    process_distribuicoes()
