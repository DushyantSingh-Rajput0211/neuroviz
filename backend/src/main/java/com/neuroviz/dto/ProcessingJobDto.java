package com.neuroviz.dto;

import com.neuroviz.entity.ProcessingJob;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
