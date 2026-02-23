import sys
import os
import pandas as pd

BASE_DIR = os.getcwd()
sys.path.append(BASE_DIR)

from utils.preprocessing_tf import prepare_time_series_data
from utils.lstm_model import build_and_train_lstm

def main():
    csv_path = 'acidentes_mg_dashboard_master.csv'
    if not os.path.exists(csv_path):
        csv_path = os.path.join('..', 'Uploads', 'acidentes_mg_dashboard_master.csv')
    
    print(f"📂 Carregando: {csv_path}")
    df = pd.read_csv(csv_path, sep=None, engine='python', encoding='latin1', on_bad_lines='skip')
    df['data_inversa'] = pd.to_datetime(df['data_inversa'], errors='coerce')
    
    X_train, X_test, y_train, y_test, scaler, _ = prepare_time_series_data(df)
    build_and_train_lstm(X_train, y_train, X_test, y_test)
    print("🎉 Treino concluído!")

if __name__ == "__main__":
    main()
