package com.neuroviz.repository;

import com.neuroviz.entity.ChannelData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelDataRepository extends JpaRepository<ChannelData, Long> {
    
    List<ChannelData> findBySessionId(Long sessionId);
    
    @Query("SELECT cd FROM ChannelData cd WHERE cd.session.id = :sessionId AND cd.channelName = :channelName")
    ChannelData findBySessionIdAndChannelName(@Param("sessionId") Long sessionId, @Param("channelName") String channelName);
    
    @Query("SELECT DISTINCT cd.channelName FROM ChannelData cd WHERE cd.session.id = :sessionId ORDER BY cd.channelName")
    List<String> findChannelNamesBySessionId(@Param("sessionId") Long sessionId);
}
