package com.foodie.delivery.service;

import com.foodie.delivery.domain.entity.Restaurant;
import com.foodie.delivery.domain.entity.User;
import com.foodie.delivery.dto.RestaurantDto;
import com.foodie.delivery.repository.RestaurantRepository;
import com.foodie.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public Restaurant create(RestaurantDto.Create data, UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Dono não encontrado."));

        Restaurant restaurant = Restaurant.builder()
                .name(data.getName())
                .description(data.getDescription())
                .address(data.getAddress())
                .specialty(data.getSpecialty())
                .owner(owner)
                .build();

        return restaurantRepository.save(restaurant);
    }

    public Map<String, Object> listAll(String search, int page, int limit, String specialty) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit);
        Page<Restaurant> restaurantPage = restaurantRepository.findAllWithFilters(search, specialty, pageRequest);

        return Map.of(
                "data", restaurantPage.getContent(),
                "total", restaurantPage.getTotalElements(),
                "page", page,
                "limit", limit,
                "totalPages", restaurantPage.getTotalPages()
        );
    }
}