import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados...');

  // 1. Criar um usuário Dono de Restaurante (se não existir)
  const hashedPassword = await bcrypt.hash('123456', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'admin@foodie.com' },
    update: {},
    create: {
      name: 'Admin Foodie',
      email: 'admin@foodie.com',
      password: hashedPassword,
      role: Role.RESTAURANT,
      phone: '(11) 99999-9999',
    },
  });

  console.log(`👨‍🍳 Dono criado: ${owner.email} | Senha: 123456`);

  // 1.1 Criar um Cliente padrão
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@foodie.com' },
    update: {},
    create: {
      name: 'Cliente Foodie',
      email: 'cliente@foodie.com',
      password: hashedPassword,
      role: Role.CUSTOMER,
      phone: '(11) 98888-8888',
      address: 'Rua das Flores, 123 - Centro, São Paulo',
    },
  });
  console.log(`👤 Cliente criado: ${customer.email} | Senha: 123456`);

  // 1.2 Criar um Entregador padrão
  const deliveryPerson = await prisma.user.upsert({
    where: { email: 'entregador@foodie.com' },
    update: {},
    create: {
      name: 'Entregador Foodie',
      email: 'entregador@foodie.com',
      password: hashedPassword,
      role: Role.DELIVERY,
      phone: '(11) 97777-7777',
    },
  });
  console.log(`🛵 Entregador criado: ${deliveryPerson.email} | Senha: 123456`);

  // MÁGICA: Garante que TODOS os restaurantes já existentes no banco fiquem vinculados a este dono!
  await prisma.restaurant.updateMany({ data: { ownerId: owner.id } });

  // 2. Dados dos 25 Restaurantes
  const restaurantsData = [
    // --- HAMBURGUERIAS ---
    {
      name: 'Smash City Burgers',
      description: 'Especialistas em smash burgers com crosta perfeita e muito queijo.',
      address: 'Av. Paulista, 1000 - Bela Vista',
      specialty: 'Lanches',
      categories: [
        {
          name: 'Smash Burgers',
          products: [
            { name: 'Smash Simples', description: 'Pão brioche, blend 90g, queijo cheddar e molho da casa.', price: 22.90 },
            { name: 'Smash Duplo Bacon', description: 'Pão brioche, 2 blends 90g, duplo cheddar, bacon crocante.', price: 32.90 },
            { name: 'Triple Smash', description: 'Para os famintos: 3 blends 90g, triplo queijo, picles e cebola.', price: 42.90 }
          ]
        },
        {
          name: 'Acompanhamentos',
          products: [
            { name: 'Batata Frita', description: 'Porção individual de batatas rústicas.', price: 12.00 },
            { name: 'Nuggets com Queijo', description: '10 unidades de nuggets com cheddar derretido.', price: 18.50 }
          ]
        }
      ]
    },
    {
      name: 'Ogro Burger',
      description: 'Hambúrgueres artesanais gigantes assados na brasa.',
      address: 'Rua Augusta, 500 - Consolação',
      specialty: 'Lanches',
      categories: [
        {
          name: 'Artesanais',
          products: [
            { name: 'Ogro Clássico', description: 'Blend 200g, mussarela, alface, tomate e maionese verde.', price: 28.00 },
            { name: 'Costela Burger', description: 'Blend de costela 200g, queijo prato, cebola caramelizada.', price: 34.00 }
          ]
        }
      ]
    },
    {
      name: 'Vegan Bites',
      description: 'A melhor experiência em hambúrgueres 100% à base de plantas.',
      address: 'Rua Fradique Coutinho, 120 - Pinheiros',
      specialty: 'Saudável',
      categories: [
        {
          name: 'Lanches Veganos',
          products: [
            { name: 'Futuro Burger', description: 'Hambúrguer de plantas, queijo vegano, alface e tomate.', price: 35.00 },
            { name: 'Not Chicken', description: 'Frango vegetal empanado, maionese vegana e picles.', price: 32.00 }
          ]
        }
      ]
    },
    {
      name: 'Tex-Mex Burger',
      description: 'A fusão perfeita entre o hambúrguer americano e o tempero mexicano.',
      address: 'Av. Brigadeiro Faria Lima, 2000 - Pinheiros',
      specialty: 'Mexicana',
      categories: [
        {
          name: 'Especiais',
          products: [
            { name: 'Guaca Burger', description: 'Blend 160g, guacamole fresco, sour cream e nachos.', price: 36.90 },
            { name: 'Jalapeño Spicy', description: 'Blend 160g, cheddar, pimentas jalapeño e bacon.', price: 34.90 }
          ]
        }
      ]
    },
    // --- PIZZARIAS ---
    {
      name: 'Bella Napoli Pizzaria',
      description: 'Pizzas tradicionais italianas com massa de fermentação natural.',
      address: 'Rua da Mooca, 800 - Mooca',
      specialty: 'Pizza',
      categories: [
        {
          name: 'Pizzas Salgadas',
          products: [
            { name: 'Margherita Clássica', description: 'Massa fina, molho de tomate pelati, mussarela de búfala e manjericão fresco.', price: 55.00 },
            { name: 'Pepperoni', description: 'Mussarela, rodelas de pepperoni artesanal e parmesão.', price: 62.00 },
            { name: 'Quatro Queijos', description: 'Mussarela, gorgonzola, provolone e catupiry.', price: 68.00 }
          ]
        },
        {
          name: 'Pizzas Doces',
          products: [
            { name: 'Pizza de Nutella', description: 'Nutella original com morangos fatiados.', price: 48.00 },
            { name: 'Doce de Leite', description: 'Doce de leite argentino com coco ralado.', price: 45.00 }
          ]
        }
      ]
    },
    {
      name: 'Pizza Express',
      description: 'Pizzas deliciosas que chegam quentinhas e rápido na sua porta.',
      address: 'Av. Ibirapuera, 3000 - Moema',
      specialty: 'Pizza',
      categories: [
        {
          name: 'Tradicionais',
          products: [
            { name: 'Calabresa', description: 'Calabresa fatiada, cebola e azeitonas.', price: 45.00 },
            { name: 'Frango com Catupiry', description: 'Frango desfiado coberto com legítimo catupiry.', price: 49.90 }
          ]
        }
      ]
    },
    {
      name: 'Pedaço do Céu',
      description: 'Pizzas vendidas em fatias gigantes (estilo New York).',
      address: 'Rua Augusta, 1200 - Consolação',
      specialty: 'Pizza',
      categories: [
        {
          name: 'Fatias (Slice)',
          products: [
            { name: 'Fatia Cheese', description: 'Fatia gigante de queijo mussarela.', price: 15.00 },
            { name: 'Fatia Pepperoni', description: 'Fatia gigante de pepperoni com mel picante.', price: 18.00 }
          ]
        }
      ]
    },
    {
      name: 'Pizzaria Vegana',
      description: 'Pizzas feitas 100% sem ingredientes de origem animal.',
      address: 'Rua Harmonia, 300 - Vila Madalena',
      specialty: 'Saudável',
      categories: [
        {
          name: 'Pizzas Veganas',
          products: [
            { name: 'Margherita Vegana', description: 'Queijo de castanhas, tomate e manjericão.', price: 58.00 },
            { name: 'Brócolis com Tofu', description: 'Brócolis fresco, tofu defumado e alho frito.', price: 60.00 }
          ]
        }
      ]
    },
    // --- ASIÁTICA / JAPONESA ---
    {
      name: 'Tokyo Sushi Bar',
      description: 'O melhor da culinária japonesa moderna e fresca.',
      address: 'Rua Tomás Gonzaga, 50 - Liberdade',
      specialty: 'Japonesa',
      categories: [
        {
          name: 'Combinados',
          products: [
            { name: 'Combo Salmão (20 peças)', description: '10 sashimis, 5 niguiris, 5 uramakis de salmão.', price: 79.90 },
            { name: 'Combo Casal (40 peças)', description: 'Sashimis variados, hossomakis, niguiris e joy.', price: 149.90 }
          ]
        },
        {
          name: 'Temakis',
          products: [
            { name: 'Temaki Salmão Completo', description: 'Salmão, cream cheese e cebolinha.', price: 28.00 },
            { name: 'Temaki Atum Spicy', description: 'Atum batido com pimenta sriracha e ovas.', price: 32.00 }
          ]
        }
      ]
    },
    {
      name: 'Yakisoba Express',
      description: 'Pratos quentes asiáticos feitos na wok.',
      address: 'Praça da Liberdade, 100 - Liberdade',
      specialty: 'Japonesa',
      categories: [
        {
          name: 'Yakisobas',
          products: [
            { name: 'Yakisoba Clássico', description: 'Macarrão frito com carne, frango e legumes.', price: 35.00 },
            { name: 'Yakisoba de Camarão', description: 'Macarrão frito com camarões grandes e legumes.', price: 48.00 }
          ]
        }
      ]
    },
    {
      name: 'Poke & Bowl',
      description: 'Pokes havaianos frescos e saudáveis montados na hora.',
      address: 'Av. Engenheiro Luís Carlos Berrini, 500 - Itaim Bibi',
      specialty: 'Saudável',
      categories: [
        {
          name: 'Pokes',
          products: [
            { name: 'Poke Salmão', description: 'Arroz, salmão em cubos, abacate, edamame e chips de batata doce.', price: 45.00 },
            { name: 'Poke Atum', description: 'Arroz, atum, manga, pepino e molho ponzu.', price: 48.00 }
          ]
        }
      ]
    },
    // --- SORVETERIAS & DOCERIAS ---
    {
      name: 'Gelato & Co.',
      description: 'Gelatos italianos artesanais sem conservantes.',
      address: 'Rua Oscar Freire, 900 - Pinheiros',
      specialty: 'Doces',
      categories: [
        {
          name: 'Potes de Gelato',
          products: [
            { name: 'Pote Pistache 500ml', description: 'Pistache puro importado da Itália.', price: 65.00 },
            { name: 'Pote Chocolate Belga 500ml', description: 'Chocolate 70% cacau super cremoso.', price: 55.00 }
          ]
        },
        {
          name: 'Sobremesas',
          products: [
            { name: 'Brownie com Sorvete', description: 'Brownie quente com uma bola de gelato de baunilha.', price: 28.00 }
          ]
        }
      ]
    },
    {
      name: 'Açúcar & Afeto Doceria',
      description: 'Bolos, tortas e doces finos para alegrar o seu dia.',
      address: 'Rua dos Pinheiros, 300 - Pinheiros',
      specialty: 'Doces',
      categories: [
        {
          name: 'Bolos em Fatias',
          products: [
            { name: 'Red Velvet', description: 'Fatia de bolo red velvet com recheio de cream cheese.', price: 18.00 },
            { name: 'Bolo de Cenoura', description: 'Bolo de cenoura fofinho com cobertura de brigadeiro.', price: 15.00 }
          ]
        }
      ]
    },
    {
      name: 'Açaí Tropical',
      description: 'O verdadeiro açaí do Pará com os melhores acompanhamentos.',
      address: 'Av. Paulista, 200 - Bela Vista',
      specialty: 'Doces',
      categories: [
        {
          name: 'Copos de Açaí',
          products: [
            { name: 'Açaí 300ml', description: 'Açaí puro com 2 acompanhamentos grátis.', price: 18.00 },
            { name: 'Açaí 500ml Turbo', description: 'Açaí com leite em pó, leite condensado, banana e morango.', price: 26.00 }
          ]
        }
      ]
    },
    // --- COMIDA SAUDÁVEL E SALADAS ---
    {
      name: 'Salad in Box',
      description: 'Saladas frescas e refeições leves prontas para o consumo.',
      address: 'Rua Haddock Lobo, 400 - Cerqueira César',
      specialty: 'Saudável',
      categories: [
        {
          name: 'Saladas Especiais',
          products: [
            { name: 'Salada Caesar com Frango', description: 'Alface americana, frango grelhado, croutons, parmesão e molho Caesar.', price: 32.00 },
            { name: 'Salada Quinoa e Salmão', description: 'Mix de folhas, quinoa, lascas de salmão e molho de mostarda e mel.', price: 42.00 }
          ]
        },
        {
          name: 'Sucos Naturais',
          products: [
            { name: 'Suco Verde', description: 'Laranja, couve, gengibre e maçã 400ml.', price: 12.00 },
            { name: 'Suco de Laranja', description: 'Suco de laranja espremido na hora 400ml.', price: 10.00 }
          ]
        }
      ]
    },
    {
      name: 'Marmita Fit',
      description: 'Refeições balanceadas com contagem de calorias.',
      address: 'Av. Rebouças, 1000 - Jardins',
      specialty: 'Saudável',
      categories: [
        {
          name: 'Pratos Feitos',
          products: [
            { name: 'Frango com Batata Doce', description: '150g de frango grelhado e 100g de purê de batata doce.', price: 26.00 },
            { name: 'Patinho com Brócolis', description: '150g de carne moída de patinho e brócolis cozido no vapor.', price: 30.00 }
          ]
        }
      ]
    },
    // --- COMIDA BRASILEIRA / MARMITAS ---
    {
      name: 'Cantina da Vovó',
      description: 'Comida caseira com gostinho de família.',
      address: 'Rua Bresser, 400 - Mooca',
      specialty: 'Brasileira',
      categories: [
        {
          name: 'Pratos do Dia',
          products: [
            { name: 'Feijoada Completa', description: 'Feijoada, arroz, couve, farofa, torresmo e laranja.', price: 45.00 },
            { name: 'Bife à Parmegiana', description: 'Bife empanado com queijo e molho, arroz e fritas.', price: 38.00 }
          ]
        }
      ]
    },
    {
      name: 'Churrasco em Casa',
      description: 'Carnes nobres assadas na brasa entregues prontas.',
      address: 'Av. Morumbi, 500 - Pinheiros',
      specialty: 'Brasileira',
      categories: [
        {
          name: 'Grelhados',
          products: [
            { name: 'Picanha na Brasa', description: 'Porção de picanha fatiada (500g) com farofa e vinagrete.', price: 85.00 },
            { name: 'Linguiça Toscana', description: 'Porção de linguiça assada (400g) com pão de alho.', price: 35.00 }
          ]
        }
      ]
    },
    {
      name: 'Pastelaria da Feira',
      description: 'O verdadeiro pastel de feira, super recheado e sequinho.',
      address: 'Rua 25 de Março, 100 - Centro',
      specialty: 'Lanches',
      categories: [
        {
          name: 'Pastéis Salgados',
          products: [
            { name: 'Pastel de Carne', description: 'Carne moída temperada com azeitonas.', price: 10.00 },
            { name: 'Pastel Especial de Queijo', description: 'Queijo mussarela derretido em abundância.', price: 12.00 }
          ]
        },
        {
          name: 'Acompanhamentos',
          products: [
            { name: 'Caldo de Cana 500ml', description: 'Caldo de cana gelado com limão.', price: 8.00 }
          ]
        }
      ]
    },
    // --- COMIDA MEXICANA ---
    {
      name: 'Taco Loco',
      description: 'Autêntica culinária mexicana.',
      address: 'Rua Itapura, 200 - Tatuapé',
      specialty: 'Mexicana',
      categories: [
        {
          name: 'Tacos & Burritos',
          products: [
            { name: 'Burrito de Chilli', description: 'Tortilla recheada com carne moída apimentada, arroz, feijão e queijo.', price: 35.00 },
            { name: 'Taco Al Pastor', description: '2 tacos de carne de porco marinada com abacaxi.', price: 28.00 }
          ]
        }
      ]
    }
  ]; // Final da lista de 20 restaurantes ultra-detalhados!

  console.log(`Povoando ${restaurantsData.length} restaurantes com seus cardápios...`);

  // 3. Inserir tudo no banco
  for (const restData of restaurantsData) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: restData.name,
        description: restData.description,
        address: restData.address,
        specialty: restData.specialty,
        ownerId: owner.id,
      },
    });

    for (const cat of restData.categories) {
      await prisma.category.create({
        data: {
          name: cat.name,
          restaurantId: restaurant.id,
          products: {
            create: cat.products.map((prod) => ({
              name: prod.name,
              description: prod.description,
              price: prod.price,
              restaurantId: restaurant.id, // Vínculo explícito com o restaurante avô
            })),
          },
        },
      });
    }
  }

  console.log('✅ Seed finalizado com sucesso! Seu app está cheio de comida deliciosa.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });