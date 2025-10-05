"""
Configuration management for the processing service
"""

import os
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Storage paths
    STORAGE_PATH: str = "/app/storage"
    RAW_DATA_PATH: str = "/app/storage/raw"
    PROCESSED_DATA_PATH: str = "/app/storage/processed"
    
    # Processing parameters
    DEFAULT_SAMPLE_RATE: int = 250
    DEFAULT_BANDPASS_LOW: float = 1.0
    DEFAULT_BANDPASS_HIGH: float = 40.0
    DEFAULT_NOTCH_FREQ: int = 50
    
    # Band power frequency ranges (Hz)
    DELTA_RANGE: List[float] = [0.5, 4.0]
    THETA_RANGE: List[float] = [4.0, 8.0]
    ALPHA_RANGE: List[float] = [8.0, 13.0]
    BETA_RANGE: List[float] = [13.0, 30.0]
    GAMMA_RANGE: List[float] = [30.0, 45.0]
    
    # ML Model settings
    MODEL_PATH: str = "/app/models"
    DEFAULT_MODEL_NAME: str = "eeg_classifier.h5"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
