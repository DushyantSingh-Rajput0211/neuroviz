package com.neuroviz.service;

import com.neuroviz.dto.UserDto;
import com.neuroviz.dto.request.SignupRequest;
import com.neuroviz.entity.User;

public interface UserService {
    UserDto createUser(SignupRequest signupRequest);
    UserDto getCurrentUser();
    UserDto getUserById(Long id);
    UserDto getUserByEmail(String email);
    User getUserEntityById(Long id);
}
