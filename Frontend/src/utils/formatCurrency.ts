export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getNumberScale(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1000000000000) {
    return `${(value / 1000000000000).toFixed(1)} trilhões`;
  } else if (absValue >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} bilhões`;
  } else if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(1)} milhões`;
  } else if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)} mil`;
  }

  return '';
}

export function formatCurrencyWithScale(value: number): {
  formatted: string;
  scale: string;
  full: string;
} {
  const formatted = formatCurrency(value);
  const scale = getNumberScale(value);

  return {
    formatted,
    scale,
    full: scale ? `${formatted} (${scale})` : formatted,
  };
}
