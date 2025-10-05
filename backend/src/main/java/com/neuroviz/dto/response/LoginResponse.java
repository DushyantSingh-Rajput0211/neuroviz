package com.neuroviz.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private UserDto user;
    
    public LoginResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }
}
