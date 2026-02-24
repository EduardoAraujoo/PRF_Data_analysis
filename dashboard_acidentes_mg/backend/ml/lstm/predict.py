# -*- coding: utf-8 -*-
import os
import sys
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Adiciona a raiz do projeto ao path
sys.path.append(os.getcwd())

from backend.ml.preprocessing.data import verify_and_load_data, prepare_lstm_data

def evaluate_metrics():
    print("--- INICIANDO AVALIACAO ETAPA 4 ---")
    
    # 1. Carregar dados e modelo
    df_daily = verify_and_load_data()
    if df_daily is None: return
    
    # Reutilizamos a funcao de preparacao para obter o scaler e X_test
    _, X_test, _, y_test, scaler = prepare_lstm_data(df_daily)
    
    model_path = 'backend/ml/lstm/model.h5'
    if not os.path.exists(model_path):
        print("Erro: Modelo nao encontrado.")
        return
    
    model = load_model(model_path)
    
    # 2. Realizar predicoes
    predictions = model.predict(X_test, verbose=0)
    
    # 3. Inverter normalizacao para escala real (numero de acidentes)
    # O scaler espera 2D, entao ajustamos o shape
    y_test_real = scaler.inverse_transform(y_test.reshape(-1, 1))
    predictions_real = scaler.inverse_transform(predictions)
    
    # 4. Calcular Metricas
    mae = mean_absolute_error(y_test_real, predictions_real)
    rmse = np.sqrt(mean_squared_error(y_test_real, predictions_real))
    
    metrics = {
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4)
    }
    
    print("\n--- RESULTADOS ---")
    print(f"MAE (Erro Medio Absoluto): {metrics['mae']}")
    print(f"RMSE (Raiz do Erro Quadratico Medio): {metrics['rmse']}")
    print("------------------")
    
    return metrics

if __name__ == '__main__':
    evaluate_metrics()
