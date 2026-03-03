export interface IInstallment {
  id: string;
  userId: string;
  transactionId?: string;
  description: string;
  totalAmount: number;
  installments: number;
  currentInstallment: number;
  accountId: string;
  categoryId: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateInstallmentData {
  description: string;
  totalAmount: number;
  installments: number;
  accountId: string;
  categoryId: string;
  startDate: Date;
}

export interface UpdateInstallmentData {
  description?: string;
  currentInstallment?: number;
  accountId?: string;
  categoryId?: string;
}

export interface InstallmentFilters {
  accountId?: string;
  categoryId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}
