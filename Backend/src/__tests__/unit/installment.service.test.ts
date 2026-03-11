import { InstallmentService } from '../../modules/installments/installment.service';
import { IInstallmentRepository } from '../../core/interfaces/IInstallmentRepository';
import { IAccountRepository } from '../../core/interfaces/IAccountRepository';
import { ICategoryRepository } from '../../core/interfaces/ICategoryRepository';
import { NotFoundError } from '../../shared/errors/AppError';
import { ValidationUtil } from '../../shared/utils/validation.util';

// Mock dependencies
jest.mock('../../shared/utils/validation.util');

describe('InstallmentService', () => {
  let installmentService: InstallmentService;
  let mockInstallmentRepository: jest.Mocked<IInstallmentRepository>;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockInstallmentRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      incrementInstallment: jest.fn(),
    } as jest.Mocked<IInstallmentRepository>;

    mockAccountRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      createWithInitialBalance: jest.fn(),
      updateWithBalanceAdjustment: jest.fn(),
    } as jest.Mocked<IAccountRepository>;

    mockCategoryRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as jest.Mocked<ICategoryRepository>;

    installmentService = new InstallmentService(
      mockInstallmentRepository,
      mockAccountRepository,
      mockCategoryRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInstallment', () => {
    const userId = 'user-123';
    const createData = {
      description: 'Compra Parcelada',
      totalAmount: 1200.00,
      installments: 12,
      accountId: 'account-123',
      categoryId: 'category-123',
      startDate: new Date('2026-03-01'),
    };

    it('should create installment with account and category validation', async () => {
      const mockInstallment = {
        id: 'installment-123',
        ...createData,
        userId,
      };

      (ValidationUtil.validateAccountAndCategory as jest.Mock).mockResolvedValue(undefined);
      mockInstallmentRepository.create.mockResolvedValue(mockInstallment as any);

      const result = await installmentService.createInstallment(userId, createData);

      expect(ValidationUtil.validateAccountAndCategory).toHaveBeenCalledWith(
        mockAccountRepository,
        mockCategoryRepository,
        createData.accountId,
        createData.categoryId,
        userId
      );
      expect(mockInstallmentRepository.create).toHaveBeenCalledWith({
        userId,
        transactionId: null,
        description: createData.description,
        totalAmount: createData.totalAmount,
        installments: createData.installments,
        currentInstallment: 0,
        accountId: createData.accountId,
        categoryId: createData.categoryId,
        startDate: createData.startDate,
      });
      expect(result).toEqual(mockInstallment);
    });

    it('should throw error if account validation fails', async () => {
      (ValidationUtil.validateAccountAndCategory as jest.Mock).mockRejectedValue(
        new NotFoundError('Conta não encontrada')
      );

      await expect(
        installmentService.createInstallment(userId, createData)
      ).rejects.toThrow(NotFoundError);
      expect(mockInstallmentRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if category validation fails', async () => {
      (ValidationUtil.validateAccountAndCategory as jest.Mock).mockRejectedValue(
        new NotFoundError('Categoria não encontrada')
      );

      await expect(
        installmentService.createInstallment(userId, createData)
      ).rejects.toThrow(NotFoundError);
      expect(mockInstallmentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateInstallment', () => {
    const userId = 'user-123';
    const installmentId = 'installment-123';

    it('should update installment with account validation', async () => {
      const updateData = {
        description: 'Updated Description',
        accountId: 'account-456',
      };

      const updatedInstallment = {
        id: installmentId,
        ...updateData,
        userId,
      };

      (ValidationUtil.validateAccount as jest.Mock).mockResolvedValue(undefined);
      mockInstallmentRepository.update.mockResolvedValue(updatedInstallment as any);

      const result = await installmentService.updateInstallment(installmentId, userId, updateData);

      expect(ValidationUtil.validateAccount).toHaveBeenCalledWith(
        mockAccountRepository,
        updateData.accountId,
        userId
      );
      expect(mockInstallmentRepository.update).toHaveBeenCalledWith(
        installmentId,
        userId,
        updateData
      );
      expect(result).toEqual(updatedInstallment);
    });

    it('should update installment with category validation', async () => {
      const updateData = {
        categoryId: 'category-789',
      };

      const updatedInstallment = {
        id: installmentId,
        ...updateData,
        userId,
      };

      (ValidationUtil.validateCategory as jest.Mock).mockResolvedValue(undefined);
      mockInstallmentRepository.update.mockResolvedValue(updatedInstallment as any);

      const result = await installmentService.updateInstallment(installmentId, userId, updateData);

      expect(ValidationUtil.validateCategory).toHaveBeenCalledWith(
        mockCategoryRepository,
        updateData.categoryId,
        userId
      );
      expect(mockInstallmentRepository.update).toHaveBeenCalledWith(
        installmentId,
        userId,
        updateData
      );
      expect(result).toEqual(updatedInstallment);
    });

    it('should update without validation if no account or category', async () => {
      const updateData = {
        description: 'Just description update',
      };

      const updatedInstallment = {
        id: installmentId,
        ...updateData,
        userId,
      };

      mockInstallmentRepository.update.mockResolvedValue(updatedInstallment as any);

      const result = await installmentService.updateInstallment(installmentId, userId, updateData);

      expect(ValidationUtil.validateAccount).not.toHaveBeenCalled();
      expect(ValidationUtil.validateCategory).not.toHaveBeenCalled();
      expect(result).toEqual(updatedInstallment);
    });

    it('should throw error if installment not found', async () => {
      mockInstallmentRepository.update.mockResolvedValue(null);

      await expect(
        installmentService.updateInstallment(installmentId, userId, { description: 'Test' })
      ).rejects.toThrow('Installment not found');
    });
  });

  describe('deleteInstallment', () => {
    const userId = 'user-123';
    const installmentId = 'installment-123';

    it('should delete installment successfully', async () => {
      mockInstallmentRepository.delete.mockResolvedValue(true);

      await installmentService.deleteInstallment(installmentId, userId);

      expect(mockInstallmentRepository.delete).toHaveBeenCalledWith(installmentId, userId);
    });

    it('should throw error if installment not found', async () => {
      mockInstallmentRepository.delete.mockResolvedValue(false);

      await expect(
        installmentService.deleteInstallment(installmentId, userId)
      ).rejects.toThrow('Installment not found');
    });
  });

  describe('payInstallment', () => {
    const userId = 'user-123';
    const installmentId = 'installment-123';

    it('should pay installment and increment current installment', async () => {
      const mockInstallment = {
        id: installmentId,
        description: 'Monthly Payment',
        currentInstallment: 3,
        installments: 12,
        userId,
      };

      mockInstallmentRepository.incrementInstallment.mockResolvedValue(mockInstallment as any);

      const result = await installmentService.payInstallment(installmentId, userId);

      expect(mockInstallmentRepository.incrementInstallment).toHaveBeenCalledWith(
        installmentId,
        userId
      );
      expect(result).toEqual(mockInstallment);
      expect(result.currentInstallment).toBe(3);
    });

    it('should throw error if installment not found', async () => {
      mockInstallmentRepository.incrementInstallment.mockResolvedValue(null);

      await expect(
        installmentService.payInstallment(installmentId, userId)
      ).rejects.toThrow('Installment not found');
    });
  });

  describe('getInstallmentById', () => {
    const userId = 'user-123';
    const installmentId = 'installment-123';

    it('should return installment if found', async () => {
      const mockInstallment = {
        id: installmentId,
        description: 'Test Installment',
        totalAmount: 1200.00,
        installments: 12,
        currentInstallment: 5,
        userId,
      };

      mockInstallmentRepository.findById.mockResolvedValue(mockInstallment as any);

      const result = await installmentService.getInstallmentById(installmentId, userId);

      expect(result).toEqual(mockInstallment);
      expect(mockInstallmentRepository.findById).toHaveBeenCalledWith(installmentId, userId);
    });

    it('should throw NotFoundError if installment not found', async () => {
      mockInstallmentRepository.findById.mockResolvedValue(null);

      await expect(
        installmentService.getInstallmentById(installmentId, userId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        installmentService.getInstallmentById(installmentId, userId)
      ).rejects.toThrow('Parcelamento não encontrado');
    });
  });

  describe('getInstallments', () => {
    const userId = 'user-123';

    it('should return filtered installments', async () => {
      const filters = {
        accountId: 'account-123',
      };

      const mockInstallments = [
        {
          id: '1',
          description: 'Installment 1',
          currentInstallment: 2,
          installments: 12,
        },
        {
          id: '2',
          description: 'Installment 2',
          currentInstallment: 5,
          installments: 10,
        },
      ];

      const mockResult = {
        installments: mockInstallments as any,
        total: 2,
      };

      mockInstallmentRepository.findAll.mockResolvedValue(mockResult);

      const result = await installmentService.getInstallments(userId, filters);

      expect(mockInstallmentRepository.findAll).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockResult);
      expect(result.installments).toHaveLength(2);
    });

    it('should return empty array if no installments', async () => {
      const mockResult = {
        installments: [],
        total: 0,
      };

      mockInstallmentRepository.findAll.mockResolvedValue(mockResult);

      const result = await installmentService.getInstallments(userId, {});

      expect(result.installments).toEqual([]);
      expect(result.installments).toHaveLength(0);
    });
  });
});
