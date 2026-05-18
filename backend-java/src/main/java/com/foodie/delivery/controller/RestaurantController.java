package com.foodie.delivery.controller;

import com.foodie.delivery.dto.RestaurantDto;
import com.foodie.delivery.security.UserPrincipal;
import com.foodie.delivery.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @Valid @RequestBody RestaurantDto.Create dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", restaurantService.create(dto, userPrincipal.getId())));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialty,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        
        Map<String, Object> result = restaurantService.listAll(search, page, limit, specialty);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "data", result.get("data"),
                "meta", Map.of(
                        "page", result.get("page"),
                        "totalPages", result.get("totalPages")
                )
        ));
    }
}