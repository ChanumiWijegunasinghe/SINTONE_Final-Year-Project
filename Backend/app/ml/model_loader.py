from pathlib import Path
import tensorflow as tf
import tensorflow_datasets as tfds

from .custom_layers import AttentionPooling1D

BASE_DIR = Path(__file__).resolve().parents[1]
ASSETS_DIR = BASE_DIR / "assets"

MODEL_PATH = ASSETS_DIR / "best_cnn_bigru_model.keras" # path to saved model file
ENCODER_PREFIX = ASSETS_DIR / "final_tokenized_encoder" # path sub-word tokenizer encoder file

_model = None  # defining the variable to store loaded model
_encoder = None  # defining the variable to store loaded encoder

#masked tone function  
def masked_tone_accuracy(y_true, y_pred):  
    y_true = tf.cast(y_true, tf.int64)
    y_pred_label = tf.argmax(y_pred, axis=-1, output_type=tf.int64)

    mask = tf.not_equal(y_true, 0)
    mask_f = tf.cast(mask, tf.float32)

    correct = tf.cast(tf.equal(y_true, y_pred_label), tf.float32) * mask_f
    return tf.math.divide_no_nan(tf.reduce_sum(correct), tf.reduce_sum(mask_f))

# loading the best saved model for prediction
def get_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

        print(f"[INFO] Loading model from: {MODEL_PATH}")

        _model = tf.keras.models.load_model(
            MODEL_PATH,
            custom_objects={
                "masked_tone_accuracy": masked_tone_accuracy,
                "AttentionPooling1D": AttentionPooling1D,
            },
            compile=False,
            safe_mode=False,
        )

        print("[INFO] Model loaded successfully")
        print(f"[INFO] Model input shape: {_model.input_shape}")
        print(f"[INFO] Model output shape: {_model.output_shape}")

    return _model

# loading the sub-word tokenizer encoder for prediction
def get_encoder():
    global _encoder

    if _encoder is None:
        encoder_file = Path(str(ENCODER_PREFIX) + ".subwords")
        if not encoder_file.exists():
            raise FileNotFoundError(f"Encoder file not found at: {encoder_file}")

        print(f"[INFO] Loading encoder from: {encoder_file}")
        _encoder = tfds.deprecated.text.SubwordTextEncoder.load_from_file(
            str(ENCODER_PREFIX)
        )
        print("[INFO] Encoder loaded successfully")

    return _encoder

# returns the maximum input sequence length expected by the model by reading its input shape
def get_max_len() -> int:
    model = get_model()

    if not hasattr(model, "input_shape") or model.input_shape is None:
        raise RuntimeError("Model input_shape is not available.")

    if len(model.input_shape) < 2 or model.input_shape[1] is None:
        raise RuntimeError(f"Unexpected model input_shape: {model.input_shape}")

    return int(model.input_shape[1])