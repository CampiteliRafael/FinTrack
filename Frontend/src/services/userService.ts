import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  updatePassword: async (data: UpdatePasswordData): Promise<void> => {
    await api.patch('/users/me/password', data);
  },
};
