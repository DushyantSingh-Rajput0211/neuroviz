package com.neuroviz.service;

import com.neuroviz.dto.UserDto;
import com.neuroviz.dto.request.SignupRequest;
import com.neuroviz.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    UserDto createUser(SignupRequest signupRequest);
    UserDto getCurrentUser();
    UserDto getUserById(Long id);
    UserDto getUserByEmail(String email);
    User getUserEntityById(Long id);
    UserDetails loadUserByUsername(String email);
}
