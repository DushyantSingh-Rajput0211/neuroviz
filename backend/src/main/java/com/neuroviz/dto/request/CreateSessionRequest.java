package com.neuroviz.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateSessionRequest {
    
    @NotBlank(message = "Session name is required")
    private String name;
    
    private String description;
    private String notes;

    // Constructors
    public CreateSessionRequest() {}

    public CreateSessionRequest(String name, String description, String notes) {
        this.name = name;
        this.description = description;
        this.notes = notes;
    }

    // Getters and Setters
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
