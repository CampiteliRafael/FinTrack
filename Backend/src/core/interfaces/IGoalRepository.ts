import { Goal } from '../entities/Goal';

export interface GoalFilters {
  categoryId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}

export type CreateGoalData = {
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  categoryId: string | null;
};

export interface IGoalRepository {
  findById(id: string, userId: string): Promise<Goal | null>;
  findAll(userId: string, filters: GoalFilters): Promise<{ goals: Goal[]; total: number }>;
  create(goal: CreateGoalData): Promise<Goal>;
  update(id: string, userId: string, data: Partial<Goal>): Promise<Goal | null>;
  delete(id: string, userId: string): Promise<boolean>;
  addProgress(id: string, userId: string, amount: number): Promise<Goal | null>;
}
