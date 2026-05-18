package com.foodie.delivery.controller;

import com.foodie.delivery.security.UserPrincipal;
import com.foodie.delivery.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{restaurantId}")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @PathVariable UUID restaurantId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", dashboardService.getRestaurantDashboard(restaurantId, userPrincipal.getId())));
    }
}