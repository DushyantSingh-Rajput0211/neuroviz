"""
NeuroViz Processing Service
FastAPI-based service for EEG signal processing and analysis
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import preprocessing, analytics, classification
from app.utils.config import get_settings
from app.utils.logging_config import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting NeuroViz Processing Service...")
    
    # Create storage directories if they don't exist
    os.makedirs(settings.STORAGE_PATH, exist_ok=True)
    os.makedirs(settings.RAW_DATA_PATH, exist_ok=True)
    os.makedirs(settings.PROCESSED_DATA_PATH, exist_ok=True)
    
    logger.info("Storage directories created")
    logger.info("NeuroViz Processing Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down NeuroViz Processing Service...")


# Create FastAPI app
app = FastAPI(
    title="NeuroViz Processing Service",
    description="Neural Signal Processing and Analysis API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(preprocessing.router, prefix="/preprocess", tags=["preprocessing"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(classification.router, prefix="/classify", tags=["classification"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "neuroviz-processing"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NeuroViz Processing Service",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    logger.error(f"HTTP error: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
