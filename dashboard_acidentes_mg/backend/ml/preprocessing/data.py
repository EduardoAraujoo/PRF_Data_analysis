# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler

def verify_and_load_data():
    candidates = ["acidentes_mg_dashboard_master.csv", "../Uploads/acidentes_mg_dashboard_master.csv"]
    path = next((p for p in candidates if os.path.exists(p)), None)
    if not path: return None
    
    df = pd.read_csv(path, sep=None, engine='python', encoding='latin1', on_bad_lines='skip')
    if 'data_inversa_x' in df.columns:
        df = df.rename(columns={'data_inversa_x': 'data_inversa'})
    
    df['data_inversa'] = pd.to_datetime(df['data_inversa'], errors='coerce')
    df = df.dropna(subset=['data_inversa'])
    
    df_daily = df.groupby('data_inversa').size().reset_index(name='total_acidentes')
    df_daily = df_daily.set_index('data_inversa').sort_index()
    # Garantir continuidade diaria
    df_daily = df_daily.asfreq('D').fillna(0)
    return df_daily

def prepare_lstm_data(df_daily, lookback=30):
    # 1. Normalizacao
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df_daily[['total_acidentes']].values)
    
    # 2. Criacao de janelas de sequencia
    X, y = [], []
    for i in range(lookback, len(scaled_data)):
        X.append(scaled_data[i-lookback:i, 0])
        y.append(scaled_data[i, 0])
        
    X, y = np.array(X), np.array(y)
    
    # Reshape para [samples, time steps, features]
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    
    # 3. Separacao em treino e teste (80/20)
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    return X_train, X_test, y_train, y_test, scaler

if __name__ == '__main__':
    df_daily = verify_and_load_data()
    if df_daily is not None:
        X_train, X_test, y_train, y_test, scaler = prepare_lstm_data(df_daily)
        print("--- RELATORIO ETAPA 2 ---")
        print(f"Dados originais: {len(df_daily)} dias")
        print(f"X_train shape: {X_train.shape}")
        print(f"X_test shape: {X_test.shape}")
        print("Normalizacao: Concluida (MinMaxScaler)")
        print(f"Janelas (Lookback): 30 dias")
        print("-------------------------")
