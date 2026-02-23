from typing import Optional, Dict, Any, List
import pandas as pd

from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Filtro centralizado
from processors.utils import get_filtered_df

# Processadores (agora aceitam df_input=...)
from processors.kpis_processor import process_kpis
from processors.evolucao_processor import process_evolucao_mensal
from processors.causas_processor import process_causas
from processors.distribuicoes_processor import process_distribuicoes
from processors.rankings_processor import process_rankings
from processors.areas_criticas_processor import process_areas_criticas


app = FastAPI(title="Dashboard Acidentes MG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK para dev local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Helpers
# =========================
def build_filtered_df(
    ano: Optional[str] = None,
    mes: Optional[str] = None,
    hora_inicio: Optional[int] = None,
    hora_fim: Optional[int] = None,
    condicao_met: Optional[str] = None,
):
    # AND completo
    return get_filtered_df(
        ano=ano,
        mes=mes,
        hora_inicio=hora_inicio,
        hora_fim=hora_fim,
        condicao=condicao_met
    )

def safe_unique_sorted(series: pd.Series) -> List[str]:
    s = series.dropna().astype(str)
    s = s[s.str.strip() != ""]
    return sorted(s.unique().tolist())


# =========================
# OPTIONS (para dropdowns)
# =========================
@app.get("/api/options")
def options(
    ano: Optional[str] = Query(default=None),
    mes: Optional[str] = Query(default=None),
    hora_inicio: Optional[int] = Query(default=None, ge=0, le=23),
    hora_fim: Optional[int] = Query(default=None, ge=0, le=23),
    condicao_met: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    """
    Devolve listas de opções para popular filtros.
    Observação: também aceita filtros (para opções dependentes).
    """
    df = build_filtered_df(ano, mes, hora_inicio, hora_fim, condicao_met)

    return {
        "anos": safe_unique_sorted(df["data_inversa_x"].dt.year) if "data_inversa_x" in df.columns else [],
        "meses": sorted(df["data_inversa_x"].dt.month.dropna().astype(int).unique().tolist()) if "data_inversa_x" in df.columns else [],
        "condicoes_meteorologicas": safe_unique_sorted(df.get("condicao_metereologica_x", pd.Series(dtype=str))),
        "fases_dia": safe_unique_sorted(df.get("fase_dia_x", pd.Series(dtype=str))),
        "tipos_acidente": safe_unique_sorted(df.get("tipo_acidente_x", pd.Series(dtype=str))),
        "causas": safe_unique_sorted(df.get("causa_acidente_x", pd.Series(dtype=str))),
    }


# =========================
# ENDPOINTS DO DASHBOARD (FILTRÁVEIS)
# =========================
@app.get("/api/kpis")
def kpis(
    ano: Optional[str] = Query(default=None),
    mes: Optional[str] = Query(default=None),
    hora_inicio: Optional[int] = Query(default=None, ge=0, le=23),
    hora_fim: Optional[int] = Query(default=None, ge=0, le=23),
    condicao_met: Optional[str] = Query(default=None),
):
    df = build_filtered_df(ano, mes, hora_inicio, hora_fim, condicao_met)
    return process_kpis(df_input=df, save=False)

@app.get("/api/evolucao")
def evolucao(
    ano: Optional[str] = Query(default=None),
    mes: Optional[str] = Query(default=None),
    hora_inicio: Optional[int] = Query(default=None, ge=0, le=23),
    hora_fim: Optional[int] = Query(default=None, ge=0, le=23),
    condicao_met: Optional[str] = Query(default=None),
):
    df = build_filtered_df(ano, mes, hora_inicio, hora_fim, condicao_met)
    return process_evolucao_mensal(df_input=df, save=False)

@app.get("/api/causas")
def causas(
    ano: Optional[str] = Query(default=None),
    mes: Optional[str] = Query(default=None),
    hora_inicio: Optional[int] = Query(default=None, ge=0, le=23),
    hora_fim: Optional[int] = Query(default=None, ge=0, le=23),
    condicao_met: Optional[str] = Query(default=None),
):
    df = build_filtered_df(ano, mes, hora_inicio, hora_fim, condicao_met)
    return process_causas(df_input=df, save=False)

@app.get("/api/distribuicoes")
def distribuicoes(
    ano: Optional[str] = Query(default=None),
    mes: Optional[str] = Query(default=None),
    hora_inicio: Optional[int] = Query(default=None, ge=0, le=23),
    hora_fim: Optional[int] = Query(default=None, ge=0, le=23),
    condicao_met: Optional[str] = Query(default=None),
):
    df = build_filtered_df(ano, mes, hora_inicio, hora_fim, condicao_met)
    return process_distribuicoes(df_input=df, save=False)

@app.get("/api/rankings")
def rankings(
    ano: Optional[str] = Query(default=None),
    mes: Optional[str] = Query(default=None),
    hora_inicio: Optional[int] = Query(default=None, ge=0, le=23),
    hora_fim: Optional[int] = Query(default=None, ge=0, le=23),
    condicao_met: Optional[str] = Query(default=None),
):
    df = build_filtered_df(ano, mes, hora_inicio, hora_fim, condicao_met)
    return process_rankings(df_input=df, save=False)

@app.get("/api/areas-criticas")
def areas_criticas(
    ano: Optional[str] = Query(default=None),
    mes: Optional[str] = Query(default=None),
    hora_inicio: Optional[int] = Query(default=None, ge=0, le=23),
    hora_fim: Optional[int] = Query(default=None, ge=0, le=23),
    condicao_met: Optional[str] = Query(default=None),
):
    df = build_filtered_df(ano, mes, hora_inicio, hora_fim, condicao_met)
    return process_areas_criticas(df_input=df, save=False)


# =========================
# UPLOAD (CSV) — fecha ciclo
# =========================
@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Recebe um CSV e substitui o arquivo acidentes_mg_dashboard_master.csv.
    Observação: aqui é intencionalmente simples e direto.
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Envie um arquivo .csv")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    # salva no arquivo padrão
    out_path = "acidentes_mg_dashboard_master.csv"
    with open(out_path, "wb") as f:
        f.write(contents)

    # sanity-check rápido: tenta ler com sep=';'
    try:
        _ = pd.read_csv(out_path, sep=";", encoding="utf-8", engine="python")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV inválido (esperado ';'): {str(e)}")

    return {"message": "Upload concluído. Dados atualizados com sucesso.", "filename": file.filename}
