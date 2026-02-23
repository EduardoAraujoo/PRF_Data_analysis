from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys
import shutil
import os

ROOT = Path(__file__).resolve().parent
sys.path.append(str(ROOT))
sys.path.append(str(ROOT / "processors"))

from kpis_processor import process_kpis
from evolucao_processor import process_evolucao_mensal
from causas_processor import process_causas
from distribuicoes_processor import process_distribuicoes
from rankings_processor import process_rankings
from areas_criticas_processor import process_areas_criticas

app = FastAPI(title="Dashboard Acidentes MG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caminho onde o CSV master fica (ajuste conforme sua estrutura)
CSV_PATH = ROOT / "acidentes_mg_dashboard_master.csv"

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são permitidos.")
    
    try:
        # Salva o arquivo enviado substituindo o atual
        with open(CSV_PATH, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"message": f"Arquivo {file.filename} enviado e processado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {str(e)}")

@app.get("/api/kpis")
def api_kpis(): return process_kpis(save=False)

@app.get("/api/evolucao")
def api_evolucao(): return process_evolucao_mensal(save=False)

@app.get("/api/causas")
def api_causas(): return process_causas(save=False)

@app.get("/api/distribuicoes")
def api_distribuicoes(): return process_distribuicoes(save=False)

@app.get("/api/rankings")
def api_rankings(): return process_rankings(save=False)

@app.get("/api/areas-criticas")
def api_areas_criticas(): return process_areas_criticas(save=False)
