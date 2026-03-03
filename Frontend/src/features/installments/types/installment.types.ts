export interface Installment {
  id: string;
  userId: string;
  transactionId?: string;
  description: string;
  totalAmount: number;
  installments: number;
  currentInstallment: number;
  accountId: string;
  categoryId: string;
  startDate: string;
  account?: {
    id: string;
    name: string;
    type: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstallmentData {
  description: string;
  totalAmount: number;
  installments: number;
  accountId: string;
  categoryId: string;
  startDate: string;
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
