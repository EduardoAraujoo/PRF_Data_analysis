import pandas as pd
import numpy as np
from processors.utils import load_data, save_json, clean_string, calculate_severity_index

def process_km_distribution(df_input=None, br_selecionada=None, save=True):
    print("\n🔍 Processando distribuição espaciais por KM...")
    
    # Carrega os dados usando a função do utils (que retorna uma tupla df_master, df_previsao)
    df_master = df_input if df_input is not None else load_data()[0]
    
    # Filtra por BR específica, se fornecida, para evitar misturar KMs de rodovias diferentes
    if br_selecionada:
        df_master = df_master[df_master['br_x'] == str(br_selecionada)]
    
    # Tratamento da quilometragem
    # Limpa a string, troca vírgula por ponto e converte para numérico
    df_master['km_limpo'] = df_master['km_x'].apply(clean_string).str.replace(',', '.').astype(float, errors='ignore')
    df_master['km_limpo'] = pd.to_numeric(df_master['km_limpo'], errors='coerce')
    
    # Remove registros sem KM válido
    df_valid = df_master.dropna(subset=['km_limpo']).copy()
    
    if df_valid.empty:
        print("Nenhum dado válido de KM encontrado.")
        return {"faixas_km": []}
        
    # Agrupamento por faixas (bins) de 10km
    max_km = int(df_valid['km_limpo'].max()) + 10
    bins = list(range(0, max_km, 10))
    labels = [f"{i} - {i+10}" for i in range(0, max_km-10, 10)]
    
    df_valid['faixa_km'] = pd.cut(df_valid['km_limpo'], bins=bins, labels=labels, right=False)
    
    resultados = []
    
    # Garantir que colunas de feridos e mortos existam para o cálculo de severidade
    for col in ['mortos_x', 'feridos_graves_x', 'feridos_leves_x']:
        if col not in df_valid.columns:
            df_valid[col] = 0
            
    # Criar a matriz e processar cada segmento
    for faixa, group in df_valid.groupby('faixa_km', observed=False):
        if group.empty:
            continue
            
        total_acidentes = int(len(group))
        mortos = float(group['mortos_x'].sum())
        f_graves = float(group['feridos_graves_x'].sum())
        f_leves = float(group['feridos_leves_x'].sum())
        
        # Uso da função exata do utils
        severidade = calculate_severity_index(mortos, f_graves, f_leves)
        
        # Correlação: Identificar causas
        causas_limpas = group['causa_acidente_x'].apply(clean_string)
        causas_count = causas_limpas.value_counts()
        
        causa_predominante = causas_count.index[0] if not causas_count.empty else "Não Informado"
        top_causas = causas_count.head(3).to_dict()
        
        resultados.append({
            "faixa_km": str(faixa),
            "total_acidentes": total_acidentes,
            "indice_severidade": severidade,
            "causa_predominante": str(causa_predominante),
            "causas_detalhadas": {str(k): int(v) for k, v in top_causas.items()}
        })
        
    resultado_final = {
        "faixas_km": resultados,
        "metadata": {"ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
    }
    
    if save: 
        save_json(resultado_final, 'distribuicao_km.json')
        
    return resultado_final

if __name__ == "__main__":
    process_km_distribution(save=True)