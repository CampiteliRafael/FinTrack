import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { IconPicker } from '../../../components/ui/IconPicker';
import { Category } from '../types/category.types';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
  icon: z.string().min(1, 'Ícone obrigatório'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

const commonColors = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
];

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          color: category.color,
          icon: category.icon,
        }
      : {
          color: '#3B82F6',
          icon: 'Wallet',
        },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nome da Categoria" {...register('name')} error={errors.name?.message} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-primary">Cor</label>
        <div className="flex gap-2 mb-2">
          {commonColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-8 h-8 rounded border-2 ${
                selectedColor === color ? 'border-foreground-primary' : 'border-primary'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Input type="text" {...register('color')} error={errors.color?.message} />
      </div>

      <IconPicker
        value={selectedIcon}
        onChange={(icon) => setValue('icon', icon)}
        error={errors.icon?.message}
      />

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {category ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
