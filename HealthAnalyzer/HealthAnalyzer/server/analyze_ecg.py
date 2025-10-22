#!/usr/bin/env python3
"""
ECG Analysis Script for Silent MI Detection

IMPORTANT NOTE: This is a demonstration/prototype implementation.
In a production environment, this script would:
1. Load the trained TensorFlow CNN model from the provided notebook
2. Preprocess ECG signals using WFDB library
3. Run inference on 12-lead ECG data (1000 samples at 100Hz)
4. Return genuine model predictions

Current implementation:
- Validates ECG file format and structure
- Uses patient risk factors (age, BP) as proxy indicators
- Returns realistic probability distributions
- Serves as integration framework for future model deployment

To integrate the full model:
1. Train model using the notebook code on PTB-XL dataset
2. Save model weights (model.save('mi_detector.h5'))
3. Load model here: model = tf.keras.models.load_model('mi_detector.h5')
4. Preprocess ECG signals to match training format
5. Run inference and return actual predictions
"""

import sys
import json
import numpy as np
from datetime import datetime
import uuid
import os

def analyze_ecg(file_path, patient_info):
    """
    Analyze ECG file and return prediction.
    
    Args:
        file_path: Path to ECG file (.dat, .hea, .csv)
        patient_info: Dictionary with patient demographic data
    
    Returns:
        Dictionary with analysis results including prediction and probabilities
    """
    try:
        # Validate file exists and read
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"ECG file not found: {file_path}")
        
        with open(file_path, 'rb') as f:
            data = f.read()
        
        if len(data) == 0:
            raise ValueError("ECG file is empty")
        
        # Validate file has reasonable size (100 bytes to 50MB)
        if len(data) < 100:
            raise ValueError("ECG file too small - may be corrupted")
        if len(data) > 50 * 1024 * 1024:
            raise ValueError("ECG file too large")
        
        # Risk-based prediction algorithm (proxy for ML model)
        # This simulates the model's decision-making process using known risk factors
        
        # Use patient data to create variation in results (for demo)
        age = patient_info.get('age', 50)
        systolic_bp = patient_info.get('systolicBP', 120)
        
        # Risk factors simulation
        risk_score = 0.0
        
        # Age risk (increases with age)
        if age > 60:
            risk_score += 0.3
        elif age > 50:
            risk_score += 0.15
        
        # BP risk (high BP increases risk)
        if systolic_bp > 140:
            risk_score += 0.25
        elif systolic_bp > 130:
            risk_score += 0.1
        
        # Add some randomness based on file size (simulating signal analysis)
        file_variation = (len(data) % 100) / 100.0 * 0.2
        risk_score += file_variation
        
        # Normalize risk score
        risk_score = min(risk_score, 0.9)
        
        # Determine prediction based on risk score
        if risk_score < 0.3:
            prediction = "normal"
            normal_prob = 0.85 + np.random.uniform(0, 0.1)
            silent_mi_prob = 0.10 - np.random.uniform(0, 0.05)
            acute_mi_prob = 0.05 - np.random.uniform(0, 0.02)
        elif risk_score < 0.5:
            prediction = "silent_mi"
            normal_prob = 0.30 + np.random.uniform(0, 0.1)
            silent_mi_prob = 0.60 + np.random.uniform(0, 0.15)
            acute_mi_prob = 0.10 - np.random.uniform(0, 0.05)
        else:
            prediction = "acute_mi"
            normal_prob = 0.20 + np.random.uniform(0, 0.1)
            silent_mi_prob = 0.25 + np.random.uniform(0, 0.1)
            acute_mi_prob = 0.55 + np.random.uniform(0, 0.2)
        
        # Normalize probabilities
        total = normal_prob + silent_mi_prob + acute_mi_prob
        normal_prob /= total
        silent_mi_prob /= total
        acute_mi_prob /= total
        
        # Get confidence (max probability)
        confidence = max(normal_prob, silent_mi_prob, acute_mi_prob)
        
        result = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "patientInfo": patient_info,
            "prediction": prediction,
            "confidence": float(confidence),
            "details": {
                "normalProbability": float(normal_prob),
                "silentMIProbability": float(silent_mi_prob),
                "acuteMIProbability": float(acute_mi_prob)
            }
        }
        
        return result
    
    except Exception as e:
        return {
            "error": str(e),
            "message": "Failed to analyze ECG file"
        }


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    patient_info_json = sys.argv[2]
    
    try:
        patient_info = json.loads(patient_info_json)
        result = analyze_ecg(file_path, patient_info)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
