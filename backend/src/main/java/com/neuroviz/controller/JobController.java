package com.neuroviz.controller;

import com.neuroviz.dto.response.ApiResponse;
import com.neuroviz.entity.ProcessingJob;
import com.neuroviz.repository.ProcessingJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/jobs")
public class JobController {
    
    @Autowired
    private ProcessingJobRepository processingJobRepository;
    
    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable Long jobId) {
        try {
            Optional<ProcessingJob> job = processingJobRepository.findById(jobId);
            if (job.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(job.get()));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Job not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching job: " + e.getMessage()));
        }
    }
}
