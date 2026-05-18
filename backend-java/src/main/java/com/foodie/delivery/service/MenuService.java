package com.foodie.delivery.service;

import com.foodie.delivery.domain.entity.Category;
import com.foodie.delivery.domain.entity.Product;
import com.foodie.delivery.domain.entity.Restaurant;
import com.foodie.delivery.dto.MenuDto;
import com.foodie.delivery.repository.CategoryRepository;
import com.foodie.delivery.repository.ProductRepository;
import com.foodie.delivery.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final RestaurantRepository restaurantRepository;

    // Função reutilizável igual a do Node
    private Restaurant validateRestaurantOwnership(UUID restaurantId, UUID ownerId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante não encontrado."));
        
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new IllegalArgumentException("Acesso negado: Você não é o dono deste restaurante.");
        }
        return restaurant;
    }

    public Category createCategory(MenuDto.CreateCategory data, UUID ownerId) {
        Restaurant restaurant = validateRestaurantOwnership(data.getRestaurantId(), ownerId);

        Category category = Category.builder()
                .name(data.getName())
                .restaurant(restaurant)
                .build();

        return categoryRepository.save(category);
    }

    public Product createProduct(MenuDto.CreateProduct data, UUID ownerId) {
        Restaurant restaurant = validateRestaurantOwnership(data.getRestaurantId(), ownerId);

        Category category = categoryRepository.findById(data.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));

        if (!category.getRestaurant().getId().equals(restaurant.getId())) {
            throw new IllegalArgumentException("A categoria não pertence a este restaurante.");
        }

        Product product = Product.builder()
                .name(data.getName())
                .description(data.getDescription())
                .price(data.getPrice())
                .restaurant(restaurant)
                .category(category)
                .build();

        return productRepository.save(product);
    }

    public Product updateProduct(UUID productId, MenuDto.UpdateProduct data, UUID ownerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));

        validateRestaurantOwnership(product.getRestaurant().getId(), ownerId);

        if (data.getName() != null && !data.getName().isBlank()) product.setName(data.getName());
        if (data.getDescription() != null) product.setDescription(data.getDescription());
        if (data.getPrice() != null) product.setPrice(data.getPrice());
        
        if (data.getCategoryId() != null) {
            Category category = categoryRepository.findById(data.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
            if (!category.getRestaurant().getId().equals(product.getRestaurant().getId())) {
                throw new IllegalArgumentException("A categoria não pertence a este restaurante.");
            }
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(UUID productId, UUID ownerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));

        validateRestaurantOwnership(product.getRestaurant().getId(), ownerId);

        productRepository.delete(product);
    }

    public List<Category> getMenu(UUID restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new IllegalArgumentException("Restaurante não encontrado.");
        }
        
        // Graças ao @OneToMany na Entidade Category, o Spring JPA buscará as categorias
        // e automaticamente anexará a lista de produtos de cada uma na resposta final!
        return categoryRepository.findByRestaurantId(restaurantId);
    }
}