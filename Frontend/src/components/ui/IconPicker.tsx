import {
  Wallet,
  DollarSign,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Coffee,
  Smartphone,
  Laptop,
  Gift,
  Heart,
  Plane,
  Briefcase,
  GraduationCap,
  Film,
  Music,
  Shirt,
  Tag,
  CreditCard,
  TrendingUp,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  error?: string;
}

interface IconOption {
  name: string;
  Icon: LucideIcon;
}

const iconOptions: IconOption[] = [
  { name: 'Wallet', Icon: Wallet },
  { name: 'DollarSign', Icon: DollarSign },
  { name: 'ShoppingCart', Icon: ShoppingCart },
  { name: 'Home', Icon: Home },
  { name: 'Car', Icon: Car },
  { name: 'Utensils', Icon: Utensils },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'Laptop', Icon: Laptop },
  { name: 'Gift', Icon: Gift },
  { name: 'Heart', Icon: Heart },
  { name: 'Plane', Icon: Plane },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'GraduationCap', Icon: GraduationCap },
  { name: 'Film', Icon: Film },
  { name: 'Music', Icon: Music },
  { name: 'Shirt', Icon: Shirt },
  { name: 'Tag', Icon: Tag },
  { name: 'CreditCard', Icon: CreditCard },
  { name: 'TrendingUp', Icon: TrendingUp },
  { name: 'Star', Icon: Star },
];

export function IconPicker({ value, onChange, error }: IconPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground-primary">
        Ícone {value && <span className="text-foreground-tertiary text-xs">(selecionado)</span>}
      </label>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 border-2 border-primary rounded-lg bg-background-secondary max-h-72 overflow-y-auto">
        {iconOptions.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={`
              flex items-center justify-center p-3 rounded-lg border-2 transition-all
              ${
                value === name
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-primary bg-background-primary hover:border-accent-primary/50 hover:bg-background-tertiary'
              }
            `}
          >
            <Icon
              size={24}
              className={value === name ? 'text-accent-primary' : 'text-foreground-secondary'}
            />
          </button>
        ))}
      </div>
      {error && <span className="text-sm text-accent-danger">{error}</span>}
    </div>
  );
}

// Helper para renderizar ícone dinamicamente
export function DynamicIcon({
  name,
  size = 20,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const iconOption = iconOptions.find((opt) => opt.name === name);

  if (!iconOption) {
    // Se não encontrar, pode ser emoji antigo - renderiza como texto
    if (name && name.length <= 4) {
      return (
        <span className={className} style={{ fontSize: size }}>
          {name}
        </span>
      );
    }
    // Fallback padrão
    return <Wallet size={size} className={className} />;
  }

  const Icon = iconOption.Icon;
  return <Icon size={size} className={className} />;
}
