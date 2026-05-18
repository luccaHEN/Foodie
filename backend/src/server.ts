import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { prisma } from './prisma';
import { initSocket } from './websocket/socket';

const PORT = process.env.PORT || 3333;

async function bootstrap() {
  try {
    // Valida a conexão com o banco de dados antes de aceitar requisições HTTP
    await prisma.$connect();
    console.log('📦 Banco de dados conectado com sucesso.');

    const server = http.createServer(app);
    initSocket(server); // Inicializa o nosso Socket.IO

    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT} (http://localhost:${PORT})`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();