import pandas as pd
from processors.utils import load_data, save_json, clean_string

def process_causas(df_input=None, save=True):
    print("\n🔍 Processando causas de acidentes...")
    df_master = df_input if df_input is not None else load_data()[0]
    df_master['causa_limpa'] = df_master['causa_acidente_x'].apply(clean_string)
    causas = df_master[df_master['causa_limpa'].notna()].groupby('causa_limpa').agg({'id': 'nunique', 'mortos_x': 'sum', 'feridos': 'sum'}).reset_index()
    causas.columns = ['causa', 'total_acidentes', 'total_mortos', 'total_feridos']
    causas = causas.sort_values('total_acidentes', ascending=False).head(10)
    total_geral = causas['total_acidentes'].sum()
    causas_list = [{"causa": r['causa'], "total_acidentes": int(r['total_acidentes']), "total_mortos": int(r['total_mortos']), "total_feridos": int(r['total_feridos']), "percentual": round((r['total_acidentes']/total_geral)*100, 2)} for _, r in causas.iterrows()]
    resultado = {"top_causas": causas_list, "metadata": {"ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}}
    if save: save_json(resultado, 'causas.json')
    return resultado
