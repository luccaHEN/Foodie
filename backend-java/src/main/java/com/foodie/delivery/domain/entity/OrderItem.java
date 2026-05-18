package com.foodie.delivery.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue private UUID id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore // Evita loop infinito ao serializar o Pedido
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false) private Integer quantity;
    @Column(nullable = false) private Double price; // Congela o preço no momento da compra!
}