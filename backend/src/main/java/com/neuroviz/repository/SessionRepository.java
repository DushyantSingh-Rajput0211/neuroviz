package com.neuroviz.repository;

import com.neuroviz.entity.Session;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    Page<Session> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId")
    List<Session> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId AND s.id = :sessionId")
    Optional<Session> findByUserIdAndId(@Param("userId") Long userId, @Param("sessionId") Long sessionId);
    
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId AND s.name ILIKE %:name%")
    List<Session> findByUserIdAndNameContainingIgnoreCase(@Param("userId") Long userId, @Param("name") String name);
}
