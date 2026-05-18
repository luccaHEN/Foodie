import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, Store, Search, ChevronLeft, ChevronRight, User as UserIcon, ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  ownerId: string;
  specialty: string | null;
  reviews?: { rating: number }[];
}

const SPECIALTIES = [
  { id: '', name: 'Todos', icon: '🍽️' },
  { id: 'Lanches', name: 'Lanches', icon: '🍔' },
  { id: 'Pizza', name: 'Pizza', icon: '🍕' },
  { id: 'Japonesa', name: 'Japonesa', icon: '🍣' },
  { id: 'Doces', name: 'Doces', icon: '🍦' },
  { id: 'Saudável', name: 'Saudável', icon: '🥗' },
  { id: 'Brasileira', name: 'Brasileira', icon: '🍛' },
  { id: 'Mexicana', name: 'Mexicana', icon: '🌮' },
];

export function Home() {
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { items, toggleCart } = useCartStore();

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await api.get('/restaurants', {
          params: { search, page, limit: specialty === '' ? 50 : 12, specialty: specialty || undefined }
        });
        setRestaurants(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
      }
    }
    // Pequeno debounce para não buscar a cada letra digitada
    const timeoutId = setTimeout(() => fetchRestaurants(), 300);
    return () => clearTimeout(timeoutId);
  }, [search, page, specialty]);

  // Agrupa os restaurantes que voltaram da API pelas suas especialidades
  const orderedGroups = SPECIALTIES
    .filter(s => s.id !== '') // Remove a aba 'Todos' da listagem dos títulos
    .map(s => ({ ...s, restaurants: restaurants.filter(r => r.specialty === s.id) }))
    .filter(group => group.restaurants.length > 0); // Oculta as categorias que estão vazias no momento

  // E se tiver algum restaurante perdido que não tem especialidade definida ou é diferente da lista?
  const knownSpecIds = SPECIALTIES.map(s => s.id);
  const otherRests = restaurants.filter(r => !knownSpecIds.includes(r.specialty || ''));
  if (otherRests.length > 0) orderedGroups.push({ id: 'Outros', name: 'Outros', icon: '🍽️', restaurants: otherRests });

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-rose-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/30">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 tracking-tight">Foodie</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleCart} className="relative p-2.5 bg-white border border-stone-200 rounded-xl shadow-sm text-stone-600 hover:text-orange-500 hover:border-orange-200 transition-all">
            <ShoppingBag size={20} />
            {items.length > 0 && <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-sm">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>}
          </button>
          {user?.role === 'CUSTOMER' && (
            <div className="hidden sm:flex gap-4 items-center mr-2">
              <Link to="/my-orders" className="font-bold text-stone-600 hover:text-orange-500 transition-colors">Meus Pedidos</Link>
              <Link to="/profile" className="font-bold text-stone-600 hover:text-orange-500 transition-colors flex items-center gap-1"><UserIcon size={18}/> Perfil</Link>
            </div>
          )}
          {user?.role === 'DELIVERY' && (
            <Link to="/delivery" className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold hover:bg-orange-100 transition hidden sm:block">Acessar Entregas</Link>
          )}
          {user?.role === 'RESTAURANT' && (
            <Link to="/restaurant/new" className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold hover:bg-orange-100 transition hidden sm:block">+ Novo Restaurante</Link>
          )}
          <span className="font-bold text-stone-700 hidden sm:block bg-stone-100 px-4 py-2 rounded-xl border border-stone-200">{user?.name}</span>
          <button onClick={logout} className="p-2.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">O que vamos comer hoje?</h2>
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Buscar restaurante..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white shadow-sm border border-stone-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-orange-400" size={20} />
          </div>
        </div>

        {/* Carrossel de Categorias */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {SPECIALTIES.map(spec => (
            <button
              key={spec.id}
              onClick={() => { setSpecialty(spec.id); setPage(1); }}
              className={`flex flex-col items-center min-w-[80px] sm:min-w-[100px] p-4 rounded-3xl transition-all duration-300 ${specialty === spec.id ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 -translate-y-1' : 'bg-white text-stone-600 hover:bg-orange-50 hover:text-orange-600 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100'}`}
            >
              <span className="text-3xl mb-2">{spec.icon}</span>
              <span className="text-sm font-bold">{spec.name}</span>
            </button>
          ))}
        </div>

        {restaurants.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Nenhum restaurante encontrado.</p>
        ) : (
          <div className="space-y-14 mb-8">
            {orderedGroups.map((group) => (
              <div key={group.id}>
                <h3 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
                  <span className="bg-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100 text-2xl">{group.icon}</span> 
                  {group.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {group.restaurants.map((restaurant) => (
                    <div key={restaurant.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                      <Link to={`/restaurant/${restaurant.id}`} className="block cursor-pointer flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-stone-800 group-hover:text-orange-500 transition-colors pr-2">{restaurant.name}</h3>
                          <span className="flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-50 border border-orange-100 px-2 py-1 rounded-lg shrink-0">
                            <Star size={12} fill="currentColor" /> 
                            {restaurant.reviews && restaurant.reviews.length > 0 
                              ? (restaurant.reviews.reduce((acc, rev) => acc + rev.rating, 0) / restaurant.reviews.length).toFixed(1) 
                              : 'Novo'}
                          </span>
                        </div>
                        <p className="text-stone-500 text-sm mt-2 line-clamp-2 mb-4 leading-relaxed">{restaurant.description || 'Um lugar maravilhoso para pedir sua próxima refeição.'}</p>
                      </Link>
                      {user?.id === restaurant.ownerId && (
                        <Link to={`/dashboard/${restaurant.id}`} className="block text-center bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition mt-2">
                          Acessar Dashboard
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium text-gray-700">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}