from typing import Optional, Dict, Any, List
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from processors.utils import get_filtered_df
from processors.kpis_processor import process_kpis
from processors.evolucao_processor import process_evolucao_mensal
from processors.causas_processor import process_causas
from processors.distribuicoes_processor import process_distribuicoes
from processors.rankings_processor import process_rankings
from processors.areas_criticas_processor import process_areas_criticas

app = FastAPI(title="Dashboard Acidentes MG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def build_filtered_df(ano=None, mes=None, hora_inicio=None, hora_fim=None, condicao_met=None):
    return get_filtered_df(ano=ano, mes=mes, hora_inicio=hora_inicio, hora_fim=hora_fim, condicao=condicao_met)

def safe_unique_sorted(series: pd.Series) -> List[str]:
    s = series.dropna().astype(str)
    s = s[s.str.strip() != ""]
    return sorted(s.unique().tolist())

@app.get("/api/options")
def options(ano: Optional[str] = None, mes: Optional[str] = None):
    df = build_filtered_df(ano, mes)
    return {
        "anos": safe_unique_sorted(df["data_inversa_x"].dt.year) if "data_inversa_x" in df.columns else [],
        "condicoes_meteorologicas": safe_unique_sorted(df.get("condicao_metereologica_x", pd.Series(dtype=str))),
        "fases_dia": safe_unique_sorted(df.get("fase_dia_x", pd.Series(dtype=str))),
        "tipos_acidente": safe_unique_sorted(df.get("tipo_acidente_x", pd.Series(dtype=str))),
    }

@app.get("/api/kpis")
def kpis(ano: Optional[str] = None, mes: Optional[str] = None):
    return process_kpis(df_input=build_filtered_df(ano, mes), save=False)

@app.get("/api/evolucao")
def evolucao(ano: Optional[str] = None, mes: Optional[str] = None):
    return process_evolucao_mensal(df_input=build_filtered_df(ano, mes), save=False)

@app.get("/api/causas")
def causas(ano: Optional[str] = None, mes: Optional[str] = None):
    return process_causas(df_input=build_filtered_df(ano, mes), save=False)

@app.get("/api/distribuicoes")
def distribuicoes(ano: Optional[str] = None, mes: Optional[str] = None):
    return process_distribuicoes(df_input=build_filtered_df(ano, mes), save=False)

@app.get("/api/rankings")
def rankings(ano: Optional[str] = None, mes: Optional[str] = None):
    return process_rankings(df_input=build_filtered_df(ano, mes), save=False)

@app.get("/api/areas-criticas")
def areas_criticas(ano: Optional[str] = None, mes: Optional[str] = None):
    return process_areas_criticas(df_input=build_filtered_df(ano, mes), save=False)
