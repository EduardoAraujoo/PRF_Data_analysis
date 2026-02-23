import pandas as pd
from processors.utils import load_data, save_json, get_month_year

def process_evolucao_mensal(df_input=None, save=True):
    print("\n📈 Processando evolução mensal...")
    df_master = df_input if df_input is not None else load_data()[0]
    df_master['ano_mes'] = df_master['data_inversa_x'].apply(get_month_year)
    evolucao = df_master.groupby('ano_mes').agg({'id': 'nunique', 'mortos_x': 'sum', 'feridos': 'sum'}).reset_index()
    evolucao.columns = ['mes', 'total_acidentes', 'total_mortos', 'total_feridos']
    evolucao = evolucao.sort_values('mes')
    evolucao_list = [{"mes": r['mes'], "total_acidentes": int(r['total_acidentes']), "total_mortos": int(r['total_mortos']), "total_feridos": int(r['total_feridos'])} for _, r in evolucao.iterrows()]
    resultado = {"evolucao": evolucao_list, "metadata": {"ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}}
    if save: save_json(resultado, 'evolucao_mensal.json')
    return resultado
