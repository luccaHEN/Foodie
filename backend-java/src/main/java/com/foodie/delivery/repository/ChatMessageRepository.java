package com.foodie.delivery.repository;

import com.foodie.delivery.domain.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByOrderIdOrderByCreatedAtAsc(UUID orderId);
}