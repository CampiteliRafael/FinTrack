import api from '../../../services/api';
import { Account, CreateAccountDTO, UpdateAccountDTO } from '../types/account.types';

export const accountService = {
  async getAll(): Promise<Account[]> {
    const { data } = await api.get('/accounts');
    return data;
  },

  async getById(id: string): Promise<Account> {
    const { data } = await api.get(`/accounts/${id}`);
    return data;
  },

  async create(dto: CreateAccountDTO): Promise<Account> {
    const { data } = await api.post('/accounts', dto);
    return data;
  },

  async update(id: string, dto: UpdateAccountDTO): Promise<Account> {
    const { data } = await api.patch(`/accounts/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },
};
