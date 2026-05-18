package com.foodie.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class RestaurantDto {
    
    @Data
    public static class Create {
        @NotBlank(message = "O nome deve ter no mínimo 2 caracteres.")
        @Size(min = 2)
        private String name;

        private String description;

        @NotBlank(message = "O endereço é obrigatório.")
        @Size(min = 5)
        private String address;

        private String specialty;
    }
}