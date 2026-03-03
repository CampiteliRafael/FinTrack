import { Category } from '../types/category.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DynamicIcon } from '../../../components/ui/IconPicker';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card hover={false}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: category.color }}
        >
          <DynamicIcon name={category.icon} size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-base truncate text-foreground-primary"
            title={category.name}
          >
            {category.name}
          </h3>
          <p className="text-xs text-foreground-tertiary">Categoria</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(category)} className="flex-1">
          Editar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDelete(category.id)}
          className="flex-1"
        >
          Excluir
        </Button>
      </div>
    </Card>
  );
}
