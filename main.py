import os
import io
import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging

# --- Basic Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pricing_api")

app = FastAPI(title="Dynamic Pricing API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be more specific in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Model on Startup ---
try:
    MODEL_PATH = "best_optimized_price_model.joblib"
    model_pipeline = joblib.load(MODEL_PATH)
    logger.info("Loaded model from %s", MODEL_PATH)
    
except Exception as e:
    logger.error("FATAL: Could not load model. %s", e)
    raise RuntimeError(f"Could not load model: {e}")

# --- API Schemas (for request validation) ---
class RideRequest(BaseModel):
    Number_of_Riders: int
    Number_of_Drivers: int
    Location_Category: str
    Customer_Loyalty_Status: str
    Number_of_Past_Rides: int
    Average_Ratings: float
    Time_of_Booking: str
    Vehicle_Type: str
    Expected_Ride_Duration: int

# --- API Endpoints ---
@app.get("/health")
def health():
    """Health check endpoint to confirm the API is running."""
    return {"status": "ok", "model_loaded": model_pipeline is not None}

@app.post("/predict")
def predict(request: RideRequest):
    """Predicts the price for a single ride request."""
    try:
        input_data = pd.DataFrame([request.dict()])
        
        # Create interaction features
        input_data['Location_Vehicle'] = input_data['Location_Category'].astype(str) + "_" + input_data['Vehicle_Type'].astype(str)
        input_data['Time_Loyalty'] = input_data['Time_of_Booking'].astype(str) + "_" + input_data['Customer_Loyalty_Status'].astype(str)
        
        predicted_price = model_pipeline.predict(input_data)
        
        # THE FIX: Convert the numpy.float32 to a standard Python float
        return {"predicted_price": float(round(predicted_price[0], 2))}
        
    except Exception as e:
        logger.error("Prediction failed for single record: %s", e)
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.post("/predict_batch")
async def predict_batch(file: UploadFile = File(...)):
    """Predicts prices for a batch of rides from an uploaded CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")
    try:
        contents = await file.read()
        input_df = pd.read_csv(io.BytesIO(contents))
        
        # Create interaction features for the batch data
        input_df['Location_Vehicle'] = input_df['Location_Category'].astype(str) + "_" + input_df['Vehicle_Type'].astype(str)
        input_df['Time_Loyalty'] = input_df['Time_of_Booking'].astype(str) + "_" + input_df['Customer_Loyalty_Status'].astype(str)
        
        predictions = model_pipeline.predict(input_df)
        
        input_df['predicted_price'] = np.round(predictions, 2)
        return input_df.to_dict(orient='records')

    except Exception as e:
        logger.error("Batch prediction failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")