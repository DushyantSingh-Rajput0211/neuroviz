package com.neuroviz.service;

import com.neuroviz.dto.SessionDto;
import com.neuroviz.dto.request.CreateSessionRequest;
import com.neuroviz.entity.Session;
import com.neuroviz.entity.User;
import com.neuroviz.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SessionService {
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private com.neuroviz.service.UserService userService;
    
    public SessionDto createSession(CreateSessionRequest request, MultipartFile file, Long userId) {
        User user = userService.getUserEntityById(userId);
        
        Session session = new Session();
        session.setUser(user);
        session.setName(request.getName());
        session.setDescription(request.getDescription());
        session.setNotes(request.getNotes());
        session.setSourceType(Session.SourceType.UPLOAD);
        session.setCreatedAt(LocalDateTime.now());
        
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get("/app/storage/raw/" + fileName);
                Files.createDirectories(filePath.getParent());
                Files.copy(file.getInputStream(), filePath);
                
                session.setFilePath(filePath.toString());
                
                // Parse CSV to get basic info (sample rate, channels, duration)
                parseAndSetSessionInfo(session, filePath);
                
            } catch (IOException e) {
                throw new RuntimeException("Failed to save uploaded file: " + e.getMessage());
            }
        }
        
        Session savedSession = sessionRepository.save(session);
        return mapToDto(savedSession);
    }
    
    public Page<SessionDto> getUserSessions(Long userId, Pageable pageable) {
        Page<Session> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return sessions.map(this::mapToDto);
    }
    
    public SessionDto getSessionById(Long sessionId, Long userId) {
        Session session = sessionRepository.findByUserIdAndId(userId, sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        return mapToDto(session);
    }
    
    public List<SessionDto> searchSessions(Long userId, String name) {
        List<Session> sessions = sessionRepository.findByUserIdAndNameContainingIgnoreCase(userId, name);
        return sessions.stream().map(this::mapToDto).toList();
    }
    
    private void parseAndSetSessionInfo(Session session, Path filePath) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            if (lines.isEmpty()) return;
            
            String header = lines.get(0);
            String[] channels = header.split(",");
            session.setChannelCount(channels.length);
            
            // Estimate sample rate (this is a simplified approach)
            // In a real implementation, you'd parse metadata or use a proper EEG library
            session.setSampleRate(250); // Default sample rate
            
            // Calculate duration based on number of samples
            long sampleCount = lines.size() - 1; // Subtract header
            BigDecimal duration = BigDecimal.valueOf(sampleCount).divide(BigDecimal.valueOf(session.getSampleRate()), 2, BigDecimal.ROUND_HALF_UP);
            session.setDurationSeconds(duration);
            
        } catch (IOException e) {
            // Set defaults if parsing fails
            session.setChannelCount(0);
            session.setSampleRate(250);
            session.setDurationSeconds(BigDecimal.ZERO);
        }
    }
    
    private SessionDto mapToDto(Session session) {
        SessionDto dto = new SessionDto();
        dto.setId(session.getId());
        dto.setName(session.getName());
        dto.setDescription(session.getDescription());
        dto.setSourceType(session.getSourceType());
        dto.setFilePath(session.getFilePath());
        dto.setSampleRate(session.getSampleRate());
        dto.setDurationSeconds(session.getDurationSeconds());
        dto.setChannelCount(session.getChannelCount());
        dto.setNotes(session.getNotes());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setUpdatedAt(session.getUpdatedAt());
        return dto;
    }
}
