import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, History } from 'lucide-react';

interface OrderHistory {
  id: string;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  customer: { name: string };
  items: { product: { name: string }; quantity: number }[];
}

export function RestaurantHistory() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [orders, setOrders] = useState<OrderHistory[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await api.get(`/orders/restaurant/${restaurantId}/history`);
        setOrders(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    }
    if (restaurantId) fetchHistory();
  }, [restaurantId]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      RECEIVED: 'Recebido',
      PREPARING: 'Preparando',
      ON_THE_WAY: 'A Caminho',
      DELIVERED: 'Finalizado'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <Link to={`/dashboard/${restaurantId}`} className="text-stone-600 font-bold flex items-center gap-2 hover:text-orange-500 p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao Painel</span>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-stone-800 flex items-center gap-3"><History className="text-orange-500" size={32}/> Histórico de Pedidos</h1>
          <p className="text-stone-500 mt-2">Acompanhe todos os pedidos já finalizados no seu restaurante.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 border-b border-stone-100 text-xs uppercase tracking-wider">
                  <th className="p-5 font-bold">Data</th>
                  <th className="p-5 font-bold">Cliente</th>
                  <th className="p-5 font-bold">Método</th>
                  <th className="p-5 font-bold">Total</th>
                  <th className="p-5 font-bold">Itens</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-stone-500 font-medium">Nenhum pedido encontrado no histórico.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                      <td className="p-5 text-sm text-stone-600 font-medium">{new Date(order.createdAt).toLocaleString('pt-BR')}</td>
                      <td className="p-5 font-bold text-stone-900">{order.customer?.name || 'Anônimo'}</td>
                      <td className="p-5 text-sm"><span className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border ${order.deliveryMethod === 'PICKUP' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>{order.deliveryMethod === 'PICKUP' ? 'Retirada' : 'Delivery'}</span></td>
                      <td className="p-5 font-black text-stone-900">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</td>
                      <td className="p-5 text-sm text-stone-500 leading-relaxed max-w-xs">{order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}