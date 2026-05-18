package com.foodie.delivery.service;

import com.foodie.delivery.domain.entity.ChatMessage;
import com.foodie.delivery.domain.entity.Order;
import com.foodie.delivery.domain.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessageSendingOperations messagingTemplate;

    public void emitOrderStatusChange(UUID orderId, OrderStatus status) {
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, Map.of("orderId", orderId, "status", status));
    }

    public void emitNewOrderToRestaurant(UUID restaurantId, Order order) {
        messagingTemplate.convertAndSend("/topic/restaurants/" + restaurantId, order);
    }

    public void emitNewChatMessage(UUID orderId, ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/orders/" + orderId + "/chat", message);
    }
}