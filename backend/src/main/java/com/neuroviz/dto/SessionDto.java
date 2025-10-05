package com.neuroviz.dto;

import com.neuroviz.entity.Session;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SessionDto {
    private Long id;
    private String name;
    private String description;
    private Session.SourceType sourceType;
    private String filePath;
    private Integer sampleRate;
    private BigDecimal durationSeconds;
    private Integer channelCount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ChannelDataDto> channelData;
    private List<ProcessingJobDto> processingJobs;

    // Constructors
    public SessionDto() {}

    public SessionDto(Long id, String name, String description, Session.SourceType sourceType, String filePath, Integer sampleRate, BigDecimal durationSeconds, Integer channelCount, String notes, LocalDateTime createdAt, LocalDateTime updatedAt, List<ChannelDataDto> channelData, List<ProcessingJobDto> processingJobs) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sourceType = sourceType;
        this.filePath = filePath;
        this.sampleRate = sampleRate;
        this.durationSeconds = durationSeconds;
        this.channelCount = channelCount;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.channelData = channelData;
        this.processingJobs = processingJobs;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Session.SourceType getSourceType() {
        return sourceType;
    }

    public void setSourceType(Session.SourceType sourceType) {
        this.sourceType = sourceType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Integer getSampleRate() {
        return sampleRate;
    }

    public void setSampleRate(Integer sampleRate) {
        this.sampleRate = sampleRate;
    }

    public BigDecimal getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(BigDecimal durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Integer getChannelCount() {
        return channelCount;
    }

    public void setChannelCount(Integer channelCount) {
        this.channelCount = channelCount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ChannelDataDto> getChannelData() {
        return channelData;
    }

    public void setChannelData(List<ChannelDataDto> channelData) {
        this.channelData = channelData;
    }

    public List<ProcessingJobDto> getProcessingJobs() {
        return processingJobs;
    }

    public void setProcessingJobs(List<ProcessingJobDto> processingJobs) {
        this.processingJobs = processingJobs;
    }
}
