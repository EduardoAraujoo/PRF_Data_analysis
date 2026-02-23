import pandas as pd
from processors.utils import load_data, save_json, clean_string, calculate_severity_index

def process_areas_criticas(df_input=None, save=True):
    print("\n⚠️  Processando áreas críticas...")
    df_master = df_input if df_input is not None else load_data()[0]
    
    df_master['municipio_limpo'] = df_master['municipio_x'].apply(clean_string)
    mun = df_master.groupby('municipio_limpo').agg({'id': 'nunique', 'mortos_x': 'sum', 'feridos_graves_x': 'sum', 'feridos_leves_x': 'sum', 'feridos': 'sum'}).reset_index()
    mun.columns = ['municipio', 'total_acidentes', 'mortos', 'feridos_graves', 'feridos_leves', 'total_feridos']
    mun['indice_gravidade'] = mun.apply(lambda r: calculate_severity_index(r['mortos'], r['feridos_graves'], r['feridos_leves']), axis=1)
    
    df_master['br_limpa'] = df_master['br_x'].apply(clean_string)
    brs = df_master.groupby('br_limpa').agg({'id': 'nunique', 'mortos_x': 'sum', 'feridos': 'sum'}).reset_index()
    brs.columns = ['br', 'total_acidentes', 'mortos', 'feridos']
    brs['taxa_mortalidade'] = brs.apply(lambda r: round((r['mortos']/(r['mortos']+r['feridos'])*100), 2) if (r['mortos']+r['feridos']) > 0 else 0, axis=1)

    resultado = {
        "municipios_criticos": {"dados": mun[mun['total_acidentes']>=5].sort_values('indice_gravidade', ascending=False).head(10).to_dict('records')},
        "brs_criticas": {"dados": brs[brs['total_acidentes']>=10].sort_values('taxa_mortalidade', ascending=False).head(10).to_dict('records')},
        "metadata": {"ultima_atualizacao": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
    }
    if save: save_json(resultado, 'areas_criticas.json')
    return resultado
