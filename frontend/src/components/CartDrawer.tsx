import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ShoppingBag, X, CreditCard, Banknote, QrCode, Trash2, Plus, Minus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { items, isCartOpen, toggleCart, clearCart, getTotal, addItem, removeItem } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [useDefaultAddress, setUseDefaultAddress] = useState(!!user?.address);
  const [customAddress, setCustomAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'CASH'>('PIX');

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para fazer um pedido!');
      toggleCart();
      navigate('/login');
      return;
    }

    const finalAddress = useDefaultAddress && user?.address ? user.address : customAddress;
    if (deliveryMethod === 'DELIVERY' && !finalAddress.trim()) {
      return alert('Por favor, informe o endereço de entrega.');
    }

    try {
      // MÁGICA: Agrupa os itens da sacola por Restaurante
      const itemsByRestaurant = items.reduce((acc, item) => {
        if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
        acc[item.restaurantId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Dispara as requisições em paralelo para o backend!
      const orderPromises = Object.entries(itemsByRestaurant).map(([restId, restItems]) => {
        const orderData = {
          restaurantId: restId,
          items: restItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
          deliveryMethod,
          deliveryAddress: deliveryMethod === 'DELIVERY' ? finalAddress : undefined,
          // Aqui em um cenário real enviaríamos também o paymentMethod!
        };
        return api.post('/orders', orderData);
      });

      await Promise.all(orderPromises);
      
      alert(`Pedido realizado com sucesso via ${paymentMethod === 'PIX' ? 'PIX' : paymentMethod === 'CASH' ? 'Dinheiro' : 'Cartão de Crédito'}! Acompanhe no seu histórico.`);
      clearCart();
    } catch (error) {
      console.error(error);
      alert('Erro ao realizar o pedido. Tente novamente.');
    }
  };

  return (
    <>
      {/* Overlay Escuro / Blur */}
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={toggleCart} />
      
      {/* Sidebar Lateral */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-stone-50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-white/80 backdrop-blur-md">
          <h2 className="text-2xl font-black text-stone-800 flex items-center gap-3">
            <div className="bg-orange-100 text-orange-500 p-2 rounded-xl"><ShoppingBag size={24}/></div> 
            Sua Sacola
          </h2>
          <button onClick={toggleCart} className="p-2 bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-stone-100 text-stone-400 hover:text-rose-500 transition-colors active:scale-95">
            <X size={20}/>
          </button>
        </div>

        {/* Corpo: Lista e Opções */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-stone-400 mt-20 flex flex-col items-center gap-4">
              <ShoppingBag size={64} className="opacity-20" />
              <p className="font-medium text-lg">Sua sacola está vazia</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-stone-800 line-clamp-1">{item.name}</p>
                      <p className="text-orange-500 font-black mt-1">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 p-1.5 rounded-xl border border-stone-100">
                      <button onClick={() => removeItem(item.productId)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-stone-500 hover:text-rose-500 shadow-sm transition-colors">
                        {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                      </button>
                      <span className="font-bold text-stone-700 min-w-[1rem] text-center">{item.quantity}</span>
                      <button onClick={() => addItem({ id: item.productId, name: item.name, price: item.price }, item.restaurantId)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-stone-500 hover:text-orange-500 shadow-sm transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Opções de Entrega */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100 space-y-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2"><MapPin size={18} className="text-orange-500"/> Retirada ou Delivery?</h3>
                <div className="flex bg-stone-100 p-1 rounded-xl">
                  <button onClick={() => setDeliveryMethod('DELIVERY')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'DELIVERY' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Delivery</button>
                  <button onClick={() => setDeliveryMethod('PICKUP')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'PICKUP' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Retirada</button>
                </div>
                {deliveryMethod === 'DELIVERY' && (
                  <div className="space-y-3 pt-2">
                    {user?.address && (
                      <select value={useDefaultAddress ? 'default' : 'custom'} onChange={(e) => setUseDefaultAddress(e.target.value === 'default')} className="w-full p-3 bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-sm font-bold outline-none focus:border-orange-500 transition-all appearance-none">
                        <option value="default">Padrão: {user.address}</option>
                        <option value="custom">Outro endereço...</option>
                      </select>
                    )}
                    {(!useDefaultAddress || !user?.address) && (
                      <input type="text" placeholder="Rua, Número, Bairro..." value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-sm outline-none focus:border-orange-500 focus:bg-white transition-all placeholder-stone-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Opções de Pagamento */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100 space-y-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2"><CreditCard size={18} className="text-orange-500"/> Forma de Pagamento</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setPaymentMethod('PIX')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'PIX' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200'}`}><QrCode size={24} className="mb-2"/><span className="text-xs font-bold">PIX</span></button>
                  <button onClick={() => setPaymentMethod('CREDIT_CARD')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200'}`}><CreditCard size={24} className="mb-2"/><span className="text-xs font-bold">Cartão</span></button>
                  <button onClick={() => setPaymentMethod('CASH')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200'}`}><Banknote size={24} className="mb-2"/><span className="text-xs font-bold">Dinheiro</span></button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rodapé (Checkout) */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-stone-100 shadow-[0_-10px_40px_rgb(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-stone-500 font-bold uppercase tracking-wider text-sm">Total a Pagar</span>
              <span className="text-3xl font-black text-stone-800">R$ {getTotal().toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={clearCart} className="p-4 bg-stone-100 text-stone-500 rounded-2xl font-bold hover:bg-rose-100 hover:text-rose-600 transition-colors active:scale-95"><Trash2 size={24} /></button>
              <button onClick={handleCheckout} className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all active:scale-95">Confirmar Pedido</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}