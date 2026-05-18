package com.foodie.delivery.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "reviews")
public class Review {
    @Id @GeneratedValue private UUID id;
    
    @Column(nullable = false) private Integer rating;
    private String comment;

    @OneToOne @JoinColumn(name = "order_id", nullable = false, unique = true) @JsonIgnore private Order order;
    @ManyToOne @JoinColumn(name = "restaurant_id", nullable = false) @JsonIgnore private Restaurant restaurant;
    @ManyToOne @JoinColumn(name = "customer_id", nullable = false) private User customer;
    @CreationTimestamp private LocalDateTime createdAt;
}