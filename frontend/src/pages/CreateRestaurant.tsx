import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';

const createRestaurantSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  description: z.string().optional(),
  address: z.string().min(5, 'O endereço é obrigatório.'),
  specialty: z.string().optional(),
});

type CreateRestaurantForm = z.infer<typeof createRestaurantSchema>;

export function CreateRestaurant() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateRestaurantForm>({
    resolver: zodResolver(createRestaurantSchema),
  });

  const onSubmit = async (data: CreateRestaurantForm) => {
    try {
      await api.post('/restaurants', data);
      alert('Restaurante cadastrado com sucesso!');
      navigate('/'); // Volta para a home para ver o restaurante criado
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar restaurante. Verifique sua conexão.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white border-b p-4 sticky top-0 z-10 flex items-center shadow-sm">
        <Link to="/" className="text-red-500 font-medium flex items-center gap-2 hover:bg-red-50 p-2 rounded-md transition">
          <ArrowLeft size={20} /> Voltar para Home
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4 flex items-center gap-2"><Store /> Cadastrar Restaurante</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 mt-6">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Restaurante</label>
              <input {...register('name')} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" placeholder="Ex: Pizzaria do Lucca" />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
              <input {...register('address')} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" placeholder="Ex: Rua das Flores, 123" />
              {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 ml-1 mb-2">Especialidade Principal</label>
              <select {...register('specialty')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none text-stone-700">
                <option value="">Geral / Outros</option>
                <option value="Lanches">Lanches e Hambúrgueres</option>
                <option value="Pizza">Pizzaria</option>
                <option value="Japonesa">Japonesa / Sushi</option>
                <option value="Doces">Doces e Sorvetes</option>
                <option value="Saudável">Saudável e Saladas</option>
                <option value="Brasileira">Comida Brasileira</option>
                <option value="Mexicana">Comida Mexicana</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
              <textarea {...register('description')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none" rows={3} placeholder="A melhor pizza da região..." />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all active:scale-95 mt-4">Salvar Restaurante</button>
          </form>
        </div>
      </main>
    </div>
  );
}