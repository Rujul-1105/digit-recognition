# // ===== model/load_model.py =====
import sys
import numpy as np
import cv2
import tensorflow as tf

def preprocess_image(image_path):
    # Read the image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Resize to 28x28
    img = cv2.resize(img, (28, 28))
    
    # Invert image (white on black to black on white)
    img = 255 - img
    
    # Apply thresholding
    _, img = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)
    
    # Reshape and normalize
    img = img.reshape(1, 28, 28, 1).astype('float32') / 255
    
    return img

def make_prediction(model, image):
    # Get prediction
    prediction = model.predict(image, verbose=0)
    # Return digit with highest probability
    return np.argmax(prediction)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python load_model.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Load the model
    model = tf.keras.models.load_model('model/digit_recognition_model.h5')
    
    # Preprocess the image
    processed_image = preprocess_image(image_path)
    
    # Make prediction
    digit = make_prediction(model, processed_image)
    
    # Print result (this will be captured by Node.js)
    print(digit)