package com.neuroviz.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSessionRequest {
    
    @NotBlank(message = "Session name is required")
    private String name;
    
    private String description;
    private String notes;
}
