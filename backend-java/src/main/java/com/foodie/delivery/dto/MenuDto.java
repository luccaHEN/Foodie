package com.foodie.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

public class MenuDto {

    @Data
    public static class CreateCategory {
        @NotBlank(message = "O nome da categoria deve ter no mínimo 2 caracteres.")
        @Size(min = 2)
        private String name;

        @NotNull(message = "ID do restaurante é obrigatório.")
        private UUID restaurantId;
    }

    @Data
    public static class CreateProduct {
        @NotBlank(message = "O nome do produto deve ter no mínimo 2 caracteres.")
        @Size(min = 2)
        private String name;

        private String description;

        @NotNull(message = "O preço é obrigatório.")
        @Positive(message = "O preço deve ser maior que zero.")
        private Double price;

        @NotNull(message = "ID do restaurante é obrigatório.")
        private UUID restaurantId;

        @NotNull(message = "ID da categoria é obrigatório.")
        private UUID categoryId;
    }

    @Data
    public static class UpdateProduct {
        @Size(min = 2, message = "O nome do produto deve ter no mínimo 2 caracteres.")
        private String name;

        private String description;

        @Positive(message = "O preço deve ser maior que zero.")
        private Double price;

        private UUID categoryId;
    }
}