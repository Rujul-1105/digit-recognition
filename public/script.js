document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('image-input');
    const fileName = document.getElementById('file-name');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const predictionValue = document.getElementById('prediction-value');
    const uploadedImg = document.getElementById('uploaded-img');

    // Update the filename display when a file is selected
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileName.textContent = this.files[0].name;
        } else {
            fileName.textContent = 'No file chosen';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if file is selected
        if (!fileInput.files || !fileInput.files[0]) {
            showError('Please select an image file');
            return;
        }
        
        // Hide any previous results or errors
        results.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Show loading spinner
        loading.classList.remove('hidden');
        
        // Create FormData and send the request
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server responded with an error');
            }
            return response.json();
        })
        .then(data => {
            // Hide loading spinner
            loading.classList.add('hidden');
            
            // Display results
            predictionValue.textContent = data.prediction;
            uploadedImg.src = `data:image/jpeg;base64,${data.imageData}`;
            results.classList.remove('hidden');
        })
        .catch(error => {
            // Hide loading spinner
            loading.classList.add('hidden');
            
            // Show error message
            showError(error.message || 'Failed to process the image');
        });
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});
