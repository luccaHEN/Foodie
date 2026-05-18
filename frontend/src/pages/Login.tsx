import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (error) {
      alert('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 relative overflow-hidden">
      {/* Bolhas de fundo para um visual moderno */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full max-w-md relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 text-center mb-8 tracking-tight">Foodie.</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-stone-700 ml-1">E-mail</label>
            <input
              {...register('email')}
              className="mt-2 w-full rounded-2xl border-stone-200 bg-stone-50/50 shadow-inner focus:bg-white focus:border-orange-500 focus:ring-orange-500 p-4 transition-all outline-none"
              placeholder="seu@email.com"
            />
            {errors.email && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 ml-1">Senha</label>
            <input
              type="password"
              {...register('password')}
              className="mt-2 w-full rounded-2xl border-stone-200 bg-stone-50/50 shadow-inner focus:bg-white focus:border-orange-500 focus:ring-orange-500 p-4 transition-all outline-none"
            />
            {errors.password && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errors.password.message}</span>}
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all active:scale-95 mt-4">
            Entrar
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <Link to="/register" className="text-stone-500 font-medium hover:text-orange-500 transition-colors">
            Não tem conta? Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}