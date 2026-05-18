package com.foodie.delivery.repository;

import com.foodie.delivery.domain.entity.Order;
import com.foodie.delivery.domain.enums.DeliveryMethod;
import com.foodie.delivery.domain.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerIdAndStatusNotOrderByCreatedAtDesc(UUID customerId, OrderStatus status);
    List<Order> findByCustomerIdAndStatusOrderByCreatedAtDesc(UUID customerId, OrderStatus status);
    List<Order> findByRestaurantIdAndStatusNotInOrderByCreatedAtAsc(UUID restaurantId, List<OrderStatus> statuses);
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);
    List<Order> findByDeliveryIsNullAndStatusInAndDeliveryMethodOrderByCreatedAtAsc(List<OrderStatus> statuses, DeliveryMethod deliveryMethod);

    long countByRestaurantId(UUID restaurantId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.restaurant.id = :restaurantId")
    Double sumTotalAmountByRestaurantId(@Param("restaurantId") UUID restaurantId);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId GROUP BY o.status")
    List<Object[]> countOrdersByStatus(@Param("restaurantId") UUID restaurantId);
}