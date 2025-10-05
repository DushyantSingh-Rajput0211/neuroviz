package com.neuroviz.dto;

import com.neuroviz.entity.ProcessingJob;
import java.time.LocalDateTime;

public class ProcessingJobDto {
    private Long id;
    private ProcessingJob.JobType jobType;
    private ProcessingJob.Status status;
    private String paramsJson;
    private String resultsJson;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ProcessingJobDto() {}

    public ProcessingJobDto(Long id, ProcessingJob.JobType jobType, ProcessingJob.Status status, String paramsJson, String resultsJson, String errorMessage, LocalDateTime startedAt, LocalDateTime completedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.jobType = jobType;
        this.status = status;
        this.paramsJson = paramsJson;
        this.resultsJson = resultsJson;
        this.errorMessage = errorMessage;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProcessingJob.JobType getJobType() {
        return jobType;
    }

    public void setJobType(ProcessingJob.JobType jobType) {
        this.jobType = jobType;
    }

    public ProcessingJob.Status getStatus() {
        return status;
    }

    public void setStatus(ProcessingJob.Status status) {
        this.status = status;
    }

    public String getParamsJson() {
        return paramsJson;
    }

    public void setParamsJson(String paramsJson) {
        this.paramsJson = paramsJson;
    }

    public String getResultsJson() {
        return resultsJson;
    }

    public void setResultsJson(String resultsJson) {
        this.resultsJson = resultsJson;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
}
