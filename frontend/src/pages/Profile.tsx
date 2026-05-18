import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, MapPin, Phone, UserCircle } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function Profile() {
  const { user, updateUser } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { 
      name: user?.name || '',
      address: user?.address || '',
      phone: user?.phone || ''
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const response = await api.patch('/users/profile', data);
      updateUser(response.data.data); // Atualiza os dados locais
      alert('Endereço salvo com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar perfil.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="text-stone-600 font-bold flex items-center gap-2 hover:text-orange-500 p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-6 mt-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-400 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <UserCircle size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-800">Meu Perfil</h1>
            <p className="text-stone-500">Atualize suas informações pessoais</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-stone-700 ml-1 mb-2"><UserIcon size={16} className="text-orange-500"/> Nome de Exibição</label>
              <input {...register('name')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="Seu nome" />
              {errors.name && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errors.name.message}</span>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-stone-700 ml-1 mb-2"><Phone size={16} className="text-orange-500"/> Telefone / WhatsApp</label>
              <input {...register('phone')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="(00) 00000-0000" />
              {errors.phone && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errors.phone.message}</span>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-stone-700 ml-1 mb-2"><MapPin size={16} className="text-orange-500"/> Endereço Padrão de Entrega</label>
              <input {...register('address')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="Rua, Número, Bairro, Cidade" />
              {errors.address && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errors.address.message}</span>}
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all active:scale-95">
                Salvar Alterações
              </button>
            </div>
            
          </form>
        </div>
      </main>
    </div>
  );
}