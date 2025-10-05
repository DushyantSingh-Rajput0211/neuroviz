package com.neuroviz.dto.request;

import java.util.List;

public class PreprocessRequest {
    
    private List<Double> bandpass; // [low, high] frequencies
    private Integer notch; // 50 or 60 Hz
    private Boolean artifact; // enable artifact rejection
    
    public PreprocessRequest() {
        this.bandpass = List.of(1.0, 40.0); // Default 1-40 Hz
        this.notch = 50; // Default 50 Hz notch
        this.artifact = true; // Default enable artifact rejection
    }

    public PreprocessRequest(List<Double> bandpass, Integer notch, Boolean artifact) {
        this.bandpass = bandpass;
        this.notch = notch;
        this.artifact = artifact;
    }

    // Getters and Setters
    public List<Double> getBandpass() {
        return bandpass;
    }

    public void setBandpass(List<Double> bandpass) {
        this.bandpass = bandpass;
    }

    public Integer getNotch() {
        return notch;
    }

    public void setNotch(Integer notch) {
        this.notch = notch;
    }

    public Boolean getArtifact() {
        return artifact;
    }

    public void setArtifact(Boolean artifact) {
        this.artifact = artifact;
    }
}
