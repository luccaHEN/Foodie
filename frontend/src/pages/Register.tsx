import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
  role: z.enum(['CUSTOMER', 'RESTAURANT', 'DELIVERY']).default('CUSTOMER'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await api.post('/users/register', data);
      alert('Cadastro realizado com sucesso! Faça o login.');
      navigate('/login');
    } catch (error) {
      alert('Erro ao cadastrar. O e-mail já pode estar em uso.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-red-500">Criar Conta</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input {...register('name')} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input {...register('email')} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" {...register('password')} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Conta</label>
            <select {...register('role')} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border bg-white">
              <option value="CUSTOMER">Cliente</option>
              <option value="RESTAURANT">Dono de Restaurante</option>
              <option value="DELIVERY">Entregador</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-red-500 text-white rounded-md py-2 font-bold hover:bg-red-600 transition-colors">
            Cadastrar
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-red-500 hover:underline">
            Já tem conta? Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}