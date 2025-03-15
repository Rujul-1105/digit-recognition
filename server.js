const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use a timestamp to ensure unique filenames
    cb(null, 'digit-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// API endpoint for prediction
app.post('/predict', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imagePath = req.file.path;
  
  // Run the Python script for prediction
  const pythonProcess = spawn('python', ['model/load_model.py', imagePath]);
  
  let prediction = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    prediction += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python script execution failed:', error);
      return res.status(500).json({ error: 'Failed to process image' });
    }
    
    // Read the image as base64 for sending back to client
    const imageData = fs.readFileSync(imagePath).toString('base64');
    
    // Send prediction and image data back to client
    res.json({
      prediction: prediction.trim(),
      imageData: imageData
    });
  });
});

// Check if the model exists, if not train it
const checkAndTrainModel = () => {
  const modelPath = 'model/digit_recognition_model.h5';
  
  if (!fs.existsSync(modelPath)) {
    console.log('Model not found. Training new model...');
    const pythonProcess = spawn('python', ['model/train_model.py']);
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Model training completed!');
      } else {
        console.error('Model training failed!');
      }
    });
  } else {
    console.log('Model already exists.');
  }
};

// Create necessary directories
const createDirectories = () => {
  const dirs = ['model', 'uploads', 'public'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  createDirectories();
  checkAndTrainModel();
});