package com.foodie.delivery.controller;

import com.foodie.delivery.dto.OrderDto;
import com.foodie.delivery.security.UserPrincipal;
import com.foodie.delivery.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @Valid @RequestBody OrderDto.Create dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", orderService.create(dto, userPrincipal.getId())));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<Map<String, Object>> listMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", orderService.listCustomerOrders(userPrincipal.getId())));
    }

    @GetMapping("/my-history")
    public ResponseEntity<Map<String, Object>> listMyHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", orderService.listCustomerHistory(userPrincipal.getId())));
    }

    @PostMapping("/{orderId}/review")
    public ResponseEntity<Map<String, Object>> createReview(
            @PathVariable UUID orderId, @Valid @RequestBody OrderDto.CreateReview dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", orderService.createReview(orderId, userPrincipal.getId(), dto)));
    }

    @PostMapping("/{orderId}/chat")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable UUID orderId, @Valid @RequestBody OrderDto.CreateChatMessage dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", orderService.addMessageToOrder(orderId, userPrincipal.getId(), userPrincipal.getRole(), dto.getContent())));
    }

    @GetMapping("/{orderId}/chat")
    public ResponseEntity<Map<String, Object>> getMessages(@PathVariable UUID orderId) {
        return ResponseEntity.ok(Map.of("status", "success", "data", orderService.getOrderMessages(orderId)));
    }

    @GetMapping("/restaurant/{restaurantId}/live")
    public ResponseEntity<Map<String, Object>> listLiveOrders(
            @PathVariable UUID restaurantId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", orderService.getRestaurantLiveOrders(restaurantId, userPrincipal.getId())));
    }

    @GetMapping("/restaurant/{restaurantId}/history")
    public ResponseEntity<Map<String, Object>> listOrderHistory(
            @PathVariable UUID restaurantId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", orderService.getRestaurantOrderHistory(restaurantId, userPrincipal.getId())));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable UUID orderId, @Valid @RequestBody OrderDto.UpdateStatus dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", orderService.updateStatus(orderId, dto.getStatus(), userPrincipal.getId(), dto.getVerificationCode())));
    }
}