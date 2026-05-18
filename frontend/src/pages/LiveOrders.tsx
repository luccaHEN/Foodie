import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ArrowLeft, ChefHat, Clock, Play, CheckCircle, MessageSquare } from 'lucide-react';
import { ChatModal } from '../components/ChatModal';

interface LiveOrder {
  id: string;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  customer: { name: string };
  items: {
    id: string;
    quantity: number;
    product: { name: string };
  }[];
}

export function LiveOrders() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Busca a fila inicial de pedidos
    async function fetchLiveOrders() {
      try {
        const response = await api.get(`/orders/restaurant/${restaurantId}/live`);
        setOrders(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos ao vivo:', error);
      }
    }
    if (restaurantId) fetchLiveOrders();
  }, [restaurantId]);

  useEffect(() => {
    // 2. Conecta no WebSockets para receber pedidos em TEMPO REAL!
    if (!restaurantId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-delivery'),
      onConnect: () => {
        client.subscribe(`/topic/restaurants/${restaurantId}`, (message) => {
          const newOrder = JSON.parse(message.body);
          setOrders((prev) => [...prev, newOrder]);
        });
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [restaurantId]);

  const handlePrepareOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'PREPARING' });
      
      // Atualiza a tela imediatamente
      setOrders((prev) => prev.map(order => 
        order.id === orderId ? { ...order, status: 'PREPARING' } : order
      ));
    } catch (error) {
      alert('Erro ao atualizar o status do pedido.');
      console.error(error);
    }
  };

  const handleReadyForPickup = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'READY_FOR_PICKUP' });
      setOrders((prev) => prev.map(order => order.id === orderId ? { ...order, status: 'READY_FOR_PICKUP' } : order));
    } catch (error) {
      alert('Erro ao atualizar o status do pedido.');
      console.error(error);
    }
  };

  const handleFinishPickup = async (orderId: string) => {
    const code = window.prompt('Confirme a retirada: Digite o PIN de 4 dígitos informado pelo cliente:');
    if (!code) return;

    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'DELIVERED', verificationCode: code });
      
      // Remove da fila ao vivo (pois já foi entregue)
      setOrders((prev) => prev.filter(order => order.id !== orderId));
      alert('Pedido entregue ao cliente e finalizado com sucesso!');
    } catch (error) {
      alert('Erro ao finalizar: Código incorreto ou falha de conexão.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 pb-20">
      {/* Header escuro para modo de operação na cozinha */}
      <header className="bg-stone-900/95 backdrop-blur-lg border-b border-stone-800 p-4 sticky top-0 z-40 flex justify-between items-center shadow-md">
        <Link to={`/dashboard/${restaurantId}`} className="text-stone-400 font-bold flex items-center gap-2 hover:text-white p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao Dashboard</span>
        </Link>
        <h1 className="text-xl font-black text-white flex items-center gap-3"><ChefHat className="text-orange-500"/> Tela da Cozinha <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span></h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-4">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Pedidos em Tempo Real</h2>
            <p className="text-stone-400 mt-2">Gerencie o fluxo da sua cozinha de forma eficiente.</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-inner">
             <span className="text-stone-400 font-bold text-sm uppercase tracking-wider">Sistema:</span>
             <span className="text-emerald-400 font-black flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span> RECEBENDO PEDIDOS</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center text-stone-500 mt-32 flex flex-col items-center bg-stone-800/50 p-12 rounded-[2rem] border border-stone-800 max-w-lg mx-auto">
            <Clock size={64} className="mb-6 text-stone-700" />
            <p className="text-2xl font-bold text-stone-300 mb-2">A fila está vazia</p>
            <p>Nenhum pedido pendente no momento. Aguardando novos clientes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-stone-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-stone-700/50 flex flex-col justify-between relative overflow-hidden hover:border-stone-600 transition-colors group">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${order.status === 'RECEIVED' ? 'bg-gradient-to-r from-orange-500 to-rose-500' : order.status === 'PREPARING' ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`}></div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{order.customer?.name || 'Anônimo'}</h2>
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                      order.status === 'RECEIVED' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                      order.status === 'PREPARING' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 
                      order.status === 'READY_FOR_PICKUP' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                      'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {order.status === 'RECEIVED' ? 'Novo' : order.status === 'PREPARING' ? 'Preparando' : order.status === 'READY_FOR_PICKUP' ? 'Pronto (Aguardando)' : 'Com o Motoboy'}
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${order.deliveryMethod === 'PICKUP' ? 'bg-white/10 text-stone-300' : 'bg-white/10 text-stone-300'}`}>
                      {order.deliveryMethod === 'PICKUP' ? '🚶‍♂️ RETIRADA NO LOCAL' : '🛵 DELIVERY'}
                    </span>
                    <span className="text-stone-400 text-xs font-bold ml-3">{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="bg-stone-900/50 rounded-2xl p-5 mb-8 border border-stone-700/50">
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-4 border-b border-stone-700/50 pb-2">Itens do Pedido</p>
                    <ul className="space-y-3">
                    {order.items.map((item) => (
                        <li key={item.id} className="flex text-stone-300 font-medium items-start gap-3">
                          <span className="bg-stone-800 text-orange-400 px-2 py-1 rounded-md text-xs font-black min-w-[2rem] text-center border border-stone-700">{item.quantity}x</span> 
                          <span className="mt-0.5">{item.product?.name || 'Produto'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto">
                  {order.status === 'RECEIVED' && (
                    <button onClick={() => handlePrepareOrder(order.id)} className="w-full bg-white text-stone-900 font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-stone-200 transition-colors active:scale-95 text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      <Play size={18} className="text-orange-500" /> Começar a Preparar
                    </button>
                  )}
                  
                  {/* Botão de Pronto para Retirada (Serve tanto para motoboy quanto balcão) */}
                  {order.status === 'PREPARING' && (
                    <button onClick={() => handleReadyForPickup(order.id)} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:from-indigo-400 hover:to-purple-500 transition-all active:scale-95 text-lg shadow-lg shadow-indigo-500/25 border border-indigo-400/50">
                      <CheckCircle size={20} /> Pronto para Retirada
                    </button>
                  )}

                  {/* Somente para Pickup direto com cliente no balcão */}
                  {order.status === 'READY_FOR_PICKUP' && order.deliveryMethod === 'PICKUP' && (
                    <button onClick={() => handleFinishPickup(order.id)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95 text-lg shadow-lg shadow-emerald-500/25 border border-emerald-400/50">
                      <CheckCircle size={20} /> Entregar ao Cliente
                    </button>
                  )}
                </div>

                <button onClick={() => setActiveChatOrderId(order.id)} className="w-full mt-3 bg-stone-800 text-stone-300 font-bold py-3 rounded-2xl flex justify-center items-center gap-2 hover:bg-stone-700 transition-colors border border-stone-700/80">
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