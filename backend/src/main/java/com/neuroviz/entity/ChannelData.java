package com.neuroviz.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "channel_data", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "channel_name"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
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
}
