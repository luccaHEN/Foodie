package com.foodie.delivery.controller;

import com.foodie.delivery.dto.MenuDto;
import com.foodie.delivery.security.UserPrincipal;
import com.foodie.delivery.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    // Rota Pública
    @GetMapping("/{restaurantId}")
    public ResponseEntity<Map<String, Object>> getMenu(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(Map.of("status", "success", "data", menuService.getMenu(restaurantId)));
    }

    // Rotas Protegidas (Exigem JWT)
    @PostMapping("/categories")
    public ResponseEntity<Map<String, Object>> createCategory(
            @Valid @RequestBody MenuDto.CreateCategory dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", menuService.createCategory(dto, userPrincipal.getId())));
    }

    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(
            @Valid @RequestBody MenuDto.CreateProduct dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", menuService.createProduct(dto, userPrincipal.getId())));
    }

    @PatchMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody MenuDto.UpdateProduct dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", menuService.updateProduct(productId, dto, userPrincipal.getId())));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> deleteProduct(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        menuService.deleteProduct(productId, userPrincipal.getId());
        return ResponseEntity.ok(Map.of("status", "success", "message", "Produto deletado com sucesso."));
    }
}