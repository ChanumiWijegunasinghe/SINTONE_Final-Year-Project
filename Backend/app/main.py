from fastapi import FastAPI, HTTPException # importing FastAPI and error handling
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ml.predict import predict_text # importing the prediction function

app = FastAPI() # creating the FastAPI app object

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    text: str # defines the expected request body with a 'text' field of type string for input validation

@app.get("/health")
def health():
    return {"status": "ok"} # endpoint checks whether the server is running


@app.post("/predict")
def predict(req: PredictRequest):
    if req.text is None or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty") # returnx an error if the input is empty

    try:
        return predict_text(req.text) # if the input text is valid, the moves to the prediction function
    except FileNotFoundError as e:
        print("[ERROR] File not found:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:  # handles invalid input or pre-processing errors 
        print("[ERROR] Value error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except RuntimeError as e: # handles runtime errors 
        print("[ERROR] Runtime error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print("[ERROR] Unexpected error:", repr(e))
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")