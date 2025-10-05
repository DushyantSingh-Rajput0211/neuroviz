"""
Preprocessing router for EEG signal processing
"""

import os
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.schemas import PreprocessRequest, PreprocessResponse
from app.services.signal_processor import SignalProcessor
from app.utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter()


class PreprocessRequestModel(BaseModel):
    """Request model for preprocessing endpoint"""
    file_path: str
    params: str  # JSON string of parameters


@router.post("/", response_model=PreprocessResponse)
async def preprocess_eeg_data(request: PreprocessRequestModel):
    """
    Preprocess EEG data with filtering and artifact removal
    """
    try:
        # Parse parameters (simplified - in production, use proper JSON parsing)
        import json
        try:
            params = json.loads(request.params)
        except:
            params = {}
        
        # Extract parameters with defaults
        bandpass = params.get('bandpass', [settings.DEFAULT_BANDPASS_LOW, settings.DEFAULT_BANDPASS_HIGH])
        notch = params.get('notch', settings.DEFAULT_NOTCH_FREQ)
        artifact = params.get('artifact', True)
        
        # Validate file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Initialize processor
        processor = SignalProcessor()
        
        # Load EEG data
        data, channels = processor.load_eeg_data(request.file_path)
        
        # Apply preprocessing
        processed_data = data.copy()
        
        # Bandpass filter
        if bandpass and len(bandpass) == 2:
            processed_data = processor.apply_bandpass_filter(
                processed_data, bandpass[0], bandpass[1]
            )
        
        # Notch filter
        if notch:
            processed_data = processor.apply_notch_filter(processed_data, notch)
        
        # Artifact removal
        if artifact:
            processed_data = processor.remove_artifacts(processed_data)
        
        # Generate output filename
        input_filename = os.path.basename(request.file_path)
        name, ext = os.path.splitext(input_filename)
        output_filename = f"{name}_processed{ext}"
        output_path = os.path.join(settings.PROCESSED_DATA_PATH, output_filename)
        
        # Save processed data
        processor.save_processed_data(processed_data, channels, output_path)
        
        # Get summary statistics
        summary_stats = processor.get_summary_stats(processed_data, channels)
        
        return PreprocessResponse(
            success=True,
            processed_file_path=output_path,
            summary_stats=summary_stats,
            message="Preprocessing completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
