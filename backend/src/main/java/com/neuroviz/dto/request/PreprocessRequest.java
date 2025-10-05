package com.neuroviz.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class PreprocessRequest {
    
    private List<Double> bandpass; // [low, high] frequencies
    private Integer notch; // 50 or 60 Hz
    private Boolean artifact; // enable artifact rejection
    
    public PreprocessRequest() {
        this.bandpass = List.of(1.0, 40.0); // Default 1-40 Hz
        this.notch = 50; // Default 50 Hz notch
        this.artifact = true; // Default enable artifact rejection
    }
}
