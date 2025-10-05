package com.neuroviz.service;

import com.neuroviz.dto.request.PreprocessRequest;
import com.neuroviz.entity.ProcessingJob;
import com.neuroviz.entity.Session;
import com.neuroviz.repository.ProcessingJobRepository;
import com.neuroviz.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class ProcessingService {
    
    @Autowired
    private ProcessingJobRepository processingJobRepository;
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${app.processing.service-url}")
    private String processingServiceUrl;
    
    public ProcessingJob startPreprocessingJob(Long sessionId, PreprocessRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        ProcessingJob job = new ProcessingJob();
        job.setSession(session);
        job.setJobType(ProcessingJob.JobType.PREPROCESS);
        job.setStatus(ProcessingJob.Status.PENDING);
        job.setParamsJson(convertToJson(request));
        job.setCreatedAt(LocalDateTime.now());
        
        ProcessingJob savedJob = processingJobRepository.save(job);
        
        // Start async processing
        processAsync(savedJob.getId());
        
        return savedJob;
    }
    
    @Async
    public void processAsync(Long jobId) {
        ProcessingJob job = processingJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        try {
            // Update status to running
            job.setStatus(ProcessingJob.Status.RUNNING);
            job.setStartedAt(LocalDateTime.now());
            processingJobRepository.save(job);
            
            // Call Python processing service
            String url = processingServiceUrl + "/preprocess";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("file_path", job.getSession().getFilePath());
            requestBody.put("params", job.getParamsJson());
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                job.setStatus(ProcessingJob.Status.COMPLETED);
                job.setResultsJson(convertToJson(response.getBody()));
            } else {
                job.setStatus(ProcessingJob.Status.FAILED);
                job.setErrorMessage("Processing service returned error: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            job.setStatus(ProcessingJob.Status.FAILED);
            job.setErrorMessage("Error during processing: " + e.getMessage());
        } finally {
            job.setCompletedAt(LocalDateTime.now());
            processingJobRepository.save(job);
        }
    }
    
    public Map<String, Object> getPSDAnalysis(Long sessionId, String channel) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        String url = processingServiceUrl + "/analytics/psd?file=" + session.getFilePath() + "&channel=" + channel;
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error getting PSD analysis: " + e.getMessage());
        }
    }
    
    public Map<String, Object> getBandPowerAnalysis(Long sessionId, String channel) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        String url = processingServiceUrl + "/analytics/bandpower?file=" + session.getFilePath() + "&channel=" + channel;
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error getting band power analysis: " + e.getMessage());
        }
    }
    
    public Map<String, Object> classifySession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        String url = processingServiceUrl + "/classify";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("file_path", session.getFilePath());
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error classifying session: " + e.getMessage());
        }
    }
    
    private String convertToJson(Object object) {
        // Simple JSON conversion - in production, use Jackson ObjectMapper
        return object.toString();
    }
}
