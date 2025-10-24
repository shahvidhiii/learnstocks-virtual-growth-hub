# Required packages:
# pip install fastapi uvicorn numpy scikit-learn tensorflow python-multipart

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
import uvicorn
import traceback

app = FastAPI()

# Enable CORS to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # The origin of your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    symbol: str
    days: int
    closePrices: list[float]

@app.post("/predict")
def predict(data: PredictRequest):
    try:
        prices = np.array(data.closePrices).reshape(-1, 1)
        
        # 1. Scale the data
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_prices = scaler.fit_transform(prices)

        # 2. Determine the number of timesteps (look-back period)
        # NOTE: A fixed, well-tested timestep is better for production.
        # This dynamic approach is for demonstration.
        if data.days >= 90:
            timesteps = 15
        elif data.days >= 60:
            timesteps = 10
        else:
            timesteps = 5
        
        # Ensure we have enough data to create at least one sequence
        if len(scaled_prices) <= timesteps:
            return JSONResponse(
                content={"error": f"Not enough data for prediction. Need more than {timesteps} days, but got {len(scaled_prices)}."},
                status_code=400
            )

        # 3. Create sequences of data for the LSTM model
        X, y = [], []
        for i in range(timesteps, len(scaled_prices)):
            X.append(scaled_prices[i-timesteps:i, 0])
            y.append(scaled_prices[i, 0])
        X, y = np.array(X), np.array(y)
        
        # Reshape data to be [samples, timesteps, features]
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))

        # 4. Build and Train the LSTM model on-the-fly
        # IMPORTANT: In a real-world application, you would train a robust model offline
        # and simply load the pre-trained model here for inference.
        # Training on every API call is computationally expensive and not scalable.
        model = tf.keras.Sequential([
            tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)),
            tf.keras.layers.LSTM(50, return_sequences=False),
            tf.keras.layers.Dense(25),
            tf.keras.layers.Dense(1)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        
        # A small number of epochs is used to keep the request time low.
        model.fit(X, y, epochs=20, batch_size=1, verbose=0)

        # 5. Make the prediction
        # Get the last 'timesteps' number of days from the original data
        last_sequence = scaled_prices[-timesteps:].reshape(1, timesteps, 1)
        predicted_scaled_price = model.predict(last_sequence, verbose=0)
        
        # 6. Inverse the scaling to get the actual price
        predicted_price = scaler.inverse_transform(predicted_scaled_price)

        return JSONResponse(
            content={"symbol": data.symbol, "predicted_next_close": float(predicted_price[0][0])}
        )

    except Exception as e:
        # Return a detailed error message if anything goes wrong
        return JSONResponse(
            content={"error": str(e), "trace": traceback.format_exc()},
            status_code=500
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)