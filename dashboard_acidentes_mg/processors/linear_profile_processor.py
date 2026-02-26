import pandas as pd
import numpy as np
from processors.utils import load_data, save_json

def process_linear_profile(br_target, bin_size=1, save=True):
    print(f"\n🔍 Processando Perfil Linear para BR-{br_target}...")
    
    df_master, _ = load_data()
    
    # 1. Filtragem e Limpeza
    # Garante que a BR seja tratada como string para comparação
    df_br = df_master[df_master['br_x'].astype(str) == str(br_target)].copy()
    
    if df_br.empty:
        print(f"⚠️ Nenhum dado encontrado para a BR-{br_target}")
        return None

    # Limpeza da coluna KM (converte '123,4' para 123.4)
    df_br['km_numeric'] = pd.to_numeric(
        df_br['km_x'].astype(str).str.replace(',', '.'), 
        errors='coerce'
    )
    df_br = df_br.dropna(subset=['km_numeric'])

    # 2. Definição dos Bins (Intervalos de KM)
    km_min = int(df_br['km_numeric'].min())
    km_max = int(df_br['km_numeric'].max())
    bins = np.arange(km_min, km_max + bin_size + 1, bin_size)
    
    # 3. Agrupamento (Binning)
    df_br['km_bin'] = pd.cut(df_br['km_numeric'], bins=bins, labels=bins[:-1], include_lowest=True)
    
    # 4. Cálculo de Densidade e Gravidade
    profile_data = df_br.groupby('km_bin', observed=False).agg(
        total_acidentes=('id', 'count'),
        mortos=('mortos_x', 'sum'),
        feridos_graves=('feridos_graves_x', 'sum')
    ).reset_index()
    
    # Renomear para facilitar o frontend
    profile_data.rename(columns={'km_bin': 'km'}, inplace=True)
    profile_data['km'] = profile_data['km'].astype(float)
    
    # Identificação de Hotspots (Exemplo: acidentes acima do percentil 90 da rodovia)
    threshold = profile_data['total_acidentes'].quantile(0.9)
    profile_data['is_hotspot'] = profile_data['total_acidentes'] > threshold
    
    # Converter para lista de dicionários para o JSON
    result = {
        "br": br_target,
        "bin_size": bin_size,
        "estatisticas": profile_data.to_dict(orient='records'),
        "metadata": {
            "km_inicial": km_min,
            "km_final": km_max,
            "total_registros": len(df_br)
        }
    }
    
    if save:
        save_json(result, f'linear_profile_{br_target}.json')
    
    return result
