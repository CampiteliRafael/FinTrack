export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline?: string;
  categoryId?: string;
}

export interface UpdateGoalData {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string | null;
  categoryId?: string | null;
}

export interface GoalFilters {
  categoryId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}
