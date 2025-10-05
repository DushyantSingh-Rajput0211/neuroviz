package com.neuroviz.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Controller
public class StreamController {
    
    private final Random random = new Random();
    
    @MessageMapping("/stream.start")
    @SendTo("/topic/eeg-data")
    public Map<String, Object> startStream() {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "stream_started");
        response.put("timestamp", Instant.now().toEpochMilli());
        response.put("message", "EEG stream started");
        return response;
    }
    
    @MessageMapping("/stream.stop")
    @SendTo("/topic/eeg-data")
    public Map<String, Object> stopStream() {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "stream_stopped");
        response.put("timestamp", Instant.now().toEpochMilli());
        response.put("message", "EEG stream stopped");
        return response;
    }
    
    // This method simulates EEG data - in production, this would connect to real EEG hardware
    @MessageMapping("/stream.data")
    @SendTo("/topic/eeg-data")
    public Map<String, Object> generateEEGData() {
        Map<String, Object> response = new HashMap<>();
        
        long timestamp = Instant.now().toEpochMilli();
        int sampleRate = 250;
        String[] channels = {"Fz", "Cz", "Pz", "C3", "C4"};
        
        Map<String, double[]> channelData = new HashMap<>();
        for (String channel : channels) {
            double[] data = new double[sampleRate / 10]; // 100ms of data
            for (int i = 0; i < data.length; i++) {
                // Generate synthetic EEG-like data (alpha waves around 10Hz with noise)
                double alpha = Math.sin(2 * Math.PI * 10 * (timestamp + i * 4) / 1000.0);
                double noise = random.nextGaussian() * 0.1;
                data[i] = alpha + noise;
            }
            channelData.put(channel, data);
        }
        
        response.put("timestamp", timestamp);
        response.put("sampleRate", sampleRate);
        response.put("channels", channels);
        response.put("data", channelData);
        response.put("type", "eeg_data");
        
        return response;
    }
}
