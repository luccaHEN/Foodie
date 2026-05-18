import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, TrendingUp, Package, Clock, BellRing, Utensils, History, LayoutDashboard } from 'lucide-react';

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    status: string;
    _count: { id: number };
  }[];
}

export function Dashboard() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await api.get(`/dashboard/${restaurantId}`);
        setMetrics(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        alert('Erro ao carregar o dashboard. Você é o dono deste restaurante?');
      }
    }
    if (restaurantId) fetchMetrics();
  }, [restaurantId]);

  if (!metrics) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500 font-medium">Carregando painel...</div>;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'Recebido';
      case 'PREPARING': return 'Preparando';
      case 'ON_THE_WAY': return 'A Caminho';
      case 'DELIVERED': return 'Entregue';
      default: return status;
    }
  };

  // Soma todos os pedidos que ainda não foram finalizados (ativos na cozinha ou com motoboy)
  const activeOrdersCount = metrics.ordersByStatus
    .filter((s) => s.status !== 'DELIVERED')
    .reduce((total, s) => total + s._count.id, 0);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100 p-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="text-stone-600 font-bold flex items-center gap-2 hover:text-orange-500 p-2 rounded-xl transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao início</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-800">Dashboard</h1>
            <p className="text-stone-500">Visão geral e atalhos rápidos do seu restaurante</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link to={`/restaurant/${restaurantId}/live`} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white p-6 rounded-3xl shadow-lg shadow-orange-500/20 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform group">
            <div className="relative">
              <BellRing size={32} className="group-hover:animate-bounce" /> 
              {activeOrdersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-rose-600 text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-lg font-black tracking-wide">Fila de Pedidos Ao Vivo</span>
          </Link>
          <div className="flex flex-col gap-4">
            <Link to={`/restaurant/${restaurantId}/menu`} className="w-full bg-stone-900 text-white p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-stone-800 hover:-translate-y-0.5 transition-all">
              <div className="bg-white/10 p-3 rounded-xl"><Utensils size={24} /></div>
              <span className="text-lg font-bold">Gerenciar Cardápio</span>
            </Link>
            <Link to={`/restaurant/${restaurantId}/history`} className="w-full bg-white text-stone-800 border border-stone-200 p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-4 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="bg-stone-50 p-3 rounded-xl group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors"><History size={24} /></div>
              <span className="text-lg font-bold">Histórico de Pedidos</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Card Faturamento */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-6">
            <div className="p-5 bg-emerald-50 text-emerald-500 rounded-2xl"><TrendingUp size={36} /></div>
            <div>
              <p className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Faturamento Total</p>
              <p className="text-4xl font-black text-stone-800">R$ {metrics.totalRevenue.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>

          {/* Card Pedidos */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-6">
            <div className="p-5 bg-sky-50 text-sky-500 rounded-2xl"><Package size={36} /></div>
            <div>
              <p className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Total de Pedidos</p>
              <p className="text-4xl font-black text-stone-800">{metrics.totalOrders}</p>
            </div>
          </div>
        </div>

        {/* Pedidos por Status */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 p-8">
          <h2 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3"><Clock size={28} className="text-orange-500" /> Pedidos por Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {metrics.ordersByStatus.map((statusItem) => (
              <div key={statusItem.status} className="bg-stone-50 p-6 rounded-2xl text-center border border-stone-100 hover:border-orange-100 hover:bg-orange-50/30 transition-colors">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wide mb-2">{getStatusLabel(statusItem.status)}</p>
                <p className="text-3xl font-black text-stone-800">{statusItem._count.id}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}