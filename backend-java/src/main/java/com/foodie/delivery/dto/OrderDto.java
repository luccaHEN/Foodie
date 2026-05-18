package com.foodie.delivery.dto;

import com.foodie.delivery.domain.enums.DeliveryMethod;
import com.foodie.delivery.domain.enums.OrderStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

public class OrderDto {

    @Data
    public static class Create {
        @NotNull(message = "ID do restaurante inválido.") private UUID restaurantId;
        @NotEmpty(message = "O pedido deve ter pelo menos um item.") private List<OrderItemDto> items;
        private DeliveryMethod deliveryMethod;
        private String deliveryAddress;
    }

    @Data
    public static class OrderItemDto {
        @NotNull(message = "ID do produto inválido.") private UUID productId;
        @NotNull @Positive(message = "A quantidade deve ser maior que zero.") private Integer quantity;
    }

    @Data
    public static class UpdateStatus {
        @NotNull(message = "Status do pedido inválido.") private OrderStatus status;
        private String verificationCode;
    }

    @Data
    public static class CreateReview {
        @NotNull @Min(value = 1) @Max(value = 5, message = "A nota deve ser entre 1 e 5.") private Integer rating;
        private String comment;
    }

    @Data
    public static class CreateChatMessage { @NotBlank(message = "A mensagem não pode estar vazia.") private String content; }
}