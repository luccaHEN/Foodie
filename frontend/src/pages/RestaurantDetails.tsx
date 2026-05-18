import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

export function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const { items, addItem, toggleCart } = useCartStore();

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await api.get(`/menu/${id}`);
        setCategories(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar cardápio:', error);
      }
    }
    if (id) fetchMenu();
  }, [id]);


  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="text-stone-600 font-bold flex items-center gap-2 hover:text-orange-500 p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao início</span>
        </Link>
        <button onClick={toggleCart} className="relative p-2.5 bg-white border border-stone-200 rounded-xl shadow-sm text-stone-600 hover:text-orange-500 hover:border-orange-200 transition-all">
          <ShoppingBag size={20} />
          {items.length > 0 && <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-sm">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {categories.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-3xl border border-stone-100 mt-10"><p className="text-stone-500 font-medium">Este restaurante ainda não adicionou itens ao cardápio.</p></div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="mb-12">
              <h2 className="text-3xl font-extrabold text-stone-800 mb-6 flex items-center gap-3"><span className="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.products.map((product) => (
                  <div key={product.id} className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-stone-100 flex justify-between items-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-orange-100 transition-all duration-300 group">
                    <div className="pr-4">
                      <h3 className="font-extrabold text-lg text-stone-800 group-hover:text-orange-500 transition-colors">{product.name}</h3>
                      <p className="text-sm text-stone-500 mt-2 leading-relaxed">{product.description}</p>
                      <p className="text-orange-500 font-black mt-3 text-lg">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <button
                      onClick={() => addItem(product, id!)}
                      className="bg-orange-50 text-orange-500 h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-bold text-xl hover:bg-orange-500 hover:text-white transition-colors active:scale-90"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}