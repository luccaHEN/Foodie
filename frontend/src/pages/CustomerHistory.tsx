import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, History, CheckCircle, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  restaurant: { name: string };
  items: { id: string; quantity: number; product?: { name: string } }[];
  review?: { rating: number } | null;
}

export function CustomerHistory() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/orders/my-history').then((response) => {
      setOrders(response.data.data);
    });
  }, []);

  const submitReview = async (orderId: string, rating: number) => {
    try {
      await api.post(`/orders/${orderId}/review`, { rating });
      alert('Avaliação enviada com sucesso! Muito obrigado.');
      setOrders(orders.map(o => o.id === orderId ? { ...o, review: { rating } } : o));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao enviar avaliação.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <Link to="/my-orders" className="text-stone-600 font-bold flex items-center gap-2 hover:text-orange-500 p-2 rounded-xl transition-colors">
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar para Pedidos Ativos</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-stone-800 flex items-center gap-3"><History className="text-orange-500" size={32}/> Meu Histórico</h1>
          <p className="text-stone-500 mt-2">Relembre todos os pratos deliciosos que você já pediu conosco.</p>
        </div>

        <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl border border-stone-100 mt-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <ShoppingBag size={64} className="mx-auto text-stone-300 mb-4" />
            <p className="text-xl font-bold text-stone-700">Você não possui pedidos finalizados.</p>
            <p className="text-stone-500 mt-2">Os seus pedidos entregues aparecerão aqui.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col sm:flex-row justify-between gap-6 relative overflow-hidden group transition-all opacity-95 hover:opacity-100 hover:border-orange-100">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-stone-300 group-hover:bg-stone-400 transition-colors"></div>
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-stone-800 mb-3 group-hover:text-orange-500 transition-colors">{order.restaurant.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${order.deliveryMethod === 'PICKUP' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                    {order.deliveryMethod === 'PICKUP' ? '🚶‍♂️ Retirada no Local' : '🛵 Delivery'}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"><CheckCircle size={14} /> Finalizado</span>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500 font-medium mb-4">
                  <p>Data: <span className="text-stone-700">{new Date(order.createdAt).toLocaleString('pt-BR')}</span></p>
                  <p>ID: <span className="font-mono text-xs bg-stone-100 px-2 py-1 rounded-md text-stone-700">{order.id.split('-')[0]}...</span></p>
                </div>

                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">Itens do Pedido</p>
                  <p className="text-sm text-stone-700 font-medium leading-relaxed">{order.items.map(i => `${i.quantity}x ${i.product?.name || 'Produto'}`).join(', ')}</p>
                </div>

                {!order.review ? (
                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-4">
                    <p className="text-sm font-bold text-stone-600 uppercase tracking-wider">Avalie este pedido:</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => submitReview(order.id, star)} className="text-stone-300 hover:text-orange-400 hover:scale-110 transition-all active:scale-90">
                          <Star fill="currentColor" size={24} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
                    <p className="text-sm font-bold text-stone-600 uppercase tracking-wider">Sua nota:</p>
                    <div className="flex gap-1 text-orange-400">
                      {Array.from({ length: order.review.rating }).map((_, i) => <Star key={i} fill="currentColor" size={20} />)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-stone-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                <div className="w-full text-left sm:text-right mb-4 sm:mb-0">
                  <p className="text-sm text-stone-500 font-bold uppercase tracking-wider mb-1">Resumo</p>
                  <p className="text-stone-700 font-bold bg-stone-50 px-3 py-1.5 rounded-lg inline-block">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-stone-500 font-bold uppercase tracking-wider mb-1">Total Pago</p>
                  <p className="text-4xl font-black text-stone-800">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </main>
    </div>
  );
}