# -*- coding: utf-8 -*-
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def create_lstm_model(input_shape):
    model = Sequential([
        # Camada LSTM com 50 unidades
        LSTM(units=50, return_sequences=False, input_shape=input_shape),
        # Dropout de 20% para evitar overfitting
        Dropout(0.2),
        # Camada de saida para regressao (prever 1 valor)
        Dense(units=1)
    ])
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model
