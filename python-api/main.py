from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
import uvicorn

app = FastAPI()

# Enable CORS (handles OPTIONS + adds headers automatically)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],   # or ["POST", "OPTIONS"]
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
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_prices = scaler.fit_transform(prices)

        # Decide timesteps based on days
        if data.days >= 90:
            timesteps = 15
        elif data.days >= 60:
            timesteps = 10
        else:
            timesteps = 5
        timesteps = min(timesteps, len(scaled_prices) - 2)  # safer bound

        if timesteps <= 0:
            return JSONResponse(
                content={"error": "Not enough data for the given timesteps"},
                status_code=400
            )

        X, y = [], []
        for i in range(len(scaled_prices) - timesteps):
            X.append(scaled_prices[i:i+timesteps])
            y.append(scaled_prices[i+timesteps])
        X, y = np.array(X), np.array(y)

        if len(X) == 0:
            # fallback: just return last known price
            last_price = scaler.inverse_transform(scaled_prices[-1].reshape(1, -1))
            pred_price = last_price[0][0]
        else:
            model = tf.keras.Sequential([
                tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)),
                tf.keras.layers.LSTM(50),
                tf.keras.layers.Dense(1)
            ])
            model.compile(optimizer='adam', loss='mean_squared_error')

            # train more for stability (still light enough for live requests)
            model.fit(X, y, epochs=20, batch_size=8, verbose=0)

            last_seq = scaled_prices[-timesteps:].reshape(1, timesteps, 1)
            pred_scaled = model.predict(last_seq, verbose=0)
            pred_price = scaler.inverse_transform(pred_scaled)[0][0]

        return JSONResponse(
            content={"symbol": data.symbol, "predicted_next_close": float(pred_price)}
        )

    except Exception as e:
        import traceback
        return JSONResponse(
            content={"error": str(e), "trace": traceback.format_exc()},
            status_code=500
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
