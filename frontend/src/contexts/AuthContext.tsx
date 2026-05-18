import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'RESTAURANT' | 'DELIVERY' | 'ADMIN';
  address?: string | null;
  phone?: string | null;
}

interface AuthContextData {
  user: User | null;
  login: (credentials: unknown) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Recupera o usuário salvo ao recarregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('@DeliveryApp:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: unknown) => {
    const response = await api.post('/users/login', credentials);
    const { user, token } = response.data.data;

    // Salva no LocalStorage
    localStorage.setItem('@DeliveryApp:user', JSON.stringify(user));
    localStorage.setItem('@DeliveryApp:token', token);

    setUser(user);
    navigate('/'); // Redireciona para a Home após o login
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('@DeliveryApp:user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('@DeliveryApp:user');
    localStorage.removeItem('@DeliveryApp:token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso
export const useAuth = () => useContext(AuthContext);