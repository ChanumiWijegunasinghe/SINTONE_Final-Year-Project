import numpy as np
from .model_loader import get_model, get_encoder, get_max_len
from .preprocess import clean_text

CATEGORY_MAP = {
    0: "Neutral",
    1: "Racist",
    2: "Sexism",
    3: "Offensive"
}

TONE_MAP = {
    0: "NoTone",
    1: "Violent",
    2: "Mockery"
}

SHIFT_TOKEN_IDS_BY_1 = True

 # adjusts the token subword list to fixed length by padding with zeros
def pad(ids, max_len: int):
    ids = list(ids)
    return (ids + [0] * max_len)[:max_len]

# prediction function 
def predict_text(text: str):
    model = get_model() #loading the trained model
    encoder = get_encoder() #loading the saved subword-tokenizer encoder
    max_len = get_max_len() # getting the input sequence length required by the model

    cleaned = clean_text(text) # pre-process the input text

    if not cleaned.strip():
        raise ValueError("Text became empty after preprocessing")

    ids = encoder.encode(cleaned) # converting cleaned text to token IDs

    if not ids:
        raise ValueError("No tokens produced by encoder")

    if SHIFT_TOKEN_IDS_BY_1:
        ids = [int(tid) + 1 for tid in ids]
    else:
        ids = [int(tid) for tid in ids]

    ids = pad(ids, max_len=max_len)
    x = np.array([ids], dtype=np.int32)

    outputs = model.predict(x, verbose=0)

    cat_probs = None # storing category probabilities
    tone_probs = None  # storing tone probabilities

    for out in outputs if isinstance(outputs, (list, tuple)) else [outputs]:
        vec = np.array(out)[0]

        if vec.shape[0] == 4:
            cat_probs = vec
        elif vec.shape[0] == 3:
            tone_probs = vec

    if cat_probs is None:
        raise RuntimeError("Category output not found")

    cat_idx = int(np.argmax(cat_probs))
    category = CATEGORY_MAP.get(cat_idx, f"UNKNOWN_{cat_idx}")

    if category == "Neutral": # returning fixed tone for neutral category
        return {
            "input": text,
            "cleaned": cleaned,
            "category": "Neutral",
            "category_id": 0,
            "category_probs": [float(p) for p in cat_probs],
            "tone": "NoTone",
            "tone_id": 0,
            "tone_probs": [1.0, 0.0, 0.0]
        }

    if tone_probs is None:
        tone_probs = np.array([1.0, 0.0, 0.0], dtype=np.float32)

    tone_idx = int(np.argmax(tone_probs))

  # returning the final prediction result
    return {
        "input": text,
        "cleaned": cleaned,
        "category": category,
        "category_id": cat_idx,
        "category_probs": [float(p) for p in cat_probs],
        "tone": TONE_MAP.get(tone_idx, f"UNKNOWN_{tone_idx}"),
        "tone_id": tone_idx,
        "tone_probs": [float(p) for p in tone_probs]
    }