import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Truck, CheckCircle, MapPin, Package, Store, Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatModal } from '../components/ChatModal';

interface Delivery {
  id: string;
  orderId: string;
  pickedUpAt: string | null;
  order: {
    restaurant: { name: string; address: string };
    customer: { name: string };
    deliveryAddress: string | null;
    status: string;
  };
}

interface AvailableDelivery {
  id: string;
  restaurant: { name: string; address: string };
  customer: { name: string };
  totalAmount: number;
  deliveryAddress: string | null;
}

export function DeliveryPanel() {
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<AvailableDelivery[]>([]);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries/my-deliveries');
      setMyDeliveries(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar entregas:', error);
    }
  };

  const fetchAvailable = async () => {
    try {
      const response = await api.get('/deliveries/available');
      setAvailableDeliveries(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar corridas disponíveis:', error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchAvailable();
  }, []);

  const handleAccept = async (selectedOrderId: string) => {
    try {
      await api.post(`/deliveries/${selectedOrderId}/accept`);
      alert('🎉 Corrida aceita com sucesso! O cliente acabou de ser notificado em tempo real.');
      fetchDeliveries(); // Atualiza a lista
      fetchAvailable();  // Remove a corrida aceita do mural
    } catch (error) {
      console.error(error);
      alert('Erro ao aceitar corrida. Verifique se o ID está correto ou se o pedido já foi aceito.');
    }
  };

  const handlePickup = async (id: string) => {
    try {
      await api.patch(`/deliveries/${id}/pickup`);
      alert('Pacote retirado com sucesso! Siga para o endereço do cliente.');
      fetchDeliveries(); // Atualiza a tela
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao informar retirada.');
    }
  };

  const handleDeliver = async (id: string) => {
    const code = window.prompt('Confirme a entrega: Digite o PIN de 4 dígitos informado pelo cliente:');
    if (!code) return; // Se cancelar o prompt, não faz nada

    try {
      await api.patch(`/deliveries/${id}/deliver`, { verificationCode: code });
      alert('Entrega finalizada! Excelente trabalho.');
      fetchDeliveries(); // Atualiza a lista para remover a entrega concluída
    } catch (error) {
      alert('Erro ao finalizar: Verifique se o código está correto.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="text-stone-600 font-bold flex items-center gap-2 hover:text-purple-600 p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao início</span>
        </Link>
        <Link to="/delivery/history" className="bg-stone-100 text-stone-600 border border-stone-200 px-5 py-2.5 rounded-xl font-bold hover:bg-stone-200 hover:text-stone-800 transition-colors text-sm flex items-center gap-2">
          Histórico de Entregas
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Truck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-800">Painel de Entregas</h1>
            <p className="text-stone-500">Gerencie suas corridas e acompanhe novos chamados</p>
          </div>
        </div>

        {/* Mural de Corridas Disponíveis */}
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3"><MapPin className="text-purple-500" size={28}/> Mural de Corridas</h2>
        {availableDeliveries.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl border border-stone-100 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Package size={64} className="mx-auto text-stone-300 mb-4" />
            <p className="text-xl font-bold text-stone-700">Nenhuma corrida disponível no momento.</p>
            <p className="text-stone-500 mt-2">Aguarde novos chamados chegarem na sua região.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {availableDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-purple-200 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-80"></div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-extrabold text-xl text-stone-800 group-hover:text-purple-600 transition-colors">{delivery.restaurant.name}</h3>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">Disponível</span>
                  </div>
                  
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-4">
                    <div className="flex items-start gap-3">
                      <Store size={18} className="text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-0.5">Coletar em</p>
                        <p className="text-sm font-medium text-stone-700">{delivery.restaurant.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-0.5">Entregar para {delivery.customer.name}</p>
                        <p className="text-sm font-medium text-stone-800">{delivery.deliveryAddress || 'Endereço não informado'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                  <div>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-0.5">Valor do Pedido</p>
                    <p className="text-2xl font-black text-stone-800">R$ {delivery.totalAmount.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <button onClick={() => handleAccept(delivery.id)} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-2xl hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 text-lg">
                    Aceitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de Entregas Ativas */}
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3"><Truck className="text-orange-500" size={28}/> Entregas em Andamento</h2>
        {myDeliveries.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl border border-stone-100 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-xl font-bold text-stone-700">Você não tem entregas ativas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1.5 opacity-80 ${!delivery.pickedUpAt ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}></div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-extrabold text-xl text-stone-800">{delivery.order.restaurant.name}</h3>
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      delivery.pickedUpAt ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      delivery.order.status === 'READY_FOR_PICKUP' ? 'bg-sky-50 text-sky-600 border-sky-200' : 
                      'bg-orange-50 text-orange-600 border-orange-200'
                    }`}>
                      {delivery.pickedUpAt ? 'A Caminho' : delivery.order.status === 'READY_FOR_PICKUP' ? 'Pronto p/ Retirar' : 'Cozinhando'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${!delivery.pickedUpAt ? 'bg-sky-50/50 border-sky-100' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-stone-500"><Store size={14} /> Coletar no Restaurante</p>
                      <p className="font-medium text-stone-800">{delivery.order.restaurant.address}</p>
                    </div>
                    
                    <div className={`p-4 rounded-2xl border ${delivery.pickedUpAt ? 'bg-emerald-50/50 border-emerald-100' : 'bg-stone-50 border-stone-100'}`}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-stone-500"><MapPin size={14} /> Entregar para {delivery.order.customer.name}</p>
                      <p className="font-bold text-stone-800">{delivery.order.deliveryAddress || 'Endereço não informado'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {!delivery.pickedUpAt ? (
                    delivery.order.status === 'READY_FOR_PICKUP' ? (
                      <button onClick={() => handlePickup(delivery.orderId)} className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                        <Package size={20} /> Informar Retirada
                      </button>
                    ) : (
                      <button disabled className="w-full bg-stone-200 text-stone-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-lg cursor-not-allowed border border-stone-300">
                        <Clock size={20} /> Aguardando Cozinha
                      </button>
                    )
                  ) : (
                    <button onClick={() => handleDeliver(delivery.orderId)} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                      <CheckCircle size={20} /> Marcar como Entregue
                    </button>
                  )}
                </div>

                <button onClick={() => setActiveChatOrderId(delivery.orderId)} className="w-full mt-3 bg-stone-100 text-stone-600 font-bold py-3 rounded-2xl flex justify-center items-center gap-2 hover:bg-stone-200 transition-colors">
                  <MessageSquare size={18} /> Chat do Pedido
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {activeChatOrderId && <ChatModal isOpen={true} onClose={() => setActiveChatOrderId(null)} orderId={activeChatOrderId} />}
    </div>
  );
}