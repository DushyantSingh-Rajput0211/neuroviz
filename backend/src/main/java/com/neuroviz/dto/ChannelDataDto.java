package com.neuroviz.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChannelDataDto {
    private Long id;
    private String channelName;
    private Integer sampleRate;
    private String dataLocation;
    private Long dataSizeBytes;
    private LocalDateTime createdAt;
}
