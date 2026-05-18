# 🍔 Foodie - Delivery App

Um aplicativo completo de delivery de comida (estilo iFood / Uber Eats), construído com arquitetura Fullstack e comunicação em tempo real. O grande diferencial deste projeto é possuir **dois backends independentes e intercambiáveis** (Node.js e Java/Spring Boot) que consomem a mesma base de dados em PostgreSQL e o mesmo frontend em React.

![Status](https://img.shields.io/badge/Status-Concluído-success)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Node.js](https://img.shields.io/badge/Backend%201-Node.js%20%2B%20Prisma-339933)
![Java](https://img.shields.io/badge/Backend%202-Java%20%2B%20Spring%20Boot-ED8B00)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1)

## ✨ Principais Funcionalidades

O ecossistema é dividido em 3 módulos principais, garantindo uma experiência completa ponta-a-ponta com base no **Role (Cargo)** do usuário:

### 👤 1. Módulo do Cliente (Customer)
- Exploração de restaurantes por categorias e especialidades.
- Visualização de cardápio (produtos e categorias).
- Sistema de Carrinho de Compras.
- Acompanhamento de pedidos em **Tempo Real (WebSockets)**.
- Sistema de avaliação (Reviews) ao finalizar o pedido.
- Chat em tempo real com o restaurante/entregador.

### 👨‍🍳 2. Módulo do Restaurante (Restaurant)
- Gerenciamento do Cardápio (CRUD de Categorias e Produtos).
- Fila de pedidos (Kanban-style) atualizada em **Tempo Real (WebSockets)**.
- Gestão de status do pedido (Preparando, Pronto para Retirada).
- Dashboard com métricas de vendas e gráficos gerenciais.

### 🛵 3. Módulo do Entregador (Delivery)
- Mural de corridas disponíveis na região.
- Aceite de corridas exclusivas.
- Fluxo de entrega seguro: finalização de entrega exige um **PIN de 4 dígitos** gerado no app do cliente.
- Histórico de entregas realizadas.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** com **Vite** (TypeScript)
- **Tailwind CSS** (Estilização e Design System)
- **Lucide React** (Ícones)
- **Axios** (Comunicação HTTP)
- **StompJS / SockJS** (WebSockets para o Backend Java)
- **Socket.IO Client** (WebSockets para o Backend Node.js)

### Backend 1: Java (Spring Boot)
- **Java 21** com **Spring Boot 3.x**
- **Spring Security & JJWT** (Autenticação Stateless)
- **Spring Data JPA / Hibernate** (Mapeamento Objeto-Relacional)
- **Spring WebSocket & STOMP** (Notificações em tempo real)
- **Jakarta Validation** (Validação de DTOs)

### Backend 2: Node.js
- **Node.js** com **Express** (TypeScript)
- **Prisma ORM** (Acesso a dados e Migrations)
- **Socket.IO** (Comunicação bidirecional)
- **Zod** (Validação de schemas)
- **Swagger** (Documentação da API)

### Banco de Dados
- **PostgreSQL**

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Java JDK (v21) e Maven
- PostgreSQL rodando localmente (na porta `5432`)

### 1. Configurando o Banco de Dados
Crie um banco de dados no seu PostgreSQL chamado `delivery_app`.

### 2. Rodando o Backend em Java (Spring Boot)
O backend Java roda na porta `8080`.

1. Navegue até a pasta `backend-java`.
2. Crie ou edite o arquivo `src/main/resources/application.properties` com suas credenciais do banco:
   ```properties
   server.port=8080
   spring.datasource.url=jdbc:postgresql://localhost:5432/delivery_app
   spring.datasource.username=seu_usuario
   spring.datasource.password=sua_senha
   spring.jpa.hibernate.ddl-auto=update
   jwt.secret=c5385a92868b00466acef3ae7ba63e82e990cb04b5de8a110f87c64ca0aeb036
   jwt.expiration=86400000
   ```
3. Inicie o servidor:
   ```bash
   mvn spring-boot:run
   ```
   *(Dica: Se quiser popular o banco de dados com 20+ restaurantes reais, mude o `ddl-auto` para `create` na primeira execução, e depois volte para `update`)*.

### 3. Rodando o Backend em Node.js (Alternativo)
O backend Node roda na porta `3333`.

1. Navegue até a pasta `backend`.
2. Instale as dependências com `npm install`.
3. Crie um arquivo `.env` baseado no `.env.example` e configure sua `DATABASE_URL`.
4. Rode as migrations e o Seed:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. Inicie o servidor:
   ```bash
   npm run dev
   ```

### 4. Rodando o Frontend (React)
1. Navegue até a pasta `frontend`.
2. Instale as dependências: `npm install`.
3. Verifique o arquivo `src/services/api.ts` e a biblioteca de WebSockets dependendo de qual backend você subiu:
   - Para testar com o **Java**, use a URL `http://localhost:8080/api` e o cliente `@stomp/stompjs`.
   - Para testar com o **Node**, use a URL `http://localhost:3333/api` e o cliente `socket.io-client`.
4. Inicie o vite:
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Contas de Teste Padrão (Seed)
Ao rodar o seed (seja pelo Prisma no Node, ou pelo DatabaseSeeder no Java), as seguintes contas são criadas automaticamente (Senha para todas: `123456`):
- **Dono de Restaurante:** `admin@foodie.com`
- **Cliente:** `cliente@foodie.com`
- **Entregador:** `entregador@foodie.com`