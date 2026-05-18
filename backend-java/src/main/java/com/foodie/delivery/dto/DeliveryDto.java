package com.foodie.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class DeliveryDto {
    @Data
    public static class CompleteDelivery {
        @NotBlank(message = "O código de verificação é obrigatório.")
        private String verificationCode;
    }
}