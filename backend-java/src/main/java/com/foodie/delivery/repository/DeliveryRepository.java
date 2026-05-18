package com.foodie.delivery.repository;

import com.foodie.delivery.domain.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    @Query("SELECT d FROM Delivery d WHERE d.order.id = :orderId")
    Optional<Delivery> findByOrderId(@Param("orderId") UUID orderId);
    List<Delivery> findByDeliveryPersonIdAndDeliveredAtIsNull(UUID deliveryPersonId);
    List<Delivery> findByDeliveryPersonIdAndDeliveredAtIsNotNullOrderByDeliveredAtDesc(UUID deliveryPersonId);
}