package com.foodie.delivery.controller;

import com.foodie.delivery.domain.enums.Role;
import com.foodie.delivery.dto.DeliveryDto;
import com.foodie.delivery.security.UserPrincipal;
import com.foodie.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/{orderId}/accept")
    public ResponseEntity<Map<String, Object>> accept(
            @PathVariable UUID orderId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal.getRole() != Role.DELIVERY) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("status", "error", "message", "Acesso negado: Apenas entregadores podem aceitar corridas."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", deliveryService.acceptDelivery(orderId, userPrincipal.getId())));
    }

    @PatchMapping("/{orderId}/pickup")
    public ResponseEntity<Map<String, Object>> pickUp(
            @PathVariable UUID orderId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal.getRole() != Role.DELIVERY) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("status", "error", "message", "Acesso negado: Apenas entregadores."));
        
        return ResponseEntity.ok(Map.of("status", "success", "data", deliveryService.pickUpDelivery(orderId, userPrincipal.getId())));
    }

    @PatchMapping("/{orderId}/deliver")
    public ResponseEntity<Map<String, Object>> markAsDelivered(
            @PathVariable UUID orderId, @Valid @RequestBody DeliveryDto.CompleteDelivery dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal.getRole() != Role.DELIVERY) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("status", "error", "message", "Acesso negado: Apenas entregadores."));
        
        return ResponseEntity.ok(Map.of("status", "success", "data", deliveryService.markAsDelivered(orderId, userPrincipal.getId(), dto.getVerificationCode())));
    }

    @GetMapping("/my-deliveries")
    public ResponseEntity<Map<String, Object>> listMyDeliveries(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", deliveryService.listMyDeliveries(userPrincipal.getId())));
    }

    @GetMapping("/my-history")
    public ResponseEntity<Map<String, Object>> listMyHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", deliveryService.getMyDeliveryHistory(userPrincipal.getId())));
    }

    @GetMapping("/available")
    public ResponseEntity<Map<String, Object>> listAvailable() {
        return ResponseEntity.ok(Map.of("status", "success", "data", deliveryService.getAvailableDeliveries()));
    }
}