package com.foodie.delivery.service;

import com.foodie.delivery.domain.entity.Delivery;
import com.foodie.delivery.domain.entity.Order;
import com.foodie.delivery.domain.entity.User;
import com.foodie.delivery.domain.enums.DeliveryMethod;
import com.foodie.delivery.domain.enums.OrderStatus;
import com.foodie.delivery.repository.DeliveryRepository;
import com.foodie.delivery.repository.OrderRepository;
import com.foodie.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final WebSocketNotificationService webSocketNotificationService;

    @Transactional
    public Delivery acceptDelivery(UUID orderId, UUID deliveryPersonId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));
        
        if (order.getStatus() == OrderStatus.RECEIVED) throw new IllegalArgumentException("O restaurante ainda não começou a preparar este pedido.");
        if (deliveryRepository.findByOrderId(orderId).isPresent()) throw new IllegalArgumentException("Esta entrega já foi aceita por outro entregador.");

        User deliveryPerson = userRepository.findById(deliveryPersonId).orElseThrow(() -> new IllegalArgumentException("Entregador não encontrado."));

        Delivery delivery = Delivery.builder()
                .order(order)
                .deliveryPerson(deliveryPerson)
                .acceptedAt(LocalDateTime.now())
                .build();

        return deliveryRepository.save(delivery);
    }

    @Transactional
    public Delivery pickUpDelivery(UUID orderId, UUID deliveryPersonId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId).orElseThrow(() -> new IllegalArgumentException("Entrega não encontrada."));

        if (!delivery.getDeliveryPerson().getId().equals(deliveryPersonId)) throw new IllegalArgumentException("Acesso negado: Esta entrega não é sua.");
        if (delivery.getPickedUpAt() != null) throw new IllegalArgumentException("Esta entrega já foi retirada.");

        Order order = delivery.getOrder();
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) throw new IllegalArgumentException("Calma! O restaurante ainda não marcou este pedido como \"Pronto para Retirada\".");

        delivery.setPickedUpAt(LocalDateTime.now());
        order.setStatus(OrderStatus.ON_THE_WAY);
        orderRepository.save(order);

        webSocketNotificationService.emitOrderStatusChange(orderId, OrderStatus.ON_THE_WAY);
        return deliveryRepository.save(delivery);
    }

    @Transactional
    public Delivery markAsDelivered(UUID orderId, UUID deliveryPersonId, String verificationCode) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId).orElseThrow(() -> new IllegalArgumentException("Entrega não encontrada."));

        if (!delivery.getDeliveryPerson().getId().equals(deliveryPersonId)) throw new IllegalArgumentException("Acesso negado: Esta entrega não é sua.");
        if (delivery.getDeliveredAt() != null) throw new IllegalArgumentException("Esta entrega já foi finalizada.");
        if (delivery.getPickedUpAt() == null) throw new IllegalArgumentException("Você precisa retirar o pedido no restaurante primeiro.");

        Order order = delivery.getOrder();
        if (!order.getVerificationCode().equals(verificationCode)) throw new IllegalArgumentException("Código de verificação incorreto.");

        delivery.setDeliveredAt(LocalDateTime.now());
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        webSocketNotificationService.emitOrderStatusChange(orderId, OrderStatus.DELIVERED);
        return deliveryRepository.save(delivery);
    }

    public List<Delivery> listMyDeliveries(UUID deliveryPersonId) { return deliveryRepository.findByDeliveryPersonIdAndDeliveredAtIsNull(deliveryPersonId); }
    public List<Delivery> getMyDeliveryHistory(UUID deliveryPersonId) { return deliveryRepository.findByDeliveryPersonIdAndDeliveredAtIsNotNullOrderByDeliveredAtDesc(deliveryPersonId); }
    
    public List<Order> getAvailableDeliveries() { return orderRepository.findByDeliveryIsNullAndStatusInAndDeliveryMethodOrderByCreatedAtAsc(List.of(OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP), DeliveryMethod.DELIVERY); }
}