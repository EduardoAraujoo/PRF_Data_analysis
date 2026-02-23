#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador de KPIs
Calcula KPIs principais e tendências
"""

import pandas as pd
import numpy as np
from utils import (
    load_data, 
    save_json, 
    get_last_two_months,
    calculate_percentage_change,
    format_trend,
    calculate_severity_index
)


def process_kpis(save=True):
    """
    Processa KPIs principais e tendências
    Gera arquivo kpis.json
    """
    print("\n🔢 Processando KPIs...")
    
    # Carregar dados
    df_master, df_previsao = load_data()
    
    # Obter dados dos dois últimos meses
    df_atual, df_anterior, mes_atual, mes_anterior = get_last_two_months(df_master)
    
    # === KPIs do mês atual ===
    
    # Total de acidentes (agregar por id único)
    total_acidentes_atual = df_atual['id'].nunique()
    total_acidentes_anterior = df_anterior['id'].nunique() if not df_anterior.empty else 0
    
    # Total de mortos
    total_mortos_atual = int(df_atual['mortos_x'].sum())
    total_mortos_anterior = int(df_anterior['mortos_x'].sum()) if not df_anterior.empty else 0
    
    # Total de feridos
    total_feridos_atual = int(df_atual['feridos'].sum())
    total_feridos_anterior = int(df_anterior['feridos'].sum()) if not df_anterior.empty else 0
    
    # Taxa de mortalidade (%)
    total_vitimas_atual = total_mortos_atual + total_feridos_atual
    taxa_mortalidade_atual = round((total_mortos_atual / total_vitimas_atual * 100), 2) if total_vitimas_atual > 0 else 0
    
    total_vitimas_anterior = total_mortos_anterior + total_feridos_anterior
    taxa_mortalidade_anterior = round((total_mortos_anterior / total_vitimas_anterior * 100), 2) if total_vitimas_anterior > 0 else 0
    
    # Índice de gravidade
    indice_gravidade_atual = calculate_severity_index(
        total_mortos_atual,
        int(df_atual['feridos_graves_x'].sum()),
        int(df_atual['feridos_leves_x'].sum())
    )
    
    if not df_anterior.empty:
        indice_gravidade_anterior = calculate_severity_index(
            total_mortos_anterior,
            int(df_anterior['feridos_graves_x'].sum()),
            int(df_anterior['feridos_leves_x'].sum())
        )
    else:
        indice_gravidade_anterior = 0
    
    # Calcular tendências
    tendencia_acidentes = calculate_percentage_change(total_acidentes_atual, total_acidentes_anterior)
    tendencia_mortos = calculate_percentage_change(total_mortos_atual, total_mortos_anterior)
    tendencia_feridos = calculate_percentage_change(total_feridos_atual, total_feridos_anterior)
    tendencia_taxa_mortalidade = calculate_percentage_change(taxa_mortalidade_atual, taxa_mortalidade_anterior)
    tendencia_gravidade = calculate_percentage_change(indice_gravidade_atual, indice_gravidade_anterior)
    
    # Montar estrutura JSON
    kpis = {
        "periodo": {
            "mes_atual": mes_atual,
            "mes_anterior": mes_anterior
        },
        "kpis": [
            {
                "id": "total_acidentes",
                "titulo": "Total de Acidentes",
                "valor": total_acidentes_atual,
                "formato": "numero",
                "tendencia": {
                    "valor": tendencia_acidentes,
                    "texto": format_trend(tendencia_acidentes),
                    "tipo": "aumento" if tendencia_acidentes and tendencia_acidentes > 0 else "reducao" if tendencia_acidentes else "estavel"
                },
                "descricao": "vs mês anterior"
            },
            {
                "id": "total_mortos",
                "titulo": "Total de Mortos",
                "valor": total_mortos_atual,
                "formato": "numero",
                "tendencia": {
                    "valor": tendencia_mortos,
                    "texto": format_trend(tendencia_mortos),
                    "tipo": "aumento" if tendencia_mortos and tendencia_mortos > 0 else "reducao" if tendencia_mortos else "estavel"
                },
                "descricao": "vs mês anterior"
            },
            {
                "id": "total_feridos",
                "titulo": "Total de Feridos",
                "valor": total_feridos_atual,
                "formato": "numero",
                "tendencia": {
                    "valor": tendencia_feridos,
                    "texto": format_trend(tendencia_feridos),
                    "tipo": "aumento" if tendencia_feridos and tendencia_feridos > 0 else "reducao" if tendencia_feridos else "estavel"
                },
                "descricao": "vs mês anterior"
            },
            {
                "id": "taxa_mortalidade",
                "titulo": "Taxa de Mortalidade",
                "valor": taxa_mortalidade_atual,
                "formato": "percentual",
                "tendencia": {
                    "valor": tendencia_taxa_mortalidade,
                    "texto": format_trend(tendencia_taxa_mortalidade),
                    "tipo": "aumento" if tendencia_taxa_mortalidade and tendencia_taxa_mortalidade > 0 else "reducao" if tendencia_taxa_mortalidade else "estavel"
                },
                "descricao": "vs mês anterior"
            },
            {
                "id": "indice_gravidade",
                "titulo": "Índice de Gravidade",
                "valor": indice_gravidade_atual,
                "formato": "decimal",
                "tendencia": {
                    "valor": tendencia_gravidade,
                    "texto": format_trend(tendencia_gravidade),
                    "tipo": "aumento" if tendencia_gravidade and tendencia_gravidade > 0 else "reducao" if tendencia_gravidade else "estavel"
                },
                "descricao": "vs mês anterior"
            }
        ],
        "metadata": {
            "ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
            "periodo_dados": f"{df_master['data_inversa_x'].min().strftime('%Y-%m-%d')} a {df_master['data_inversa_x'].max().strftime('%Y-%m-%d')}"
        }
    }
    
    if save:
        save_json(kpis, 'kpis.json')
    
    return kpis


if __name__ == "__main__":
    process_kpis()
