#!/usr/bin/env python3
"""
EEG Stream Simulator
Generates synthetic EEG data and streams it via WebSocket
"""

import asyncio
import json
import time
import random
import math
import os
import sys
from typing import Dict, List
import websockets
import argparse
import signal

class EEGSimulator:
    def __init__(self, sample_rate: int = 250, channels: List[str] = None):
        self.sample_rate = sample_rate
        self.channels = channels or ["Fz", "Cz", "Pz", "C3", "C4", "F3", "F4", "P3", "P4"]
        self.running = False
        self.websocket = None
        
    def generate_eeg_sample(self) -> Dict[str, float]:
        """Generate a single EEG sample for all channels"""
        sample = {}
        
        for channel in self.channels:
            # Generate synthetic EEG-like signal
            # Combine multiple frequency components with noise
            
            # Alpha waves (8-13 Hz) - dominant in rest state
            alpha = 0.5 * math.sin(2 * math.pi * 10 * time.time())
            
            # Beta waves (13-30 Hz) - active mental state
            beta = 0.3 * math.sin(2 * math.pi * 20 * time.time())
            
            # Theta waves (4-8 Hz) - drowsiness
            theta = 0.2 * math.sin(2 * math.pi * 6 * time.time())
            
            # Gamma waves (30-45 Hz) - cognitive processing
            gamma = 0.1 * math.sin(2 * math.pi * 35 * time.time())
            
            # Random noise
            noise = random.gauss(0, 0.1)
            
            # Channel-specific variations
            if channel in ["C3", "C4"]:
                # Motor cortex - more beta activity
                beta *= 1.5
            elif channel in ["Fz", "F3", "F4"]:
                # Frontal - more gamma activity
                gamma *= 1.3
            elif channel in ["Pz", "P3", "P4"]:
                # Parietal - more alpha activity
                alpha *= 1.2
            
            # Combine all components
            sample[channel] = alpha + beta + theta + gamma + noise
            
        return sample
    
    def generate_data_frame(self, duration_ms: int = 40) -> Dict:
        """Generate a data frame with multiple samples"""
        samples_per_frame = int(self.sample_rate * duration_ms / 1000)
        
        data = {}
        for channel in self.channels:
            data[channel] = []
            for _ in range(samples_per_frame):
                sample = self.generate_eeg_sample()
                data[channel].append(sample[channel])
        
        return {
            "type": "eeg_data",
            "timestamp": int(time.time() * 1000),
            "sampleRate": self.sample_rate,
            "channels": self.channels,
            "data": data
        }
    
    async def connect_websocket(self, uri: str):
        """Connect to WebSocket server"""
        try:
            self.websocket = await websockets.connect(uri)
            print(f"Connected to {uri}")
            return True
        except Exception as e:
            print(f"Failed to connect to {uri}: {e}")
            return False
    
    async def send_data(self, data: Dict):
        """Send data via WebSocket"""
        if self.websocket:
            try:
                await self.websocket.send(json.dumps(data))
            except Exception as e:
                print(f"Failed to send data: {e}")
                return False
        return True
    
    async def start_streaming(self, uri: str, speed_multiplier: float = 1.0):
        """Start streaming EEG data"""
        if not await self.connect_websocket(uri):
            return
        
        self.running = True
        print(f"Starting EEG stream at {self.sample_rate} Hz...")
        
        # Send start message
        await self.send_data({
            "type": "stream_started",
            "timestamp": int(time.time() * 1000),
            "message": "EEG stream started"
        })
        
        try:
            while self.running:
                # Generate and send data frame
                frame = self.generate_data_frame(40)  # 40ms frames
                await self.send_data(frame)
                
                # Wait for next frame (adjusted by speed multiplier)
                await asyncio.sleep(0.04 / speed_multiplier)
                
        except Exception as e:
            print(f"Streaming error: {e}")
        finally:
            # Send stop message
            await self.send_data({
                "type": "stream_stopped",
                "timestamp": int(time.time() * 1000),
                "message": "EEG stream stopped"
            })
            await self.websocket.close()
            print("Streaming stopped")
    
    def stop_streaming(self):
        """Stop streaming"""
        self.running = False

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\nShutting down simulator...")
    if simulator:
        simulator.stop_streaming()
    sys.exit(0)

# Global simulator instance
simulator = None

async def main():
    global simulator
    
    parser = argparse.ArgumentParser(description="EEG Stream Simulator")
    parser.add_argument("--uri", default="ws://localhost/ws/stream", help="WebSocket URI")
    parser.add_argument("--sample-rate", type=int, default=250, help="Sample rate in Hz")
    parser.add_argument("--speed", type=float, default=1.0, help="Speed multiplier")
    parser.add_argument("--channels", nargs="+", 
                       default=["Fz", "Cz", "Pz", "C3", "C4"], 
                       help="EEG channels")
    
    args = parser.parse_args()
    
    # Set up signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create simulator
    simulator = EEGSimulator(args.sample_rate, args.channels)
    
    print(f"EEG Simulator Configuration:")
    print(f"  URI: {args.uri}")
    print(f"  Sample Rate: {args.sample_rate} Hz")
    print(f"  Channels: {', '.join(args.channels)}")
    print(f"  Speed: {args.speed}x")
    print(f"  Press Ctrl+C to stop")
    print()
    
    # Start streaming
    await simulator.start_streaming(args.uri, args.speed)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nSimulator stopped by user")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
