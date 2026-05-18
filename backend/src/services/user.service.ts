import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserInput } from '../schemas/user.schema';
import { LoginInput } from '../schemas/auth.schema';
import { UpdateProfileInput } from '../schemas/user.schema';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: CreateUserInput) {
    // 1. Verifica se o usuário já existe
    const userExists = await this.userRepository.findByEmail(data.email);
    if (userExists) {
      throw new Error('E-mail já cadastrado.');
    }

    // 2. Hash da senha (custo 10 é o padrão seguro recomendado)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Salva no banco de dados através do repositório
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      ...(data.role && { role: data.role }), // Adiciona 'role' apenas se ele existir
    });

    // 4. Remove a senha do objeto antes de retornar
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: LoginInput) {
    // 1. Busca o usuário pelo e-mail
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Credenciais inválidas.'); // Mensagem genérica por segurança
    }

    // 2. Compara a senha informada com o hash salvo no banco
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas.');
    }

    // 3. Gera o token JWT com informações úteis no payload (id e role)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } // O token expira em 1 dia
    );

    // 4. Retorna o usuário (sem senha) junto com o token
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await this.userRepository.update(userId, { 
      ...(data.name && { name: data.name }),
      ...(data.address && { address: data.address }),
      ...(data.phone && { phone: data.phone }),
    });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}