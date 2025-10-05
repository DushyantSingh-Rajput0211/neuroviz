package com.neuroviz.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "channel_data", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "channel_name"})
})
public class ChannelData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "channel_name", nullable = false)
    private String channelName;

    @Column(name = "sample_rate", nullable = false)
    private Integer sampleRate;

    @Column(name = "data_location", nullable = false)
    private String dataLocation;

    @Column(name = "data_size_bytes")
    private Long dataSizeBytes;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public ChannelData() {}

    public ChannelData(Long id, Session session, String channelName, Integer sampleRate, String dataLocation, Long dataSizeBytes, LocalDateTime createdAt) {
        this.id = id;
        this.session = session;
        this.channelName = channelName;
        this.sampleRate = sampleRate;
        this.dataLocation = dataLocation;
        this.dataSizeBytes = dataSizeBytes;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }

    public Integer getSampleRate() {
        return sampleRate;
    }

    public void setSampleRate(Integer sampleRate) {
        this.sampleRate = sampleRate;
    }

    public String getDataLocation() {
        return dataLocation;
    }

    public void setDataLocation(String dataLocation) {
        this.dataLocation = dataLocation;
    }

    public Long getDataSizeBytes() {
        return dataSizeBytes;
    }

    public void setDataSizeBytes(Long dataSizeBytes) {
        this.dataSizeBytes = dataSizeBytes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChannelData that = (ChannelData) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
