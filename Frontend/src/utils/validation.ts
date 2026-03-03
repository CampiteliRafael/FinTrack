export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

export const isWithinRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const isEmpty = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || value.trim() === '';
};
