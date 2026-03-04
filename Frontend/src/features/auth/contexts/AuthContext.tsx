import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User, LoginDTO, RegisterDTO } from '../types/auth.types';
import { requestWithColdStartRetry, isColdStartError } from '../../../services/serverWakeup';
import { useToast } from '../../../contexts/ToastContext';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [wakeUpMessage, setWakeUpMessage] = useState<string>('');
  const toast = useToast();

  useEffect(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUser() {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        const userData = await requestWithColdStartRetry(
          () => authService.getMe(),
          () => {
            setWakeUpMessage('Servidor iniciando, aguarde...');
            toast.info('Servidor iniciando, isso pode levar até 1 minuto...');
          },
          (attempt) => {
            const seconds = attempt * 5;
            setWakeUpMessage(`Aguardando servidor... ${seconds}s`);
          }
        );
        setUser(userData);

        if (wakeUpMessage) {
          toast.success('Conectado ao servidor!');
          setWakeUpMessage('');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (isColdStartError(error) || errorMessage.includes('não está respondendo')) {
        toast.error('Servidor não está respondendo. Tente novamente em alguns minutos.');
      }

      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
      setWakeUpMessage('');
    }
  }

  async function login(data: LoginDTO) {
    const response = await requestWithColdStartRetry(
      () => authService.login(data),
      () => {
        toast.info('Servidor iniciando, aguarde...');
      }
    );
    sessionStorage.setItem('accessToken', response.accessToken);
    sessionStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  }

  async function register(data: RegisterDTO) {
    const response = await requestWithColdStartRetry(
      () => authService.register(data),
      () => {
        toast.info('Servidor iniciando, aguarde...');
      }
    );
    sessionStorage.setItem('accessToken', response.accessToken);
    sessionStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  }

  async function logout() {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      setUser(null);
    }
  }

  function updateUser(updatedUser: User) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
      {wakeUpMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">{wakeUpMessage}</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
