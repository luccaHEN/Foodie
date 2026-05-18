package com.foodie.delivery.repository;

import com.foodie.delivery.domain.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {
    
    @Query("SELECT r FROM Restaurant r WHERE " +
           "(:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:specialty IS NULL OR r.specialty = :specialty)")
    Page<Restaurant> findAllWithFilters(@Param("search") String search, @Param("specialty") String specialty, Pageable pageable);
}