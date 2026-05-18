package com.foodie.delivery.service;

import com.foodie.delivery.domain.entity.*;
import com.foodie.delivery.domain.enums.DeliveryMethod;
import com.foodie.delivery.domain.enums.OrderStatus;
import com.foodie.delivery.domain.enums.Role;
import com.foodie.delivery.dto.OrderDto;
import com.foodie.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final WebSocketNotificationService webSocketNotificationService;

    @Transactional // Garante que se der erro em algum momento, todo o banco faz "rollback"
    public Order create(OrderDto.Create data, UUID customerId) {
        User customer = userRepository.findById(customerId).orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));
        Restaurant restaurant = restaurantRepository.findById(data.getRestaurantId()).orElseThrow(() -> new IllegalArgumentException("Restaurante não encontrado."));

        List<UUID> productIds = data.getItems().stream().map(OrderDto.OrderItemDto::getProductId).collect(Collectors.toList());
        List<Product> products = productRepository.findAllById(productIds);

        if (products.size() != productIds.size()) {
            throw new IllegalArgumentException("Um ou mais produtos não foram encontrados.");
        }

        double totalAmount = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();
        
        Order order = Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .deliveryMethod(data.getDeliveryMethod() != null ? data.getDeliveryMethod() : DeliveryMethod.DELIVERY)
                .deliveryAddress(data.getDeliveryAddress())
                .status(OrderStatus.RECEIVED)
                .verificationCode(String.valueOf((int) (Math.random() * 9000) + 1000))
                .items(orderItems)
                .build();

        for (OrderDto.OrderItemDto itemDto : data.getItems()) {
            Product product = products.stream().filter(p -> p.getId().equals(itemDto.getProductId())).findFirst().orElseThrow();
            if (!product.getRestaurant().getId().equals(restaurant.getId())) {
                throw new IllegalArgumentException("O produto '" + product.getName() + "' não pertence a este restaurante.");
            }
            totalAmount += product.getPrice() * itemDto.getQuantity();

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(product.getPrice()) // Preço congelado no momento da compra
                    .build());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        webSocketNotificationService.emitNewOrderToRestaurant(data.getRestaurantId(), savedOrder);
        return savedOrder;
    }

    public List<Order> listCustomerOrders(UUID customerId) {
        return orderRepository.findByCustomerIdAndStatusNotOrderByCreatedAtDesc(customerId, OrderStatus.DELIVERED);
    }

    public List<Order> listCustomerHistory(UUID customerId) {
        return orderRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customerId, OrderStatus.DELIVERED);
    }

    @Transactional
    public Order updateStatus(UUID orderId, OrderStatus status, UUID ownerId, String verificationCode) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));
        if (!order.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new IllegalArgumentException("Acesso negado: Você não é o dono deste restaurante.");
        }
        if (status == OrderStatus.DELIVERED && !order.getVerificationCode().equals(verificationCode)) {
            throw new IllegalArgumentException("Código de verificação incorreto.");
        }

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        webSocketNotificationService.emitOrderStatusChange(orderId, status);
        return updatedOrder;
    }

    public List<Order> getRestaurantLiveOrders(UUID restaurantId, UUID ownerId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();
        if (!restaurant.getOwner().getId().equals(ownerId)) throw new IllegalArgumentException("Acesso negado.");
        return orderRepository.findByRestaurantIdAndStatusNotInOrderByCreatedAtAsc(restaurantId, List.of(OrderStatus.DELIVERED));
    }

    public List<Order> getRestaurantOrderHistory(UUID restaurantId, UUID ownerId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();
        if (!restaurant.getOwner().getId().equals(ownerId)) throw new IllegalArgumentException("Acesso negado.");
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }

    public Review createReview(UUID orderId, UUID customerId, OrderDto.CreateReview data) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));
        if (!order.getCustomer().getId().equals(customerId)) throw new IllegalArgumentException("Acesso negado: Este pedido não é seu.");
        if (order.getStatus() != OrderStatus.DELIVERED) throw new IllegalArgumentException("Você só pode avaliar pedidos que já foram entregues.");
        if (reviewRepository.existsByOrderId(orderId)) throw new IllegalArgumentException("Este pedido já foi avaliado.");

        Review review = Review.builder()
                .order(order).restaurant(order.getRestaurant()).customer(order.getCustomer())
                .rating(data.getRating()).comment(data.getComment())
                .build();
        return reviewRepository.save(review);
    }

    public ChatMessage addMessageToOrder(UUID orderId, UUID senderId, Role senderRole, String content) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));
        User sender = userRepository.findById(senderId).orElseThrow();

        ChatMessage message = ChatMessage.builder()
                .order(order).sender(sender).role(senderRole).content(content)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        webSocketNotificationService.emitNewChatMessage(orderId, savedMessage);
        return savedMessage;
    }

    public List<ChatMessage> getOrderMessages(UUID orderId) {
        return chatMessageRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
    }
}