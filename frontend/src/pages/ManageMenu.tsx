import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Utensils, Plus, Pencil, Trash2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
});

const productSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  description: z.string().optional(),
  price: z.number().positive('O preço deve ser maior que zero.'),
  categoryId: z.string().uuid('Selecione uma categoria.'),
});

type CategoryForm = z.infer<typeof categorySchema>;
type ProductForm = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

export function ManageMenu() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const { register: regCat, handleSubmit: handleCatSubmit, reset: resetCat, formState: { errors: errCat } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  const { register: regProd, handleSubmit: handleProdSubmit, reset: resetProd, formState: { errors: errProd } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/menu/${restaurantId}`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar cardápio', error);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchCategories();
  }, [restaurantId]);

  const onCategorySubmit = async (data: CategoryForm) => {
    try {
      await api.post('/menu/categories', { ...data, restaurantId });
      alert('Categoria criada com sucesso!');
      resetCat();
      fetchCategories(); // Atualiza a lista de categorias
    } catch (error) {
      alert('Erro ao criar categoria.');
    }
  };

  const onProductSubmit = async (data: ProductForm) => {
    try {
      if (editingProductId) {
        await api.patch(`/menu/products/${editingProductId}`, data);
        alert('Produto atualizado com sucesso!');
        setEditingProductId(null);
      } else {
        await api.post('/menu/products', { ...data, restaurantId });
        alert('Produto criado com sucesso!');
      }
      resetProd();
      fetchCategories();
    } catch (error) {
      alert(editingProductId ? 'Erro ao atualizar produto.' : 'Erro ao criar produto.');
    }
  };

  const handleEditProduct = (product: Product, categoryId: string) => {
    setEditingProductId(product.id);
    resetProd({
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId: categoryId,
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto do cardápio?')) return;

    try {
      await api.delete(`/menu/products/${productId}`);
      alert('Produto excluído com sucesso!');
      fetchCategories(); // Atualiza a lista tirando o produto da tela
    } catch (error: any) {
      // Se vier a mensagem que bloqueamos no Backend, a exibimos na tela
      const message = error.response?.data?.message || 'Erro ao excluir o produto.';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <Link to={`/dashboard/${restaurantId}`} className="text-stone-600 font-bold flex items-center gap-2 hover:text-orange-500 p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao Painel</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-stone-800 flex items-center gap-3"><Utensils className="text-orange-500" size={32}/> Gerenciar Cardápio</h1>
          <p className="text-stone-500 mt-2">Adicione novas categorias e pratos incríveis ao seu restaurante.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna 1: Criar Categoria */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 h-fit">
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><div className="bg-orange-100 text-orange-500 p-1.5 rounded-lg"><Plus size={20}/></div> Nova Categoria</h2>
          <form onSubmit={handleCatSubmit(onCategorySubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-stone-700 ml-1 mb-2">Nome da Categoria</label>
              <input {...regCat('name')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="Ex: Pizzas Especiais" />
              {errCat.name && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errCat.name.message}</span>}
            </div>
            <button type="submit" className="w-full bg-stone-900 text-white rounded-2xl py-4 font-bold hover:bg-stone-800 transition-colors active:scale-95">Salvar Categoria</button>
          </form>
        </div>

        {/* Coluna 2: Criar Produto */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><div className="bg-orange-100 text-orange-500 p-1.5 rounded-lg">{editingProductId ? <Pencil size={20} /> : <Plus size={20}/>}</div> {editingProductId ? 'Editar Produto' : 'Novo Produto'}</h2>
          
          {categories.length === 0 ? (
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-center"><p className="text-orange-800 font-medium">Crie pelo menos uma categoria primeiro para poder adicionar produtos.</p></div>
          ) : (
            <form onSubmit={handleProdSubmit(onProductSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 ml-1 mb-2">Selecione a Categoria</label>
                <select {...regProd('categoryId')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errProd.categoryId && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errProd.categoryId.message}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-stone-700 ml-1 mb-2">Nome do Produto</label>
                <input {...regProd('name')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="Ex: Pizza 4 Queijos" />
                {errProd.name && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errProd.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 ml-1 mb-2">Descrição Curta (Opcional)</label>
                <textarea {...regProd('description')} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none" rows={2} placeholder="Deliciosa pizza com borda recheada..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 ml-1 mb-2">Preço (R$)</label>
                <input type="number" step="0.01" {...regProd('price', { valueAsNumber: true })} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-mono" placeholder="45.90" />
                {errProd.price && <span className="text-rose-500 text-sm font-medium ml-1 mt-1 block">{errProd.price.message}</span>}
              </div>

              <div className="pt-2 flex gap-3">
                {editingProductId && (
                  <button type="button" onClick={() => { setEditingProductId(null); resetProd(); }} className="flex-1 bg-stone-100 text-stone-600 rounded-2xl py-4 font-bold text-lg hover:bg-stone-200 transition-colors active:scale-95">Cancelar</button>
                )}
                <button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all active:scale-95">
                  {editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Listagem do Cardápio Atual */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 mt-2">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2"><Utensils size={24} className="text-orange-500"/> Cardápio Atual</h2>
          {categories.length === 0 ? (
            <p className="text-stone-500">Nenhum item cadastrado ainda.</p>
          ) : (
            <div className="space-y-8">
              {categories.map(category => (
                <div key={category.id}>
                  <h3 className="text-xl font-extrabold text-stone-800 mb-4 border-b border-stone-100 pb-2">{category.name}</h3>
                  {category.products.length === 0 ? (
                    <p className="text-stone-400 text-sm">Nenhum produto nesta categoria.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {category.products.map(product => (
                        <div key={product.id} className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex justify-between items-center group hover:border-orange-200 transition-colors">
                          <div>
                            <h4 className="font-bold text-stone-800 text-lg">{product.name}</h4>
                            <p className="text-sm text-stone-500 line-clamp-1 mt-1">{product.description}</p>
                            <p className="text-orange-500 font-black mt-2">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditProduct(product, category.id)} className="p-3 text-stone-400 hover:text-orange-500 hover:bg-orange-100 rounded-xl transition-colors" title="Editar">
                              <Pencil size={20} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-3 text-stone-400 hover:text-rose-500 hover:bg-rose-100 rounded-xl transition-colors" title="Excluir">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}