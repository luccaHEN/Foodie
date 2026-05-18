import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ArrowLeft, Clock, Package, Truck, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatModal } from '../components/ChatModal';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
  verificationCode: string;
  createdAt: string;
  restaurant: { name: string };
  items: { id: string; quantity: number }[];
}

export function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);

  // 1. Busca os pedidos na API ao abrir a tela
  useEffect(() => {
    api.get('/orders/my-orders').then((response) => {
      setOrders(response.data.data);
    });
  }, []);

  // 2. Conecta no Socket.IO e escuta as atualizações
  useEffect(() => {
    if (orders.length === 0) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-delivery'),
      onConnect: () => {
        // Entra no "tópico" de cada pedido que ainda não foi entregue
        orders.forEach(order => {
          if (order.status !== 'DELIVERED') {
            client.subscribe(`/topic/orders/${order.id}`, (message) => {
              const data = JSON.parse(message.body);
              setOrders(prevOrders => prevOrders.map(o => 
                o.id === data.orderId ? { ...o, status: data.status } : o
              ));
            });
          }
        });
      }
    });

    client.activate();

    // Desconecta o websocket quando o usuário sair da página
    return () => {
      client.deactivate();
    };
  }, [orders.length]);

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'RECEIVED': return <span className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"><Clock size={14} /> Recebido</span>;
      case 'PREPARING': return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"><Package size={14} /> Preparando</span>;
      case 'READY_FOR_PICKUP': return <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"><Package size={14} /> Aguardando Entregador</span>;
      case 'ON_THE_WAY': return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"><Truck size={14} /> A caminho</span>;
      case 'DELIVERED': return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"><CheckCircle size={14} /> Entregue</span>;
      default: return <span className="text-xs font-black uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <Link to="/" className="text-stone-600 font-bold flex items-center gap-2 hover:text-orange-500 p-2 rounded-xl transition-colors">
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao início</span>
          </Link>
        </div>
        <Link to="/my-history" className="bg-stone-100 text-stone-600 border border-stone-200 px-5 py-2.5 rounded-xl font-bold hover:bg-stone-200 hover:text-stone-800 transition-colors text-sm flex items-center gap-2">
          Histórico de Pedidos
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-stone-800 flex items-center gap-3"><Clock className="text-orange-500" size={32}/> Pedidos em Andamento</h1>
          <p className="text-stone-500 mt-2">Acompanhe o status das suas deliciosas refeições em tempo real.</p>
        </div>

        <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl border border-stone-100 mt-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Package size={64} className="mx-auto text-stone-300 mb-4" />
            <p className="text-xl font-bold text-stone-700">Você não tem pedidos ativos.</p>
            <p className="text-stone-500 mt-2">Que tal dar uma olhada nos restaurantes?</p>
            <Link to="/" className="inline-block mt-6 bg-orange-50 text-orange-500 font-bold px-6 py-3 rounded-xl hover:bg-orange-100 transition-colors">Ver Restaurantes</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col sm:flex-row justify-between gap-6 relative overflow-hidden group hover:border-orange-100 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-rose-500 opacity-80"></div>
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-stone-800 mb-3 group-hover:text-orange-500 transition-colors">{order.restaurant.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${order.deliveryMethod === 'PICKUP' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                    {order.deliveryMethod === 'PICKUP' ? '🚶‍♂️ Retirada no Local' : '🛵 Delivery'}
                  </span>
                  {getStatusDisplay(order.status)}
                </div>
                <div className="bg-stone-50 rounded-2xl p-4 mb-4 border border-stone-100 w-fit">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">Código de Confirmação</p>
                  <p className="text-3xl font-black text-rose-500 tracking-[0.2em]">{order.verificationCode}</p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500 font-medium">
                  <p>Data: <span className="text-stone-700">{new Date(order.createdAt).toLocaleString('pt-BR')}</span></p>
                  <p>ID: <span className="font-mono text-xs bg-stone-100 px-2 py-1 rounded-md text-stone-700">{order.id.split('-')[0]}...</span></p>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-stone-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                <div className="w-full text-left sm:text-right mb-4 sm:mb-0">
                  <p className="text-sm text-stone-500 font-bold uppercase tracking-wider mb-1">Resumo do Pedido</p>
                  <p className="text-stone-700 font-bold bg-stone-50 px-3 py-1.5 rounded-lg inline-block">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-stone-500 font-bold uppercase tracking-wider mb-1">Total Pago</p>
                  <p className="text-4xl font-black text-stone-800">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              
              <button onClick={() => setActiveChatOrderId(order.id)} className="w-full mt-4 bg-stone-100 text-stone-700 font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-stone-200 transition-colors">
                <MessageSquare size={18} /> Abrir Chat do Pedido
              </button>
            </div>
          ))
        )}
        </div>
      </main>

      {activeChatOrderId && <ChatModal isOpen={true} onClose={() => setActiveChatOrderId(null)} orderId={activeChatOrderId} />}
    </div>
  );
}