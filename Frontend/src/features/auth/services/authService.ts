import api from '../../../services/api';
import { LoginDTO, RegisterDTO, AuthResponse, User } from '../types/auth.types';

export const authService = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};
