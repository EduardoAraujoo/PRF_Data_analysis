import pandas as pd
import numpy as np
from processors.utils import (
    load_data, save_json, get_last_two_months,
    calculate_percentage_change, format_trend, calculate_severity_index
)

def process_kpis(df_input=None, save=True):
    print("\n�� Processando KPIs...")
    if df_input is not None:
        df_master = df_input
    else:
        df_master, _ = load_data()
    
    df_atual, df_anterior, mes_atual, mes_anterior = get_last_two_months(df_master)
    total_acidentes_atual = df_atual['id'].nunique()
    total_acidentes_anterior = df_anterior['id'].nunique() if not df_anterior.empty else 0
    total_mortos_atual = int(df_atual['mortos_x'].sum())
    total_mortos_anterior = int(df_anterior['mortos_x'].sum()) if not df_anterior.empty else 0
    total_feridos_atual = int(df_atual['feridos'].sum())
    total_feridos_anterior = int(df_anterior['feridos'].sum()) if not df_anterior.empty else 0
    
    total_vitimas_atual = total_mortos_atual + total_feridos_atual
    taxa_mortalidade_atual = round((total_mortos_atual / total_vitimas_atual * 100), 2) if total_vitimas_atual > 0 else 0
    total_vitimas_anterior = total_mortos_anterior + total_feridos_anterior
    taxa_mortalidade_anterior = round((total_mortos_anterior / total_vitimas_anterior * 100), 2) if total_vitimas_anterior > 0 else 0
    
    indice_gravidade_atual = calculate_severity_index(total_mortos_atual, int(df_atual['feridos_graves_x'].sum()), int(df_atual['feridos_leves_x'].sum()))
    indice_gravidade_anterior = calculate_severity_index(total_mortos_anterior, int(df_anterior['feridos_graves_x'].sum()), int(df_anterior['feridos_leves_x'].sum())) if not df_anterior.empty else 0

    kpis = {
        "periodo": {"mes_atual": mes_atual, "mes_anterior": mes_anterior},
        "kpis": [
            {"id": "total_acidentes", "titulo": "Total de Acidentes", "valor": total_acidentes_atual, "formato": "numero", "tendencia": {"valor": calculate_percentage_change(total_acidentes_atual, total_acidentes_anterior), "tipo": "aumento" if total_acidentes_atual > total_acidentes_anterior else "reducao"}},
            {"id": "total_mortos", "titulo": "Total de Mortos", "valor": total_mortos_atual, "formato": "numero", "tendencia": {"valor": calculate_percentage_change(total_mortos_atual, total_mortos_anterior), "tipo": "aumento" if total_mortos_atual > total_mortos_anterior else "reducao"}},
            {"id": "total_feridos", "titulo": "Total de Feridos", "valor": total_feridos_atual, "formato": "numero", "tendencia": {"valor": calculate_percentage_change(total_feridos_atual, total_feridos_anterior), "tipo": "aumento" if total_feridos_atual > total_feridos_anterior else "reducao"}},
            {"id": "taxa_mortalidade", "titulo": "Taxa de Mortalidade", "valor": taxa_mortalidade_atual, "formato": "percentual", "tendencia": {"valor": calculate_percentage_change(taxa_mortalidade_atual, taxa_mortalidade_anterior), "tipo": "aumento" if taxa_mortalidade_atual > taxa_mortalidade_anterior else "reducao"}},
            {"id": "indice_gravidade", "titulo": "Índice de Gravidade", "valor": indice_gravidade_atual, "formato": "decimal", "tendencia": {"valor": calculate_percentage_change(indice_gravidade_atual, indice_gravidade_anterior), "tipo": "aumento" if indice_gravidade_atual > indice_gravidade_anterior else "reducao"}}
        ],
        "metadata": {"ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
    }
    if save: save_json(kpis, 'kpis.json')
    return kpis
