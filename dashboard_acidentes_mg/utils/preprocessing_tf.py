import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models', 'tensorflow')

def prepare_time_series_data(df, time_steps=30):
    df = df.dropna(subset=['data_inversa']).sort_values('data_inversa')
    df_daily = df.groupby('data_inversa').size().reset_index(name='total_acidentes')
    df_daily.set_index('data_inversa', inplace=True)
    idx = pd.date_range(df_daily.index.min(), df_daily.index.max())
    df_daily = df_daily.reindex(idx, fill_value=0)
    
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df_daily[['total_acidentes']])
    
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'lstm_scaler.pkl'))
    
    X, y = [], []
    for i in range(len(scaled_data) - time_steps):
        X.append(scaled_data[i:(i + time_steps), 0])
        y.append(scaled_data[i + time_steps, 0])
        
    X, y = np.array(X), np.array(y)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    
    split = int(len(X) * 0.8)
    return X[:split], X[split:], y[:split], y[split:], scaler, df_daily
