import pandas as pd
from processors.utils import load_data, save_json, clean_string

def process_rankings(df_input=None, save=True):
    print("\n🏆 Processando rankings...")
    df_master = df_input if df_input is not None else load_data()[0]
    
    def get_rank(df, col, label):
        df['limpo'] = df[col].apply(clean_string)
        rank = df[df['limpo'].notna()].groupby('limpo').agg({'id': 'nunique', 'mortos_x': 'sum', 'feridos': 'sum'}).reset_index()
        rank.columns = [label, 'total_acidentes', 'total_mortos', 'total_feridos']
        return rank.sort_values('total_acidentes', ascending=False).head(10)

    rank_mun = get_rank(df_master, 'municipio_x', 'municipio')
    rank_br = get_rank(df_master, 'br_x', 'br')
    
    resultado = {
        "top_municipios": [{"posicao": i+1, **r.to_dict()} for i, r in rank_mun.reset_index(drop=True).iterrows()],
        "top_brs": [{"posicao": i+1, **r.to_dict()} for i, r in rank_br.reset_index(drop=True).iterrows()],
        "metadata": {"ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
    }
    if save: save_json(resultado, 'rankings.json')
    return resultado
