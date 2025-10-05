package com.neuroviz.controller;

import com.neuroviz.dto.SessionDto;
import com.neuroviz.dto.request.CreateSessionRequest;
import com.neuroviz.dto.response.ApiResponse;
import com.neuroviz.service.UserService;
import com.neuroviz.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    
    @Autowired
    private SessionService sessionService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<?> createSession(
            @Valid @ModelAttribute CreateSessionRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            SessionDto session = sessionService.createSession(request, file, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Session created successfully!", session));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating session: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getUserSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            Pageable pageable = PageRequest.of(page, size);
            Page<SessionDto> sessions = sessionService.getUserSessions(currentUser.getId(), pageable);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching sessions: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable Long id, Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            SessionDto session = sessionService.getSessionById(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(session));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching session: " + e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchSessions(
            @RequestParam String name,
            Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            List<SessionDto> sessions = sessionService.searchSessions(currentUser.getId(), name);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching sessions: " + e.getMessage()));
        }
    }
}
