package com.foodie.delivery.repository;

import com.foodie.delivery.domain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByOrderId(UUID orderId);
}