package com.neuroviz.dto;

import java.time.LocalDateTime;

public class ChannelDataDto {
    private Long id;
    private String channelName;
    private Integer sampleRate;
    private String dataLocation;
    private Long dataSizeBytes;
    private LocalDateTime createdAt;

    // Constructors
    public ChannelDataDto() {}

    public ChannelDataDto(Long id, String channelName, Integer sampleRate, String dataLocation, Long dataSizeBytes, LocalDateTime createdAt) {
        this.id = id;
        this.channelName = channelName;
        this.sampleRate = sampleRate;
        this.dataLocation = dataLocation;
        this.dataSizeBytes = dataSizeBytes;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }

    public Integer getSampleRate() {
        return sampleRate;
    }

    public void setSampleRate(Integer sampleRate) {
        this.sampleRate = sampleRate;
    }

    public String getDataLocation() {
        return dataLocation;
    }

    public void setDataLocation(String dataLocation) {
        this.dataLocation = dataLocation;
    }

    public Long getDataSizeBytes() {
        return dataSizeBytes;
    }

    public void setDataSizeBytes(Long dataSizeBytes) {
        this.dataSizeBytes = dataSizeBytes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
