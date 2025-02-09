from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import librosa
import numpy as np
import soundfile as sf
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["OPTIONS", "POST", "GET"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure upload folder
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'm4a', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def compute_jitter(f0):
    f0_clean = f0[~np.isnan(f0)]
    if len(f0_clean) < 2:
        return np.nan
    diff = np.abs(np.diff(f0_clean))
    return (np.mean(diff) / np.mean(f0_clean)) * 100

def compute_shimmer(rms):
    rms_clean = rms[~np.isnan(rms)]
    if len(rms_clean) < 2:
        return np.nan
    diff = np.abs(np.diff(rms_clean))
    return (np.mean(diff) / np.mean(rms_clean)) * 100

def analyze_voice(file_path):
    try:
        # Load the audio file
        y, sr = librosa.load(file_path, sr=16000, mono=True)

        # Extract pitch using pyin
        f0, voiced_flag, voiced_prob = librosa.pyin(y, 
                                                   fmin=50, 
                                                   fmax=500,
                                                   sr=sr,
                                                   frame_length=2048,
                                                   hop_length=512)

        # Compute mean pitch
        mean_pitch = np.nanmean(f0)
        if np.isnan(mean_pitch):
            raise ValueError("Could not detect pitch in the audio file")

        # Compute jitter
        jitter = compute_jitter(f0)
        
        # Compute RMS energy and shimmer
        hop_length = 512
        rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        shimmer = compute_shimmer(rms)

        return {
            'mean_pitch': float(mean_pitch),  # Convert to float for JSON serialization
            'jitter': float(jitter),
            'shimmer': float(shimmer)
        }

    except Exception as e:
        raise RuntimeError(f"Analysis failed: {str(e)}")
    
@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Methods"] = "OPTIONS, POST, GET"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route('/analyze', methods=['OPTIONS'])
def handle_options():
    response = jsonify({'message': 'CORS preflight successful'})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    return response

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze_audio():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file format'}), 400
    
    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Analyze the audio
        results = analyze_voice(filepath)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        # Clean up in case of error
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)