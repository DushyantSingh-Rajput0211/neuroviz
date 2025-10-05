"""
Analytics router for EEG signal analysis
"""

import os
import logging
from fastapi import APIRouter, HTTPException, Query
from typing import List

from app.models.schemas import PSDAnalysisResponse, BandPowerResponse
from app.services.signal_processor import SignalProcessor

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/psd", response_model=PSDAnalysisResponse)
async def get_psd_analysis(
    file: str = Query(..., description="Path to the EEG file"),
    channel: str = Query(..., description="Channel name to analyze")
):
    """
    Compute Power Spectral Density (PSD) analysis for a specific channel
    """
    try:
        # Validate file exists
        if not os.path.exists(file):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Initialize processor
        processor = SignalProcessor()
        
        # Load EEG data
        data, channels = processor.load_eeg_data(file)
        
        # Find channel index
        try:
            channel_idx = channels.index(channel)
        except ValueError:
            raise HTTPException(status_code=404, detail=f"Channel '{channel}' not found")
        
        # Compute PSD
        frequencies, psd_values = processor.compute_psd(data, channel_idx)
        
        return PSDAnalysisResponse(
            frequencies=frequencies.tolist(),
            psd_values=psd_values.tolist(),
            channel=channel,
            sample_rate=processor.sample_rate
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PSD analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bandpower", response_model=BandPowerResponse)
async def get_band_power_analysis(
    file: str = Query(..., description="Path to the EEG file"),
    channel: str = Query(..., description="Channel name to analyze")
):
    """
    Compute band power analysis for different frequency bands
    """
    try:
        # Validate file exists
        if not os.path.exists(file):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Initialize processor
        processor = SignalProcessor()
        
        # Load EEG data
        data, channels = processor.load_eeg_data(file)
        
        # Find channel index
        try:
            channel_idx = channels.index(channel)
        except ValueError:
            raise HTTPException(status_code=404, detail=f"Channel '{channel}' not found")
        
        # Compute band power
        band_powers = processor.compute_band_power(data, channel_idx)
        
        return BandPowerResponse(
            delta=band_powers['delta'],
            theta=band_powers['theta'],
            alpha=band_powers['alpha'],
            beta=band_powers['beta'],
            gamma=band_powers['gamma'],
            channel=channel
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Band power analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
