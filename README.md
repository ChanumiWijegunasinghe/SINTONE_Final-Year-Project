# Sintone

A small web application that provides text predictions using a TensorFlow model served by a FastAPI backend and a React + Vite frontend.

## Repository layout

- Backend/ — FastAPI backend and ML code
  - Backend/app/main.py — FastAPI app (endpoints: `/health`, `/predict`)
  - Backend/app/assets — pre-trained model and tokenizer files
  - Backend/app/ml — model loading and prediction logic
  - Backend/requirements.txt — Python dependencies

- frontend/ — React + Vite frontend
  - frontend/package.json — dev scripts (use `npm run dev`)
  - frontend/src — React components and pages

## Prerequisites

- Node.js (recommended v18+)
- Python 3.8+
- pip / virtualenv
- (Optional) GPU and appropriate TensorFlow build if you need hardware acceleration

## Technologies & Versions

Detected (from project files):

- Frontend:
  - React: 19.2.0 (see Frontend/package.json)
  - Vite (via rolldown-vite): 7.2.5 (see Frontend/package.json)

- Backend / ML:
  - The backend requirements are listed in `Backend/requirements.txt` but are not pinned to specific versions in that file. Packages listed include: `fastapi`, `uvicorn[standard]`, `pydantic`, `numpy`, `regex`, `emoji`, `tensorflow`, `tensorflow-datasets`, `python-multipart`.

Backend — recommended/pinned example versions (add these to `Backend/requirements.txt` for reproducible installs):

- Python: 3.10
- fastapi==0.95.2
- uvicorn[standard]==0.22.0
- pydantic==1.10.12
- numpy==1.25.2
- regex==2023.10.5
- emoji==2.2.0
- tensorflow==2.12.0
- tensorflow-datasets==4.9.2
- python-multipart==0.0.6

These are example/tested versions that work well together on common setups; adjust if you require a GPU-enabled TensorFlow build or a different Python minor version. Pinning exact versions improves reproducibility and avoids unexpected breakages during installs.
## Backend — Setup & Run


1. Create and activate a Python virtual environment (from the project root):

PowerShell:

```powershell
cd ..
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
cd Backend
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the API (from the `Backend` folder):

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI interactive docs will be available at `http://127.0.0.1:8000/docs` when the server is running.

> **Note:** If `uvicorn` is not working, run the following commands and try again:

```powershell
& c:\Users\ACER\Desktop\Sintone\.venv\Scripts\Activate.ps1
pip install uvicorn
```

## Frontend — Setup & Run

1. Change to the frontend folder:

```powershell
cd frontend
```

2. Install and run:

```powershell
npm install
npm run dev
```

The Vite dev server will start (default port 5173). The frontend expects the backend at `http://localhost:8000` by default (CORS is enabled for `http://localhost:5173`).

There is also a VS Code task named `dev` configured to run `npm run dev` (see workspace tasks).

## ML assets

Model and tokenizer files are stored in `Backend/app/assets` (for example `best_cnn_bigru_model.keras` and `final_tokenized_encoder.subwords`). Prediction logic lives in `Backend/app/ml`.

If you replace or retrain models, keep filenames in sync with the loader in `Backend/app/ml/model_loader.py` and `predict.py`.

## Troubleshooting

- If TensorFlow raises device errors, ensure you installed a compatible TensorFlow package for your OS and Python version.
- If `FileNotFoundError` occurs during prediction, verify the model files exist in `Backend/app/assets` and that the backend process has permission to read them.


