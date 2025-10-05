"""
EEG classification service using lightweight ML models
"""

import os
import logging
import pickle
from typing import Dict, List, Tuple
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from app.utils.config import get_settings
from app.services.signal_processor import SignalProcessor

logger = logging.getLogger(__name__)
settings = get_settings()


class EEGClassifier:
    """EEG signal classification using machine learning"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.classes = ["rest", "left", "right"]
        self.feature_names = None
        self.model_path = os.path.join(settings.MODEL_PATH, settings.DEFAULT_MODEL_NAME)
        self.processor = SignalProcessor()
        
        # Load or create model
        self._load_or_create_model()
    
    def _load_or_create_model(self) -> None:
        """Load existing model or create a new one"""
        try:
            if os.path.exists(self.model_path):
                self._load_model()
                logger.info("Loaded existing EEG classifier model")
            else:
                self._create_model()
                logger.info("Created new EEG classifier model")
        except Exception as e:
            logger.error(f"Error loading/creating model: {e}")
            self._create_model()
    
    def _load_model(self) -> None:
        """Load model from file"""
        with open(self.model_path, 'rb') as f:
            model_data = pickle.load(f)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.classes = model_data['classes']
    
    def _save_model(self) -> None:
        """Save model to file"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'classes': self.classes
        }
        
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
    
    def _create_model(self) -> None:
        """Create and train a new model with synthetic data"""
        logger.info("Creating new EEG classifier model with synthetic data")
        
        # Generate synthetic training data
        X_train, y_train = self._generate_synthetic_data(n_samples=1000)
        
        # Extract features
        X_features = self._extract_features_batch(X_train)
        self.feature_names = [f"feature_{i}" for i in range(X_features.shape[1])]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X_features)
        
        # Train Random Forest classifier
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_scaled, y_train)
        
        # Save the model
        self._save_model()
        
        logger.info("Model training completed")
    
    def _generate_synthetic_data(self, n_samples: int = 1000) -> Tuple[List[np.ndarray], List[str]]:
        """Generate synthetic EEG data for training"""
        X = []
        y = []
        
        for i in range(n_samples):
            # Generate random class
            class_label = np.random.choice(self.classes)
            
            # Generate synthetic EEG data based on class
            if class_label == "rest":
                # Rest state: more alpha waves (8-13 Hz)
                data = self._generate_alpha_dominant_signal()
            elif class_label == "left":
                # Left motor imagery: more beta in right hemisphere (C4)
                data = self._generate_motor_imagery_signal(hemisphere="left")
            else:  # right
                # Right motor imagery: more beta in left hemisphere (C3)
                data = self._generate_motor_imagery_signal(hemisphere="right")
            
            X.append(data)
            y.append(class_label)
        
        return X, y
    
    def _generate_alpha_dominant_signal(self) -> np.ndarray:
        """Generate alpha-dominant EEG signal (rest state)"""
        duration = 2.0  # 2 seconds
        sample_rate = settings.DEFAULT_SAMPLE_RATE
        n_samples = int(duration * sample_rate)
        
        # Generate alpha waves (8-13 Hz) with some noise
        t = np.linspace(0, duration, n_samples)
        
        # Alpha wave
        alpha_freq = np.random.uniform(8, 13)
        alpha_signal = 0.5 * np.sin(2 * np.pi * alpha_freq * t)
        
        # Add noise
        noise = 0.1 * np.random.randn(n_samples)
        
        return alpha_signal + noise
    
    def _generate_motor_imagery_signal(self, hemisphere: str) -> np.ndarray:
        """Generate motor imagery EEG signal"""
        duration = 2.0
        sample_rate = settings.DEFAULT_SAMPLE_RATE
        n_samples = int(duration * sample_rate)
        
        t = np.linspace(0, duration, n_samples)
        
        # Beta waves (13-30 Hz) for motor imagery
        beta_freq = np.random.uniform(13, 20)
        beta_signal = 0.3 * np.sin(2 * np.pi * beta_freq * t)
        
        # Add some gamma activity (30-45 Hz)
        gamma_freq = np.random.uniform(30, 40)
        gamma_signal = 0.2 * np.sin(2 * np.pi * gamma_freq * t)
        
        # Add noise
        noise = 0.1 * np.random.randn(n_samples)
        
        return beta_signal + gamma_signal + noise
    
    def _extract_features_batch(self, signals: List[np.ndarray]) -> np.ndarray:
        """Extract features from a batch of signals"""
        features = []
        
        for signal in signals:
            signal_features = self._extract_features_single(signal)
            features.append(signal_features)
        
        return np.array(features)
    
    def _extract_features_single(self, signal: np.ndarray) -> np.ndarray:
        """Extract features from a single signal"""
        features = []
        
        # Time domain features
        features.extend([
            np.mean(signal),           # Mean
            np.std(signal),            # Standard deviation
            np.var(signal),            # Variance
            np.max(signal) - np.min(signal),  # Range
            np.sqrt(np.mean(signal**2)),      # RMS
        ])
        
        # Frequency domain features
        freqs, psd = self.processor.compute_psd(signal.reshape(1, -1), 0)
        
        # Band power features
        band_powers = self.processor.compute_band_power(signal.reshape(1, -1), 0)
        features.extend([
            band_powers['delta'],
            band_powers['theta'],
            band_powers['alpha'],
            band_powers['beta'],
            band_powers['gamma']
        ])
        
        # Spectral features
        features.extend([
            np.mean(psd),              # Mean PSD
            np.std(psd),               # PSD standard deviation
            freqs[np.argmax(psd)],     # Peak frequency
            np.sum(psd),               # Total power
        ])
        
        return np.array(features)
    
    def classify(self, file_path: str, window_length: float = 2.0) -> Dict[str, any]:
        """Classify EEG data from file"""
        try:
            # Load EEG data
            data, channels = self.processor.load_eeg_data(file_path)
            
            # Use first channel for classification (could be extended to multi-channel)
            if len(channels) == 0:
                raise ValueError("No channels found in EEG data")
            
            channel_data = data[0]  # Use first channel
            
            # Extract window of data
            sample_rate = settings.DEFAULT_SAMPLE_RATE
            window_samples = int(window_length * sample_rate)
            
            if len(channel_data) < window_samples:
                # Use all available data if window is too large
                window_data = channel_data
            else:
                # Use middle portion of the signal
                start_idx = len(channel_data) // 2 - window_samples // 2
                window_data = channel_data[start_idx:start_idx + window_samples]
            
            # Extract features
            features = self._extract_features_single(window_data)
            
            # Scale features
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            
            # Make prediction
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Create result
            result = {
                'predicted_class': prediction,
                'probabilities': dict(zip(self.classes, probabilities)),
                'confidence': float(np.max(probabilities)),
                'classes': self.classes,
                'features_used': len(features)
            }
            
            logger.info(f"Classification result: {prediction} (confidence: {result['confidence']:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Error during classification: {e}")
            raise ValueError(f"Classification failed: {e}")
    
    def get_model_info(self) -> Dict[str, any]:
        """Get information about the current model"""
        return {
            'model_type': 'RandomForestClassifier',
            'classes': self.classes,
            'feature_count': len(self.feature_names) if self.feature_names else 0,
            'feature_names': self.feature_names,
            'model_path': self.model_path,
            'model_exists': os.path.exists(self.model_path)
        }
