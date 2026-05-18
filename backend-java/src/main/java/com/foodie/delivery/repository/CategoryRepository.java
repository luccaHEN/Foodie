package com.foodie.delivery.repository;

import com.foodie.delivery.domain.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    @EntityGraph(attributePaths = {"products"})
    @Query("SELECT c FROM Category c WHERE c.restaurant.id = :restaurantId")
    List<Category> findByRestaurantId(@Param("restaurantId") UUID restaurantId);
}