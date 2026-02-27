from backend.routes.lstm_routes import router as lstm_router
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(lstm_router)

def load_data():
    """Lê o CSV e extrai apenas as colunas necessárias, evitando duplicatas."""
    candidates = ["acidentes_mg_dashboard_master.csv", "../Uploads/acidentes_mg_dashboard_master.csv"]
    path = next((p for p in candidates if os.path.exists(p)), None)
    if not path: 
        raise FileNotFoundError("Dataset CSV não encontrado.")
    
    # Leitura inicial com detecção de delimitador
    df_raw = pd.read_csv(path, sep=None, engine='python', encoding='latin1', on_bad_lines='skip')
    
    # Função para buscar a primeira coluna disponível de uma lista de opções
    def get_best_col(options):
        for opt in options:
            if opt in df_raw.columns:
                return df_raw[opt]
        return None

    # Criamos um DataFrame novo do zero para garantir que não existam colunas duplicadas
    df = pd.DataFrame()
    
    # Extração seletiva
    df['data_inversa'] = get_best_col(['data_inversa_x', 'data_inversa_original', 'data_inversa'])
    df['br'] = get_best_col(['br_x', 'br_original', 'br'])
    df['km'] = get_best_col(['km_x', 'km_original', 'km'])
    df['causa'] = get_best_col(['causa_acidente_x', 'causa_acidente', 'causa_principal', 'causa'])
    df['tipo_acidente'] = get_best_col(['tipo_acidente_x', 'tipo_acidente'])
    df['fase_dia'] = get_best_col(['fase_dia_x', 'fase_dia'])
    df['condicao_met'] = get_best_col(['condicao_metereologica_x', 'condicao_metereologica', 'condicao_met'])
    df['municipio'] = get_best_col(['municipio_x', 'municipio'])
    df['id'] = df_raw.index # Identificador único baseado na linha

    # Processamento de Vítimas
    mortos = pd.to_numeric(get_best_col(['mortos_x', 'mortos']), errors='coerce').fillna(0)
    df['mortos'] = mortos.astype(int)
    
    f_leves = pd.to_numeric(get_best_col(['feridos_leves_x', 'feridos_leves']), errors='coerce').fillna(0)
    f_graves = pd.to_numeric(get_best_col(['feridos_graves_x', 'feridos_graves']), errors='coerce').fillna(0)
    df['feridos'] = (f_leves + f_graves).astype(int)

    # --- Limpeza e Tipagem ---
    
    # Converter datas
    df['data_inversa'] = pd.to_datetime(df['data_inversa'], errors='coerce')
    df['ano'] = df['data_inversa'].dt.year.astype('Int64').astype(str).replace('<NA>', '')
    df['mes_num'] = df['data_inversa'].dt.month.astype('Int64')
    
    # Padronizar BR (remover .0 e zeros à esquerda)
    df['br'] = df['br'].astype(str).str.replace(r'\.0$', '', regex=True).str.lstrip('0').str.strip()
    
    return df

df_master = load_data()
print(f"✅ CSV carregado com sucesso! Linhas: {len(df_master)}")

def apply_filters(ano=None, mes=None, condicao_met=None, tipo_acidente=None, fase_dia=None):
    dff = df_master.copy()
    if ano and str(ano).strip() != "": dff = dff[dff['ano'] == str(ano)]
    if mes and str(mes).strip() != "": dff = dff[dff['mes_num'] == int(mes)]
    if condicao_met and str(condicao_met).strip() != "": dff = dff[dff['condicao_met'] == condicao_met]
    if tipo_acidente and str(tipo_acidente).strip() != "": dff = dff[dff['tipo_acidente'] == tipo_acidente]
    if fase_dia and str(fase_dia).strip() != "": dff = dff[dff['fase_dia'] == fase_dia]
    return dff

# --- ROTAS DA API ---

@app.get("/api/options")
async def get_options():
    return {
        "anos": sorted([str(a) for a in df_master['ano'].unique() if a and a != 'nan' and a != ''], reverse=True),
        "condicoes_meteorologicas": sorted(df_master['condicao_met'].dropna().unique().tolist()),
        "tipos_acidente": sorted(df_master['tipo_acidente'].dropna().unique().tolist()),
        "fases_dia": sorted(df_master['fase_dia'].dropna().unique().tolist())
    }

@app.get("/api/kpis")
async def get_kpis(ano: str = None, mes: str = None, condicao_met: str = None, tipo_acidente: str = None, fase_dia: str = None):
    dff = apply_filters(ano, mes, condicao_met, tipo_acidente, fase_dia)
    total = int(len(dff))
    mortos = int(dff['mortos'].sum())
    feridos = int(dff['feridos'].sum())
    taxa = float(round(mortos / total * 100, 2)) if total > 0 else 0.0
    return {"kpis": [
        {"id": "total_acidentes", "titulo": "Total", "valor": total, "formato": "numero"},
        {"id": "total_mortos", "titulo": "Mortos", "valor": mortos, "formato": "numero"},
        {"id": "total_feridos", "titulo": "Feridos", "valor": feridos, "formato": "numero"},
        {"id": "taxa_mortalidade", "titulo": "Mortalidade", "valor": taxa, "formato": "percentual"}
    ]}

@app.get("/api/distribuicao-km")
async def get_distribuicao_km(br: str = None, km_inicio: float = None, km_fim: float = None, ano: str = None, mes: str = None):
    try:
        dff = apply_filters(ano, mes)
        
        # Filtro de BR
        if br and str(br).strip() != "":
            target_br = str(br).replace('.0', '').lstrip('0').strip()
            dff = dff[dff['br'] == target_br]
        
        if dff.empty: return {"faixas_km": []}

        # Tratamento de KM (remover vírgulas e converter para número)
        dff['km_num'] = dff['km'].astype(str).str.replace(',', '.').str.extract(r'(\d+\.?\d*)')[0]
        dff['km_num'] = pd.to_numeric(dff['km_num'], errors='coerce')
        df_valid = dff.dropna(subset=['km_num']).copy()
        
        if km_inicio is not None: df_valid = df_valid[df_valid['km_num'] >= km_inicio]
        if km_fim is not None: df_valid = df_valid[df_valid['km_num'] <= km_fim]
        
        if df_valid.empty: return {"faixas_km": []}
            
        min_k = int(df_valid['km_num'].min() // 10 * 10)
        max_k = int(df_valid['km_num'].max() // 10 * 10) + 10
        bins = list(range(min_k, max_k + 10, 10))
        labels = [f"{i}-{i+10}" for i in range(min_k, max_k, 10)]
        
        df_valid['faixa_km'] = pd.cut(df_valid['km_num'], bins=bins, labels=labels, right=False)
        
        resultados = []
        for faixa, group in df_valid.groupby('faixa_km', observed=False):
            if group.empty: continue
            
            total_km = int(len(group))
            sev = float(round((group['mortos'].sum() * 13) + (group['feridos'].sum() * 3), 2))
            
            counts = group['causa'].value_counts()
            top_3 = {str(k): int(v) for k, v in counts.head(3).items()}
            outros = int(counts.iloc[3:].sum())
            if outros > 0: top_3["Outras Causas"] = outros
                
            resultados.append({
                "faixa_km": str(faixa),
                "total_acidentes": total_km,
                "indice_severidade": sev,
                "causa_predominante": str(counts.index[0]) if not counts.empty else "N/I",
                "causas_detalhadas": top_3
            })
            
        return {"faixas_km": resultados}
    except Exception as e:
        print(f"❌ Erro na API de KM: {e}")
        return {"faixas_km": []}

@app.get("/api/evolucao")
async def get_evolucao(ano: str = None, mes: str = None):
    dff = apply_filters(ano, mes)
    evol = dff.groupby(['ano', 'mes_num']).agg({'id': 'count', 'mortos': 'sum', 'feridos': 'sum'}).reset_index()
    evol['mes'] = evol['mes_num'].apply(lambda x: f"{int(x):02d}")
    evol = evol.rename(columns={'id': 'total_acidentes', 'mortos': 'total_mortos', 'feridos': 'total_feridos'})
    return {"evolucao": evol.to_dict(orient='records')}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)