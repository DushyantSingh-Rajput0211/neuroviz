"""
Tests for signal processing utilities
"""

import pytest
import numpy as np
import tempfile
import os
import pandas as pd
from app.services.signal_processor import SignalProcessor


class TestSignalProcessor:
    
    @pytest.fixture
    def processor(self):
        return SignalProcessor(sample_rate=250)
    
    @pytest.fixture
    def sample_eeg_data(self):
        """Create sample EEG data for testing"""
        # Generate 5 seconds of synthetic EEG data
        duration = 5
        sample_rate = 250
        n_samples = duration * sample_rate
        
        # Create synthetic data with different frequency components
        t = np.linspace(0, duration, n_samples)
        
        data = {
            'Fz': 0.5 * np.sin(2 * np.pi * 10 * t) + 0.1 * np.random.randn(n_samples),
            'Cz': 0.3 * np.sin(2 * np.pi * 20 * t) + 0.1 * np.random.randn(n_samples),
            'Pz': 0.4 * np.sin(2 * np.pi * 15 * t) + 0.1 * np.random.randn(n_samples),
        }
        
        return pd.DataFrame(data), list(data.keys())
    
    @pytest.fixture
    def temp_csv_file(self, sample_eeg_data):
        """Create a temporary CSV file with sample EEG data"""
        data, channels = sample_eeg_data
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            data.to_csv(f.name, index=False)
            yield f.name
        
        # Clean up
        os.unlink(f.name)
    
    def test_load_eeg_data(self, processor, temp_csv_file):
        """Test loading EEG data from CSV file"""
        data, channels = processor.load_eeg_data(temp_csv_file)
        
        assert data.shape[0] == len(channels)  # Number of channels
        assert data.shape[1] > 0  # Has samples
        assert channels == ['Fz', 'Cz', 'Pz']
    
    def test_apply_bandpass_filter(self, processor, sample_eeg_data):
        """Test bandpass filtering"""
        data_df, channels = sample_eeg_data
        data = data_df.values.T  # Convert to channels x samples format
        
        filtered_data = processor.apply_bandpass_filter(data, 1.0, 30.0)
        
        assert filtered_data.shape == data.shape
        assert not np.array_equal(filtered_data, data)  # Data should be modified
    
    def test_apply_notch_filter(self, processor, sample_eeg_data):
        """Test notch filtering"""
        data_df, channels = sample_eeg_data
        data = data_df.values.T
        
        filtered_data = processor.apply_notch_filter(data, 50)
        
        assert filtered_data.shape == data.shape
    
    def test_remove_artifacts(self, processor, sample_eeg_data):
        """Test artifact removal"""
        data_df, channels = sample_eeg_data
        data = data_df.values.T
        
        # Add some artifacts (high amplitude spikes)
        data[0, 100:110] = 100  # Add artifact to first channel
        
        cleaned_data = processor.remove_artifacts(data, threshold=3.0)
        
        assert cleaned_data.shape == data.shape
        # Artifacts should be reduced
        assert np.max(np.abs(cleaned_data[0, 100:110])) < np.max(np.abs(data[0, 100:110]))
    
    def test_compute_psd(self, processor, sample_eeg_data):
        """Test PSD computation"""
        data_df, channels = sample_eeg_data
        data = data_df.values.T
        
        frequencies, psd = processor.compute_psd(data, 0)  # First channel
        
        assert len(frequencies) > 0
        assert len(psd) > 0
        assert len(frequencies) == len(psd)
        assert np.all(psd >= 0)  # PSD values should be non-negative
    
    def test_compute_band_power(self, processor, sample_eeg_data):
        """Test band power computation"""
        data_df, channels = sample_eeg_data
        data = data_df.values.T
        
        band_powers = processor.compute_band_power(data, 0)
        
        expected_bands = ['delta', 'theta', 'alpha', 'beta', 'gamma']
        for band in expected_bands:
            assert band in band_powers
            assert band_powers[band] >= 0
    
    def test_get_summary_stats(self, processor, sample_eeg_data):
        """Test summary statistics computation"""
        data_df, channels = sample_eeg_data
        data = data_df.values.T
        
        stats = processor.get_summary_stats(data, channels)
        
        assert 'channels' in stats
        assert 'sample_rate' in stats
        assert 'duration_seconds' in stats
        assert 'channel_stats' in stats
        
        assert stats['channels'] == channels
        assert stats['sample_rate'] == 250
        
        for channel in channels:
            assert channel in stats['channel_stats']
            channel_stats = stats['channel_stats'][channel]
            assert 'mean' in channel_stats
            assert 'std' in channel_stats
            assert 'min' in channel_stats
            assert 'max' in channel_stats
            assert 'rms' in channel_stats
    
    def test_save_processed_data(self, processor, sample_eeg_data):
        """Test saving processed data"""
        data_df, channels = sample_eeg_data
        data = data_df.values.T
        
        with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as f:
            output_path = f.name
        
        try:
            saved_path = processor.save_processed_data(data, channels, output_path)
            
            assert saved_path == output_path
            assert os.path.exists(output_path)
            
            # Verify the saved file can be loaded
            loaded_data, loaded_channels = processor.load_eeg_data(output_path)
            assert loaded_channels == channels
            assert np.allclose(loaded_data, data)
        
        finally:
            if os.path.exists(output_path):
                os.unlink(output_path)
