"""
Pydantic models for request/response schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PreprocessRequest(BaseModel):
    """Request model for preprocessing"""
    file_path: str = Field(..., description="Path to the input file")
    bandpass: Optional[List[float]] = Field([1.0, 40.0], description="Bandpass filter frequencies [low, high]")
    notch: Optional[int] = Field(50, description="Notch filter frequency (50 or 60 Hz)")
    artifact: Optional[bool] = Field(True, description="Enable artifact rejection")


class PreprocessResponse(BaseModel):
    """Response model for preprocessing"""
    success: bool = Field(..., description="Whether preprocessing was successful")
    processed_file_path: str = Field(..., description="Path to the processed file")
    summary_stats: Dict[str, Any] = Field(..., description="Summary statistics")
    message: str = Field(..., description="Status message")


class PSDAnalysisRequest(BaseModel):
    """Request model for PSD analysis"""
    file_path: str = Field(..., description="Path to the input file")
    channel: str = Field(..., description="Channel name to analyze")


class PSDAnalysisResponse(BaseModel):
    """Response model for PSD analysis"""
    frequencies: List[float] = Field(..., description="Frequency bins")
    psd_values: List[float] = Field(..., description="Power spectral density values")
    channel: str = Field(..., description="Analyzed channel")
    sample_rate: int = Field(..., description="Sample rate")


class BandPowerAnalysisRequest(BaseModel):
    """Request model for band power analysis"""
    file_path: str = Field(..., description="Path to the input file")
    channel: str = Field(..., description="Channel name to analyze")


class BandPowerResponse(BaseModel):
    """Response model for band power analysis"""
    delta: float = Field(..., description="Delta band power (0.5-4 Hz)")
    theta: float = Field(..., description="Theta band power (4-8 Hz)")
    alpha: float = Field(..., description="Alpha band power (8-13 Hz)")
    beta: float = Field(..., description="Beta band power (13-30 Hz)")
    gamma: float = Field(..., description="Gamma band power (30-45 Hz)")
    channel: str = Field(..., description="Analyzed channel")


class ClassificationRequest(BaseModel):
    """Request model for classification"""
    file_path: str = Field(..., description="Path to the input file")
    window_length: Optional[float] = Field(2.0, description="Window length in seconds")


class ClassificationResponse(BaseModel):
    """Response model for classification"""
    predicted_class: str = Field(..., description="Predicted class")
    probabilities: Dict[str, float] = Field(..., description="Class probabilities")
    confidence: float = Field(..., description="Classification confidence")
    classes: List[str] = Field(..., description="Available classes")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
