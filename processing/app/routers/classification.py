"""
Classification router for EEG signal classification
"""

import os
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.schemas import ClassificationResponse
from app.services.classifier import EEGClassifier

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize classifier (singleton)
classifier = EEGClassifier()


class ClassificationRequestModel(BaseModel):
    """Request model for classification endpoint"""
    file_path: str


@router.post("/", response_model=ClassificationResponse)
async def classify_eeg_data(request: ClassificationRequestModel):
    """
    Classify EEG data using machine learning model
    """
    try:
        # Validate file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Perform classification
        result = classifier.classify(request.file_path)
        
        return ClassificationResponse(
            predicted_class=result['predicted_class'],
            probabilities=result['probabilities'],
            confidence=result['confidence'],
            classes=result['classes']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-info")
async def get_model_info():
    """
    Get information about the classification model
    """
    try:
        model_info = classifier.get_model_info()
        return model_info
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=str(e))
