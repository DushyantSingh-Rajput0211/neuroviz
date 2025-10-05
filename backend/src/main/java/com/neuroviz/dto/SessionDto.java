package com.neuroviz.dto;

import com.neuroviz.entity.Session;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
