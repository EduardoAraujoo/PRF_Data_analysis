import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    candidates = ["acidentes_mg_dashboard_master.csv", "../Uploads/acidentes_mg_dashboard_master.csv"]
    path = next((p for p in candidates if os.path.exists(p)), None)
    if not path: raise FileNotFoundError("CSV não encontrado")

    df = pd.read_csv(path, sep=None, engine='python', encoding='latin1', on_bad_lines='skip')
    
    col_map = {
        'data_inversa_x': 'data_inversa',
        'condicao_metereologica_x': 'condicao_met',
        'tipo_acidente_x': 'tipo_acidente',
        'mortos_x': 'mortos',
        'feridos_x': 'feridos',
        'municipio_x': 'municipio',
        'br_x': 'br',
        'fase_dia_x': 'fase_dia',
        'causa_acidente_x': 'causa'
    }
    df = df.rename(columns=col_map)

    if 'feridos' not in df.columns and 'feridos_leves_x' in df.columns:
        df['feridos'] = df['feridos_leves_x'] + df['feridos_graves_x']

    df['data_inversa'] = pd.to_datetime(df['data_inversa'], errors='coerce')
    df['ano'] = df['data_inversa'].dt.year.astype('Int64').astype(str).replace('<NA>', '')
    df['mes_num'] = df['data_inversa'].dt.month.astype('Int64')
    
    return df

df_master = load_data()

def apply_filters(ano=None, mes=None, condicao_met=None, tipo_acidente=None):
    dff = df_master.copy()
    if ano: dff = dff[dff['ano'] == str(ano)]
    if mes: dff = dff[dff['mes_num'] == int(mes)]
    if condicao_met: dff = dff[dff['condicao_met'] == condicao_met]
    if tipo_acidente: dff = dff[dff['tipo_acidente'] == tipo_acidente]
    return dff

@app.get("/api/options")
async def get_options():
    return {
        "anos": sorted([a for a in df_master['ano'].unique() if a], reverse=True),
        "condicoes_meteorologicas": sorted(df_master['condicao_met'].dropna().unique().tolist()),
        "tipos_acidente": sorted(df_master['tipo_acidente'].dropna().unique().tolist())
    }

@app.get("/api/kpis")
async def get_kpis(ano: str = None, mes: str = None, condicao_met: str = None, tipo_acidente: str = None):
    dff = apply_filters(ano, mes, condicao_met, tipo_acidente)
    total_acidentes = len(dff)
    total_mortos = int(dff['mortos'].sum())
    total_feridos = int(dff['feridos'].sum())
    return {
        "kpis": [
            {"id": "total_acidentes", "titulo": "Total Acidentes", "valor": total_acidentes, "formato": "numero", "tendencia": {"texto": "Total", "tipo": "neutro"}, "descricao": ""},
            {"id": "total_mortos", "titulo": "Total Mortos", "valor": total_mortos, "formato": "numero", "tendencia": {"texto": "Fatais", "tipo": "negativo"}, "descricao": ""},
            {"id": "total_feridos", "titulo": "Total Feridos", "valor": total_feridos, "formato": "numero", "tendencia": {"texto": "Feridos", "tipo": "neutro"}, "descricao": ""},
            {"id": "taxa_mortalidade", "titulo": "Mortalidade", "valor": (total_mortos/total_acidentes*100 if total_acidentes>0 else 0), "formato": "percentual", "tendencia": {"texto": "Letalidade", "tipo": "neutro"}, "descricao": ""}
        ]
    }

@app.get("/api/evolucao")
async def get_evolucao(ano: str = None, mes: str = None, condicao_met: str = None, tipo_acidente: str = None):
    dff = apply_filters(ano, mes, condicao_met, tipo_acidente)
    evol = dff.groupby(['ano', 'mes_num']).agg({'id': 'count', 'mortos': 'sum', 'feridos': 'sum'}).reset_index()
    evol = evol.rename(columns={'id': 'total_acidentes', 'mortos': 'total_mortos', 'feridos': 'total_feridos'})
    evol['mes'] = evol['mes_num'].apply(lambda x: f"{int(x):02d}")
    return {"evolucao": evol.to_dict(orient='records')}

@app.get("/api/causas")
async def get_causas(ano: str = None, mes: str = None, condicao_met: str = None, tipo_acidente: str = None):
    dff = apply_filters(ano, mes, condicao_met, tipo_acidente)
    causas = dff['causa'].value_counts().head(5).reset_index()
    causas.columns = ['causa', 'total_acidentes']
    total = causas['total_acidentes'].sum()
    causas['percentual'] = (causas['total_acidentes'] / total * 100) if total > 0 else 0
    return {"top_causas": causas.to_dict(orient='records')}

@app.get("/api/distribuicoes")
async def get_distribuicoes(ano: str = None, mes: str = None, condicao_met: str = None, tipo_acidente: str = None):
    dff = apply_filters(ano, mes, condicao_met, tipo_acidente)
    
    # Formata exatamente como o frontend espera: lista de objetos com {name, value}
    por_tipo = dff['tipo_acidente'].value_counts().head(8).reset_index()
    por_tipo.columns = ['name', 'value']
    
    por_fase = dff['fase_dia'].value_counts().reset_index()
    por_fase.columns = ['name', 'value']
    
    por_cond = dff['condicao_met'].value_counts().head(6).reset_index()
    por_cond.columns = ['name', 'value']
    
    return {
        "por_tipo_acidente": por_tipo.to_dict(orient='records'),
        "por_fase_dia": por_fase.to_dict(orient='records'),
        "por_condicao_meteorologica": por_cond.to_dict(orient='records')
    }

@app.get("/api/rankings")
async def get_rankings(ano: str = None, mes: str = None, condicao_met: str = None, tipo_acidente: str = None):
    dff = apply_filters(ano, mes, condicao_met, tipo_acidente)
    mun = dff.groupby('municipio').agg({'id': 'count', 'mortos': 'sum', 'feridos': 'sum'}).sort_values('id', ascending=False).head(10).reset_index()
    brs = dff.groupby('br').agg({'id': 'count', 'mortos': 'sum', 'feridos': 'sum'}).sort_values('id', ascending=False).head(10).reset_index()
    return {
        "top_municipios": mun.rename(columns={'id': 'total_acidentes', 'mortos': 'total_mortos', 'feridos': 'total_feridos'}).to_dict(orient='records'),
        "top_brs": brs.rename(columns={'id': 'total_acidentes', 'mortos': 'total_mortos', 'feridos': 'total_feridos'}).to_dict(orient='records')
    }

@app.get("/api/areas-criticas")
async def get_areas(ano: str = None, mes: str = None, condicao_met: str = None, tipo_acidente: str = None):
    dff = apply_filters(ano, mes, condicao_met, tipo_acidente)
    mun_critico = dff.groupby('municipio').agg({'id': 'count', 'mortos': 'sum'}).reset_index()
    mun_critico['indice_gravidade'] = (mun_critico['mortos'] * 5) / mun_critico['id']
    return {
        "municipios_criticos": {"dados": mun_critico.sort_values('indice_gravidade', ascending=False).head(5).to_dict(orient='records')},
        "brs_criticas": {"dados": []}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
