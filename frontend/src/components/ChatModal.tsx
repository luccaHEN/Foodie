import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { X, Send, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  role: string;
  createdAt: string;
  sender: { name: string };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function ChatModal({ isOpen, onClose, orderId }: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    // Busca o histórico do chat
    api.get(`/orders/${orderId}/chat`).then((res) => setMessages(res.data.data));

    // Conexão com o WebSocket do Spring Boot (Java)
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-delivery'),
      onConnect: () => {
        client.subscribe(`/topic/orders/${orderId}/chat`, (message) => {
          const newChatMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newChatMessage]);
        });
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [isOpen, orderId]);

  // Rola o chat para baixo sempre que uma nova mensagem chegar
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/orders/${orderId}/chat`, { content: newMessage });
      setNewMessage('');
    } catch (error) {
      alert('Erro ao enviar mensagem.');
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[600px] max-h-[90vh]">
        <div className="bg-stone-900 p-5 flex justify-between items-center text-white shadow-md z-10">
          <h3 className="font-extrabold flex items-center gap-3"><MessageSquare size={22} className="text-orange-500" /> Chat do Pedido</h3>
          <button onClick={onClose} className="p-2 bg-stone-800 hover:bg-rose-500 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50">
          {messages.length === 0 ? (
            <p className="text-center text-stone-400 mt-20 font-medium">Inicie a conversa!</p>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1 ml-1">{msg.sender.name} ({msg.role})</span>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm ${isMe ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-br-sm' : 'bg-white border border-stone-200 text-stone-700 rounded-bl-sm'}`}>{msg.content}</div>
                  <span className="text-[10px] text-stone-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-100 flex gap-3 shadow-[0_-10px_40px_rgb(0,0,0,0.03)]">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all" />
          <button type="submit" className="bg-orange-500 text-white p-4 rounded-2xl hover:bg-orange-600 transition-colors active:scale-95 shadow-md shadow-orange-500/20"><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
}