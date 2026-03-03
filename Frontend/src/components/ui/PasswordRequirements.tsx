import { passwordRequirements } from '../../shared/validators/password.validator';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className = '' }: PasswordRequirementsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Requisitos da senha:
      </p>
      <ul className="space-y-1.5">
        {passwordRequirements.map((requirement, index) => {
          const isValid = requirement.test(password);
          return (
            <li
              key={index}
              className={`flex items-center text-sm ${
                isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="mr-2">
                {isValid ? (
                  // Check icon
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  // X icon
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </span>
              <span>{requirement.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
