"""
Signal processing utilities for EEG data
"""

import os
import logging
from typing import Tuple, List, Dict, Any
import numpy as np
import pandas as pd
from scipy import signal
from scipy.stats import zscore

from app.utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class SignalProcessor:
    """EEG signal processing utilities"""
    
    def __init__(self, sample_rate: int = None):
        self.sample_rate = sample_rate or settings.DEFAULT_SAMPLE_RATE
        
    def load_eeg_data(self, file_path: str) -> Tuple[np.ndarray, List[str]]:
        """Load EEG data from CSV file"""
        try:
            df = pd.read_csv(file_path)
            channels = df.columns.tolist()
            data = df.values.T  # Transpose to get channels x samples
            
            logger.info(f"Loaded EEG data: {data.shape[0]} channels, {data.shape[1]} samples")
            return data, channels
            
        except Exception as e:
            logger.error(f"Error loading EEG data: {e}")
            raise ValueError(f"Could not load EEG data from {file_path}: {e}")
    
    def apply_bandpass_filter(self, data: np.ndarray, low_freq: float, high_freq: float) -> np.ndarray:
        """Apply Butterworth bandpass filter"""
        nyquist = self.sample_rate / 2
        low = low_freq / nyquist
        high = high_freq / nyquist
        
        # Design Butterworth filter
        b, a = signal.butter(4, [low, high], btype='band')
        
        # Apply filter to each channel
        filtered_data = np.zeros_like(data)
        for i in range(data.shape[0]):
            filtered_data[i] = signal.filtfilt(b, a, data[i])
            
        logger.info(f"Applied bandpass filter: {low_freq}-{high_freq} Hz")
        return filtered_data
    
    def apply_notch_filter(self, data: np.ndarray, notch_freq: int) -> np.ndarray:
        """Apply notch filter to remove power line noise"""
        nyquist = self.sample_rate / 2
        freq = notch_freq / nyquist
        
        # Design notch filter
        b, a = signal.iirnotch(freq, Q=30)
        
        # Apply filter to each channel
        filtered_data = np.zeros_like(data)
        for i in range(data.shape[0]):
            filtered_data[i] = signal.filtfilt(b, a, data[i])
            
        logger.info(f"Applied notch filter: {notch_freq} Hz")
        return filtered_data
    
    def remove_artifacts(self, data: np.ndarray, threshold: float = 3.0) -> np.ndarray:
        """Remove artifacts using z-score thresholding"""
        cleaned_data = data.copy()
        artifacts_removed = 0
        
        for i in range(data.shape[0]):
            # Calculate z-scores
            z_scores = np.abs(zscore(data[i]))
            
            # Find artifact samples
            artifact_mask = z_scores > threshold
            
            if np.any(artifact_mask):
                # Replace artifacts with interpolated values
                clean_indices = np.where(~artifact_mask)[0]
                if len(clean_indices) > 1:
                    cleaned_data[i] = np.interp(
                        np.arange(len(data[i])),
                        clean_indices,
                        data[i, clean_indices]
                    )
                    artifacts_removed += np.sum(artifact_mask)
        
        logger.info(f"Removed {artifacts_removed} artifact samples")
        return cleaned_data
    
    def compute_psd(self, data: np.ndarray, channel_idx: int) -> Tuple[np.ndarray, np.ndarray]:
        """Compute Power Spectral Density using Welch's method"""
        channel_data = data[channel_idx]
        
        # Compute PSD using Welch's method
        frequencies, psd = signal.welch(
            channel_data,
            fs=self.sample_rate,
            nperseg=min(1024, len(channel_data) // 4),
            noverlap=min(512, len(channel_data) // 8)
        )
        
        return frequencies, psd
    
    def compute_band_power(self, data: np.ndarray, channel_idx: int) -> Dict[str, float]:
        """Compute band power for different frequency bands"""
        frequencies, psd = self.compute_psd(data, channel_idx)
        
        # Define frequency bands
        bands = {
            'delta': settings.DELTA_RANGE,
            'theta': settings.THETA_RANGE,
            'alpha': settings.ALPHA_RANGE,
            'beta': settings.BETA_RANGE,
            'gamma': settings.GAMMA_RANGE
        }
        
        band_powers = {}
        for band_name, (low_freq, high_freq) in bands.items():
            # Find frequency indices
            freq_mask = (frequencies >= low_freq) & (frequencies <= high_freq)
            
            if np.any(freq_mask):
                # Compute power in the band
                band_power = np.trapz(psd[freq_mask], frequencies[freq_mask])
                band_powers[band_name] = float(band_power)
            else:
                band_powers[band_name] = 0.0
        
        return band_powers
    
    def get_summary_stats(self, data: np.ndarray, channels: List[str]) -> Dict[str, Any]:
        """Get summary statistics for all channels"""
        stats = {}
        
        for i, channel in enumerate(channels):
            channel_data = data[i]
            stats[channel] = {
                'mean': float(np.mean(channel_data)),
                'std': float(np.std(channel_data)),
                'min': float(np.min(channel_data)),
                'max': float(np.max(channel_data)),
                'rms': float(np.sqrt(np.mean(channel_data**2)))
            }
        
        return {
            'channels': channels,
            'sample_rate': self.sample_rate,
            'duration_seconds': data.shape[1] / self.sample_rate,
            'channel_stats': stats
        }
    
    def save_processed_data(self, data: np.ndarray, channels: List[str], output_path: str) -> str:
        """Save processed data to CSV file"""
        try:
            # Transpose back to samples x channels for CSV
            df = pd.DataFrame(data.T, columns=channels)
            df.to_csv(output_path, index=False)
            
            logger.info(f"Saved processed data to {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error saving processed data: {e}")
            raise ValueError(f"Could not save processed data: {e}")
