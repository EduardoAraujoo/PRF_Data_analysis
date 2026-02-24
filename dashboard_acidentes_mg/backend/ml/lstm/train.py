# -*- coding: utf-8 -*-
import os
import sys
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Adiciona a raiz do projeto ao path
sys.path.append(os.getcwd())

from backend.ml.preprocessing.data import verify_and_load_data, prepare_lstm_data
from backend.ml.lstm.model import create_lstm_model

def train_optimized_model():
    print("--- INICIANDO TREINAMENTO OTIMIZADO ---")
    
    df_daily = verify_and_load_data()
    if df_daily is None: return
    
    X_train, X_test, y_train, y_test, scaler = prepare_lstm_data(df_daily)
    model = create_lstm_model((X_train.shape[1], 1))
    
    # Configura os Callbacks
    callbacks = [
        # Para o treino se a perda de validacao nao melhorar por 5 epocas
        EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
        # Salva o melhor modelo encontrado durante o processo
        ModelCheckpoint('backend/ml/lstm/best_model.keras', save_best_only=True)
    ]
    
    print("Treinando com EarlyStopping e Checkpoint...")
    model.fit(
        X_train, y_train,
        epochs=50, # Aumentamos o limite, o EarlyStopping cuidara do resto
        batch_size=32,
        validation_split=0.1,
        callbacks=callbacks,
        verbose=1
    )
    
    # Salva tambem no formato legado se necessario para sua rota atual
    model.save('backend/ml/lstm/model.h5')
    print("✅ Treinamento concluido com sucesso!")

if __name__ == '__main__':
    train_optimized_model()
