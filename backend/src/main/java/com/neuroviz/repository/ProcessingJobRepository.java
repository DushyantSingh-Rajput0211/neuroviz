package com.neuroviz.repository;

import com.neuroviz.entity.ProcessingJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessingJobRepository extends JpaRepository<ProcessingJob, Long> {
    
    List<ProcessingJob> findBySessionIdOrderByCreatedAtDesc(Long sessionId);
    
    @Query("SELECT pj FROM ProcessingJob pj WHERE pj.session.id = :sessionId AND pj.jobType = :jobType ORDER BY pj.createdAt DESC")
    List<ProcessingJob> findBySessionIdAndJobTypeOrderByCreatedAtDesc(@Param("sessionId") Long sessionId, @Param("jobType") ProcessingJob.JobType jobType);
    
    @Query("SELECT pj FROM ProcessingJob pj WHERE pj.status = :status ORDER BY pj.createdAt ASC")
    List<ProcessingJob> findByStatusOrderByCreatedAtAsc(@Param("status") ProcessingJob.Status status);
    
    @Query("SELECT pj FROM ProcessingJob pj WHERE pj.session.id = :sessionId AND pj.status = :status")
    List<ProcessingJob> findBySessionIdAndStatus(@Param("sessionId") Long sessionId, @Param("status") ProcessingJob.Status status);
    
    @Query("SELECT pj FROM ProcessingJob pj WHERE pj.session.id = :sessionId AND pj.jobType = :jobType AND pj.status = 'COMPLETED' ORDER BY pj.completedAt DESC")
    Optional<ProcessingJob> findLatestCompletedBySessionIdAndJobType(@Param("sessionId") Long sessionId, @Param("jobType") ProcessingJob.JobType jobType);
}
