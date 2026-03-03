export interface IGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date | null;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline?: Date;
  categoryId?: string;
}

export interface UpdateGoalData {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: Date;
  categoryId?: string;
}

export interface GoalFilters {
  categoryId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}
