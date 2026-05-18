package com.foodie.delivery.seed;

import com.foodie.delivery.domain.entity.Category;
import com.foodie.delivery.domain.entity.Product;
import com.foodie.delivery.domain.entity.Restaurant;
import com.foodie.delivery.domain.entity.User;
import com.foodie.delivery.domain.enums.Role;
import com.foodie.delivery.repository.CategoryRepository;
import com.foodie.delivery.repository.ProductRepository;
import com.foodie.delivery.repository.RestaurantRepository;
import com.foodie.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    // Estruturas auxiliares limpas para organizar os dados
    record ProductSeed(String name, String description, double price) {}
    record CategorySeed(String name, List<ProductSeed> products) {}
    record RestaurantSeed(String name, String description, String address, String specialty, List<CategorySeed> categories) {}

    @Override
    public void run(String... args) {
        // Este método será executado na inicialização.
        // Verificamos se o usuário admin já existe para não duplicar.
        if (userRepository.findByEmail("admin@foodie.com").isEmpty()) {
            System.out.println("🌱 Iniciando o seed do banco de dados...");

            String hashedPassword = passwordEncoder.encode("123456");

            // 1. Criar Usuário Dono do Restaurante
            User owner = User.builder()
                    .name("Admin Foodie")
                    .email("admin@foodie.com")
                    .password(hashedPassword)
                    .role(Role.RESTAURANT)
                    .phone("(11) 99999-9999")
                    .build();

            owner = userRepository.save(owner);
            System.out.println("👨‍🍳 Dono de restaurante criado: admin@foodie.com | Senha: 123456");

            // 1.1 Criar Cliente
            User customer = User.builder()
                    .name("Cliente Foodie")
                    .email("cliente@foodie.com")
                    .password(hashedPassword)
                    .role(Role.CUSTOMER)
                    .phone("(11) 98888-8888")
                    .address("Rua das Flores, 123 - Centro, São Paulo")
                    .build();
            userRepository.save(customer);
            System.out.println("👤 Cliente criado: cliente@foodie.com | Senha: 123456");

            // 1.2 Criar Entregador
            User deliveryPerson = User.builder()
                    .name("Entregador Foodie")
                    .email("entregador@foodie.com")
                    .password(hashedPassword)
                    .role(Role.DELIVERY)
                    .phone("(11) 97777-7777")
                    .build();
            userRepository.save(deliveryPerson);
            System.out.println("🛵 Entregador criado: entregador@foodie.com | Senha: 123456");

            // 2. Dados dos Restaurantes (Mesma estrutura do Node.js)
            List<RestaurantSeed> restaurantsData = List.of(
                new RestaurantSeed("Smash City Burgers", "Especialistas em smash burgers com crosta perfeita e muito queijo.", "Av. Paulista, 1000 - Bela Vista", "Lanches", List.of(
                    new CategorySeed("Smash Burgers", List.of(
                        new ProductSeed("Smash Simples", "Pão brioche, blend 90g, queijo cheddar e molho da casa.", 22.90),
                        new ProductSeed("Smash Duplo Bacon", "Pão brioche, 2 blends 90g, duplo cheddar, bacon crocante.", 32.90),
                        new ProductSeed("Triple Smash", "Para os famintos: 3 blends 90g, triplo queijo, picles e cebola.", 42.90)
                    )),
                    new CategorySeed("Acompanhamentos", List.of(
                        new ProductSeed("Batata Frita", "Porção individual de batatas rústicas.", 12.00),
                        new ProductSeed("Nuggets com Queijo", "10 unidades de nuggets com cheddar derretido.", 18.50)
                    ))
                )),
                new RestaurantSeed("Bella Napoli Pizzaria", "Pizzas tradicionais italianas com massa de fermentação natural.", "Rua da Mooca, 800 - Mooca", "Pizza", List.of(
                    new CategorySeed("Pizzas Salgadas", List.of(
                        new ProductSeed("Margherita Clássica", "Massa fina, molho de tomate pelati, mussarela de búfala e manjericão fresco.", 55.00),
                        new ProductSeed("Pepperoni", "Mussarela, rodelas de pepperoni artesanal e parmesão.", 62.00),
                        new ProductSeed("Quatro Queijos", "Mussarela, gorgonzola, provolone e catupiry.", 68.00)
                    )),
                    new CategorySeed("Pizzas Doces", List.of(
                        new ProductSeed("Pizza de Nutella", "Nutella original com morangos fatiados.", 48.00),
                        new ProductSeed("Doce de Leite", "Doce de leite argentino com coco ralado.", 45.00)
                    ))
                )),
                new RestaurantSeed("Vegan Bites", "A melhor experiência em hambúrgueres 100% à base de plantas.", "Rua Fradique Coutinho, 120 - Pinheiros", "Saudável", List.of(
                    new CategorySeed("Lanches Veganos", List.of(
                        new ProductSeed("Futuro Burger", "Hambúrguer de plantas, queijo vegano, alface e tomate.", 35.00),
                        new ProductSeed("Not Chicken", "Frango vegetal empanado, maionese vegana e picles.", 32.00)
                    ))
                )),
                new RestaurantSeed("Tokyo Sushi Bar", "O melhor da culinária japonesa moderna e fresca.", "Rua Tomás Gonzaga, 50 - Liberdade", "Japonesa", List.of(
                    new CategorySeed("Combinados", List.of(
                        new ProductSeed("Combo Salmão (20 peças)", "10 sashimis, 5 niguiris, 5 uramakis de salmão.", 79.90),
                        new ProductSeed("Combo Casal (40 peças)", "Sashimis variados, hossomakis, niguiris e joy.", 149.90)
                    )),
                    new CategorySeed("Temakis", List.of(
                        new ProductSeed("Temaki Salmão Completo", "Salmão, cream cheese e cebolinha.", 28.00),
                        new ProductSeed("Temaki Atum Spicy", "Atum batido com pimenta sriracha e ovas.", 32.00)
                    ))
                )),
                new RestaurantSeed("Gelato & Co.", "Gelatos italianos artesanais sem conservantes.", "Rua Oscar Freire, 900 - Pinheiros", "Doces", List.of(
                    new CategorySeed("Potes de Gelato", List.of(
                        new ProductSeed("Pote Pistache 500ml", "Pistache puro importado da Itália.", 65.00),
                        new ProductSeed("Pote Chocolate Belga 500ml", "Chocolate 70% cacau super cremoso.", 55.00)
                    )),
                    new CategorySeed("Sobremesas", List.of(
                        new ProductSeed("Brownie com Sorvete", "Brownie quente com uma bola de gelato de baunilha.", 28.00)
                    ))
                )),
                new RestaurantSeed("Salad in Box", "Saladas frescas e refeições leves prontas para o consumo.", "Rua Haddock Lobo, 400 - Cerqueira César", "Saudável", List.of(
                    new CategorySeed("Saladas Especiais", List.of(
                        new ProductSeed("Salada Caesar com Frango", "Alface americana, frango grelhado, croutons, parmesão e molho Caesar.", 32.00),
                        new ProductSeed("Salada Quinoa e Salmão", "Mix de folhas, quinoa, lascas de salmão e molho de mostarda e mel.", 42.00)
                    )),
                    new CategorySeed("Sucos Naturais", List.of(
                        new ProductSeed("Suco Verde", "Laranja, couve, gengibre e maçã 400ml.", 12.00),
                        new ProductSeed("Suco de Laranja", "Suco de laranja espremido na hora 400ml.", 10.00)
                    ))
                )),
                new RestaurantSeed("Cantina da Vovó", "Comida caseira com gostinho de família.", "Rua Bresser, 400 - Mooca", "Brasileira", List.of(
                    new CategorySeed("Pratos do Dia", List.of(
                        new ProductSeed("Feijoada Completa", "Feijoada, arroz, couve, farofa, torresmo e laranja.", 45.00),
                        new ProductSeed("Bife à Parmegiana", "Bife empanado com queijo e molho, arroz e fritas.", 38.00)
                    ))
                )),
                new RestaurantSeed("Taco Loco", "Autêntica culinária mexicana.", "Rua Itapura, 200 - Tatuapé", "Mexicana", List.of(
                    new CategorySeed("Tacos & Burritos", List.of(
                        new ProductSeed("Burrito de Chilli", "Tortilla recheada com carne moída apimentada, arroz, feijão e queijo.", 35.00),
                        new ProductSeed("Taco Al Pastor", "2 tacos de carne de porco marinada com abacaxi.", 28.00)
                    ))
                ))
            );

            System.out.println("Povoando " + restaurantsData.size() + " restaurantes com seus cardápios...");

            // 3. Inserir Restaurantes, Categorias e Produtos
            for (RestaurantSeed rData : restaurantsData) {
                Restaurant restaurant = Restaurant.builder()
                        .name(rData.name())
                        .description(rData.description())
                        .address(rData.address())
                        .specialty(rData.specialty())
                        .owner(owner)
                        .build();
                restaurant = restaurantRepository.save(restaurant);

                for (CategorySeed cData : rData.categories()) {
                    Category category = Category.builder()
                            .name(cData.name())
                            .restaurant(restaurant)
                            .build();
                    category = categoryRepository.save(category);

                    for (ProductSeed pData : cData.products()) {
                        Product product = Product.builder()
                                .name(pData.name())
                                .description(pData.description())
                                .price(pData.price())
                                .restaurant(restaurant)
                                .category(category)
                                .build();
                        productRepository.save(product);
                    }
                }
            }

            System.out.println("✅ Seed finalizado com sucesso! Seu app está cheio de comida deliciosa.");
        }
    }
}