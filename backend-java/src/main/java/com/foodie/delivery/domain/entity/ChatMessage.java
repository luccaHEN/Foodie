package com.foodie.delivery.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.foodie.delivery.domain.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "chat_messages")
public class ChatMessage {
    @Id @GeneratedValue private UUID id;
    @ManyToOne @JoinColumn(name = "order_id", nullable = false) @JsonIgnore private Order order;
    @ManyToOne @JoinColumn(name = "sender_id", nullable = false) @JsonIgnoreProperties({"password", "email", "address"}) private User sender;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Column(nullable = false) private String content;
    @CreationTimestamp private LocalDateTime createdAt;
}