package com.neuroviz.controller;

import com.neuroviz.dto.request.PreprocessRequest;
import com.neuroviz.dto.response.ApiResponse;
import com.neuroviz.entity.ProcessingJob;
import com.neuroviz.repository.ProcessingJobRepository;
import com.neuroviz.repository.SessionRepository;
import com.neuroviz.service.UserService;
import com.neuroviz.service.ProcessingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sessions/{sessionId}")
public class ProcessingController {
    
    @Autowired
    private ProcessingService processingService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private ProcessingJobRepository processingJobRepository;
    
    @PostMapping("/preprocess")
    public ResponseEntity<?> preprocessSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody PreprocessRequest request,
            Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            
            // Verify session belongs to user
            if (!sessionRepository.findByUserIdAndId(currentUser.getId(), sessionId).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Session not found"));
            }
            
            ProcessingJob job = processingService.startPreprocessingJob(sessionId, request);
            return ResponseEntity.ok(ApiResponse.success("Preprocessing job started", job));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error starting preprocessing: " + e.getMessage()));
        }
    }
    
    @GetMapping("/analytics/psd")
    public ResponseEntity<?> getPSDAnalysis(
            @PathVariable Long sessionId,
            @RequestParam String channel,
            Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            
            if (!sessionRepository.findByUserIdAndId(currentUser.getId(), sessionId).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Session not found"));
            }
            
            Map<String, Object> psdData = processingService.getPSDAnalysis(sessionId, channel);
            return ResponseEntity.ok(ApiResponse.success(psdData));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error getting PSD analysis: " + e.getMessage()));
        }
    }
    
    @GetMapping("/analytics/bandpower")
    public ResponseEntity<?> getBandPowerAnalysis(
            @PathVariable Long sessionId,
            @RequestParam String channel,
            Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            
            if (!sessionRepository.findByUserIdAndId(currentUser.getId(), sessionId).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Session not found"));
            }
            
            Map<String, Object> bandPowerData = processingService.getBandPowerAnalysis(sessionId, channel);
            return ResponseEntity.ok(ApiResponse.success(bandPowerData));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error getting band power analysis: " + e.getMessage()));
        }
    }
    
    @PostMapping("/classify")
    public ResponseEntity<?> classifySession(
            @PathVariable Long sessionId,
            Authentication authentication) {
        try {
            com.neuroviz.dto.UserDto currentUser = userService.getCurrentUser();
            
            if (!sessionRepository.findByUserIdAndId(currentUser.getId(), sessionId).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Session not found"));
            }
            
            Map<String, Object> classificationResult = processingService.classifySession(sessionId);
            return ResponseEntity.ok(ApiResponse.success(classificationResult));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error classifying session: " + e.getMessage()));
        }
    }
}
