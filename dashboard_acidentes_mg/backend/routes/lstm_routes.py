# -*- coding: utf-8 -*-
from fastapi import APIRouter
import numpy as np
import pandas as pd
from datetime import timedelta
from tensorflow.keras.models import load_model
from sklearn.metrics import mean_absolute_error, mean_squared_error
import os

# Imports locais
from backend.ml.preprocessing.data import verify_and_load_data, prepare_lstm_data

router = APIRouter()

@router.get("/api/predict/lstm")
async def get_lstm_prediction():
    # 1. Carregar dados e modelo
    df_daily = verify_and_load_data()
    if df_daily is None:
        return {"error": "Dados nao encontrados"}
        
    X_train, X_test, y_train, y_test, scaler = prepare_lstm_data(df_daily)
    model = load_model('backend/ml/lstm/model.h5')
    
    # 2. Calcular Metricas (usando o conjunto de teste)
    y_pred_test = model.predict(X_test, verbose=0)
    y_test_real = scaler.inverse_transform(y_test.reshape(-1, 1))
    y_pred_real = scaler.inverse_transform(y_pred_test)
    
    mae = float(mean_absolute_error(y_test_real, y_pred_real))
    rmse = float(np.sqrt(mean_squared_error(y_test_real, y_pred_real)))
    
    # 3. Gerar Previsao para os proximos 30 dias (Loop Iterativo)
    # Pegamos os ultimos 30 dias conhecidos para iniciar a previsao
    last_window = scaler.transform(df_daily[['total_acidentes']].values[-30:])
    current_batch = last_window.reshape((1, 30, 1))
    
    future_predictions = []
    for _ in range(30):
        # Predicao do proximo valor
        next_pred = model.predict(current_batch, verbose=0)
        future_predictions.append(next_pred[0, 0])
        
        # Atualiza a janela: remove o primeiro e adiciona a predicao no fim
        next_pred_reshaped = next_pred.reshape((1, 1, 1))
        current_batch = np.append(current_batch[:, 1:, :], next_pred_reshaped, axis=1)
    
    # Inverte a normalizacao das previsoes futuras
    future_real = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))
    
    # 4. Formatar datas futuras
    last_date = df_daily.index.max()
    future_dates = [last_date + timedelta(days=i+1) for i in range(30)]
    
    # 5. Montar Resposta Final
    response = {
        "historico": [
            {"date": str(date.date()), "acidentes": int(val)} 
            for date, val in zip(df_daily.index[-90:], df_daily['total_acidentes'][-90:])
        ],
        "previsao_30_dias": [
            {"date": str(date.date()), "predicao": round(float(val), 2)} 
            for date, val in zip(future_dates, future_real.flatten())
        ],
        "mae": round(mae, 4),
        "rmse": round(rmse, 4)
    }
    
    return response
