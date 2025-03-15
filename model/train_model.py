import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential #type: ignore
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout #type: ignore
from tensorflow.keras.datasets import mnist #type: ignore
from tensorflow.keras.utils import to_categorical # type: ignore
import os

def train_model():
    print("Loading and preparing data...")
    # Load MNIST dataset
    (X_train, y_train), (X_test, y_test) = mnist.load_data()
    
    # Reshape and normalize the data
    X_train = X_train.reshape(X_train.shape[0], 28, 28, 1).astype('float32') / 255
    X_test = X_test.reshape(X_test.shape[0], 28, 28, 1).astype('float32') / 255
    
    # One-hot encode the labels
    y_train = to_categorical(y_train, 10)
    y_test = to_categorical(y_test, 10)
    
    # Build the CNN model
    model = Sequential([
        Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(28, 28, 1)),
        MaxPooling2D(pool_size=(2, 2)),
        Conv2D(64, kernel_size=(3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(10, activation='softmax')
    ])
    
    # Compile the model
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    print("Training model...")
    # Train the model
    model.fit(X_train, y_train, batch_size=128, epochs=50, validation_data=(X_test, y_test))
    
    # Evaluate the model
    score = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test loss: {score[0]}")
    print(f"Test accuracy: {score[1]}")
    
    # Save the model
    model.save('model/digit_recognition_model.h5')
    print("Model saved as 'model/digit_recognition_model.h5'")

if __name__ == "__main__":
    train_model()