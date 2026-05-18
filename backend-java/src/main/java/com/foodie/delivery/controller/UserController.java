package com.foodie.delivery.controller;

import com.foodie.delivery.domain.entity.User;
import com.foodie.delivery.dto.UserDto;
import com.foodie.delivery.service.UserService;
import com.foodie.delivery.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserDto.Create dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "data", userService.register(dto)));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody UserDto.Login dto) {
        return ResponseEntity.ok(Map.of("status", "success", "data", userService.login(dto)));
    }

    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody UserDto.UpdateProfile dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("status", "success", "data", userService.updateProfile(userPrincipal.getId(), dto)));
    }
}