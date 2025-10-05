#!/usr/bin/env python3
"""
Demo Data Seeder
Creates demo EEG sessions and data for testing
"""

import requests
import json
import os
import sys
from pathlib import Path

# Configuration
BASE_URL = "http://localhost/api"
DEMO_USER = {
    "email": "demo@neuroviz.ai",
    "password": "Demo@123"
}

def make_request(method: str, endpoint: str, data: dict = None, token: str = None):
    """Make HTTP request to API"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def login():
    """Login and get auth token"""
    print("Logging in...")
    response = make_request("POST", "/auth/login", DEMO_USER)
    
    if response and response.get("token"):
        print("✓ Login successful")
        return response["token"]
    else:
        print("✗ Login failed")
        return None

def upload_demo_session(token: str):
    """Upload demo EEG session"""
    print("Creating demo session...")
    
    # Get demo CSV file path
    demo_file = Path(__file__).parent / "demo_eeg.csv"
    
    if not demo_file.exists():
        print(f"✗ Demo file not found: {demo_file}")
        return None
    
    # Prepare form data
    files = {
        'file': ('demo_eeg.csv', open(demo_file, 'rb'), 'text/csv')
    }
    data = {
        'name': 'Demo EEG Recording',
        'description': 'Sample EEG data with 9 channels for testing NeuroViz features',
        'notes': 'This is demo data generated for testing purposes. It contains synthetic EEG signals across multiple channels.'
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/sessions",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        response.raise_for_status()
        result = response.json()
        
        if result.get("success"):
            session = result["data"]
            print(f"✓ Demo session created: {session['name']} (ID: {session['id']})")
            return session
        else:
            print(f"✗ Failed to create session: {result.get('message', 'Unknown error')}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Upload failed: {e}")
        return None
    finally:
        files['file'][1].close()

def run_preprocessing(token: str, session_id: int):
    """Run preprocessing on the demo session"""
    print("Starting preprocessing...")
    
    preprocess_data = {
        "bandpass": [1.0, 40.0],
        "notch": 50,
        "artifact": True
    }
    
    response = make_request("POST", f"/sessions/{session_id}/preprocess", preprocess_data, token)
    
    if response and response.get("success"):
        job = response["data"]
        print(f"✓ Preprocessing job started (ID: {job['id']})")
        return job
    else:
        print(f"✗ Preprocessing failed: {response.get('message', 'Unknown error')}")
        return None

def run_analytics(token: str, session_id: int):
    """Run analytics on the demo session"""
    print("Running analytics...")
    
    # Get PSD analysis for Fz channel
    try:
        response = requests.get(
            f"{BASE_URL}/sessions/{session_id}/analytics/psd?channel=Fz",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            print("✓ PSD analysis completed")
        else:
            print(f"✗ PSD analysis failed: {response.status_code}")
    except Exception as e:
        print(f"✗ PSD analysis error: {e}")
    
    # Get band power analysis for Fz channel
    try:
        response = requests.get(
            f"{BASE_URL}/sessions/{session_id}/analytics/bandpower?channel=Fz",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            print("✓ Band power analysis completed")
        else:
            print(f"✗ Band power analysis failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Band power analysis error: {e}")

def run_classification(token: str, session_id: int):
    """Run AI classification on the demo session"""
    print("Running AI classification...")
    
    response = make_request("POST", f"/sessions/{session_id}/classify", {}, token)
    
    if response and response.get("success"):
        result = response["data"]
        predicted_class = result.get("predictedClass", "unknown")
        confidence = result.get("confidence", 0)
        print(f"✓ Classification completed: {predicted_class} (confidence: {confidence:.2f})")
        return result
    else:
        print(f"✗ Classification failed: {response.get('message', 'Unknown error')}")
        return None

def main():
    """Main seeding function"""
    print("NeuroViz Demo Data Seeder")
    print("=" * 40)
    
    # Check if services are running
    try:
        response = requests.get(f"{BASE_URL}/actuator/health", timeout=5)
        if response.status_code != 200:
            print("✗ Backend service not responding")
            return 1
    except requests.exceptions.RequestException:
        print("✗ Cannot connect to backend service. Make sure it's running on http://localhost/api")
        return 1
    
    # Login
    token = login()
    if not token:
        return 1
    
    # Upload demo session
    session = upload_demo_session(token)
    if not session:
        return 1
    
    session_id = session["id"]
    
    # Run processing pipeline
    print("\nRunning processing pipeline...")
    
    # Preprocessing
    job = run_preprocessing(token, session_id)
    
    # Analytics
    run_analytics(token, session_id)
    
    # AI Classification
    classification_result = run_classification(token, session_id)
    
    print("\n" + "=" * 40)
    print("✓ Demo data seeding completed successfully!")
    print(f"✓ Session ID: {session_id}")
    print("✓ You can now log in and explore the demo data")
    print("\nDemo credentials:")
    print(f"  Email: {DEMO_USER['email']}")
    print(f"  Password: {DEMO_USER['password']}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
