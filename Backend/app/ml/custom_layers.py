import tensorflow as tf  
from tensorflow.keras import layers


@tf.keras.utils.register_keras_serializable() # ensuring this custom layer to be saved and loaded with the model
class AttentionPooling1D(layers.Layer): # defining the custom attention pooling layer
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.score_dense = layers.Dense(1, name="bigru_attention_score") # creating a Dense layer to compute the attention scores

    def call(self, inputs):
        scores = self.score_dense(inputs)         # computing attention scores for each times step
        weights = tf.nn.softmax(scores, axis=1)   # normlizing scores into attention weights.
        weighted = inputs * weights               # applying weights into input features
        return tf.reduce_sum(weighted, axis=1)   

    def get_config(self):
        return super().get_config()