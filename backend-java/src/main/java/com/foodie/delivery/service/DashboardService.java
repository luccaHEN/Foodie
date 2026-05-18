package com.foodie.delivery.service;

import com.foodie.delivery.domain.entity.Restaurant;
import com.foodie.delivery.repository.OrderRepository;
import com.foodie.delivery.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;

    public Map<String, Object> getRestaurantDashboard(UUID restaurantId, UUID ownerId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante não encontrado."));

        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new IllegalArgumentException("Acesso negado: Você não é o dono deste restaurante.");
        }

        long totalOrders = orderRepository.countByRestaurantId(restaurantId);
        Double totalRevenue = orderRepository.sumTotalAmountByRestaurantId(restaurantId);

        List<Object[]> statusCounts = orderRepository.countOrdersByStatus(restaurantId);
        List<Map<String, Object>> ordersByStatus = statusCounts.stream().map(result -> {
            Map<String, Object> map = new HashMap<>();
            map.put("status", result[0].toString());
            map.put("_count", Map.of("id", result[1]));
            return map;
        }).collect(Collectors.toList());

        // Se totalRevenue for nulo (nenhum pedido), definimos como 0.0
        return Map.of(
                "totalOrders", totalOrders,
                "totalRevenue", totalRevenue != null ? totalRevenue : 0.0,
                "ordersByStatus", ordersByStatus
        );
    }
}