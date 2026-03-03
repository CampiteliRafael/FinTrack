import { getPasswordStrength } from '../../shared/validators/password.validator';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className = '' }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Força da senha:
        </span>
        <span
          className={`text-sm font-semibold ${
            strength.score === 5
              ? 'text-green-600 dark:text-green-400'
              : strength.score >= 3
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
          }`}
        >
          {strength.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300 ease-out`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
    </div>
  );
}
