import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, History, CheckCircle, MapPin, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeliveryHistoryData {
  id: string;
  orderId: string;
  deliveredAt: string;
  order: {
    restaurant: { name: string; address: string };
    customer: { name: string };
    deliveryAddress: string | null;
    totalAmount: number;
  };
}

export function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState<DeliveryHistoryData[]>([]);

  useEffect(() => {
    api.get('/deliveries/my-history').then((response) => {
      setDeliveries(response.data.data);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <Link to="/delivery" className="text-stone-600 font-bold flex items-center gap-2 hover:text-purple-600 p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao Painel</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-800">Histórico de Entregas</h1>
            <p className="text-stone-500">Acompanhe as corridas que você já finalizou.</p>
          </div>
        </div>

        {deliveries.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl border border-stone-100 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <History size={64} className="mx-auto text-stone-300 mb-4" />
            <p className="text-xl font-bold text-stone-700">Você ainda não finalizou nenhuma entrega.</p>
            <p className="text-stone-500 mt-2">Suas entregas concluídas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col justify-between group hover:border-purple-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden opacity-95 hover:opacity-100">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-stone-200 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-500 transition-all duration-500"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-extrabold text-xl text-stone-800 group-hover:text-purple-600 transition-colors">{delivery.order.restaurant.name}</h3>
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle size={14} /> Entregue
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Store size={14}/> Coletado em</p>
                    <p className="font-medium text-stone-700">{delivery.order.restaurant.address}</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin size={14}/> Entregue para {delivery.order.customer.name}</p>
                    <p className="font-medium text-stone-700">{delivery.order.deliveryAddress || 'Endereço não informado'}</p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 mt-auto">
                  <p className="text-sm text-stone-500 font-medium">Finalizada em: <span className="text-stone-800 font-bold">{new Date(delivery.deliveredAt).toLocaleString('pt-BR')}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}