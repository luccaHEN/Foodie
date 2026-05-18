package com.foodie.delivery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DeliveryApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeliveryApplication.class, args);
        System.out.println("🚀 Servidor Java rodando na porta 8080 (http://localhost:8080)");
    }
}