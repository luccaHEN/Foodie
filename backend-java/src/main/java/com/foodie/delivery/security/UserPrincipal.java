package com.foodie.delivery.security;

import com.foodie.delivery.domain.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserPrincipal {
    private final UUID id;
    private final Role role;

    public boolean hasRole(Role requiredRole) {
        return this.role == requiredRole;
    }
}