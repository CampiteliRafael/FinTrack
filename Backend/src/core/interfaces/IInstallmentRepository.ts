import { Installment } from '../entities/Installment';

export interface InstallmentFilters {
  accountId?: string;
  categoryId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}

export type CreateInstallmentData = {
  userId: string;
  transactionId: string | null;
  description: string;
  totalAmount: number;
  installments: number;
  currentInstallment: number;
  accountId: string;
  categoryId: string;
  startDate: Date;
};

export interface IInstallmentRepository {
  findById(id: string, userId: string): Promise<Installment | null>;
  findAll(userId: string, filters: InstallmentFilters): Promise<{ installments: Installment[]; total: number }>;
  create(installment: CreateInstallmentData): Promise<Installment>;
  update(id: string, userId: string, data: Partial<Installment>): Promise<Installment | null>;
  delete(id: string, userId: string): Promise<boolean>;
  incrementInstallment(id: string, userId: string): Promise<Installment | null>;
}
