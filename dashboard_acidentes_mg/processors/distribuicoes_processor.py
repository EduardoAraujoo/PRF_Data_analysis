import pandas as pd
from processors.utils import load_data, save_json, clean_string

def calcular_distribuicao(df, coluna):
    if df.empty:
        return []
        
    df_temp = df.copy()
    df_temp['valor_limpo'] = df_temp[coluna].apply(clean_string)
    dist = df_temp[df_temp['valor_limpo'].notna()].groupby('valor_limpo').agg({'id': 'nunique'}).reset_index()
    dist.columns = ['categoria', 'total']
    
    total_geral = dist['total'].sum()
    if total_geral == 0:
        return []

    return [
        {
            "name": str(r['categoria']), 
            "value": int(r['total']), 
            "percentual": round((r['total']/total_geral)*100, 2)
        } 
        for _, r in dist.sort_values('total', ascending=False).iterrows()
    ]

def process_distribuicoes(df_input=None, save=True):
    print("\n📊 Processando distribuições...")
    df_master = df_input if df_input is not None else load_data()[0]
    resultado = {
        "por_tipo_acidente": calcular_distribuicao(df_master, 'tipo_acidente_x'),
        "por_fase_dia": calcular_distribuicao(df_master, 'fase_dia_x'),
        "por_condicao_meteorologica": calcular_distribuicao(df_master, 'condicao_metereologica_x'),
        "metadata": {"ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
    }
    if save: save_json(resultado, 'distribuicoes.json')
    return resultado
