import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { PasswordRequirements } from '../components/ui/PasswordRequirements';
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter';
import { strongPasswordSchema } from '../shared/validators/password.validator';

const resetPasswordSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token inválido ou ausente');
      return;
    }

    try {
      setError('');
      await resetPassword(token, data.newPassword);
      setSuccess(true);

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground-primary">Token Inválido</h2>
            <p className="mt-4 text-foreground-secondary">
              O link de redefinição de senha é inválido ou expirou.
            </p>
            <div className="mt-6">
              <Link
                to="/forgot-password"
                className="text-accent-primary hover:text-accent-primary-hover font-medium"
              >
                Solicitar novo link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
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
            </div>
            <h2 className="mt-6 text-3xl font-bold text-foreground-primary">Senha Redefinida!</h2>
            <p className="mt-2 text-foreground-secondary">
              Sua senha foi redefinida com sucesso. Redirecionando para o login...
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="text-accent-primary hover:text-accent-primary-hover font-medium"
              >
                Ir para o login agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground-primary">Redefinir Senha</h2>
          <p className="mt-2 text-foreground-secondary">Digite sua nova senha</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <PasswordInput
            label="Nova Senha"
            {...register('newPassword')}
            error={errors.newPassword?.message}
          />

          {/* Medidor de força da senha */}
          {newPassword && <PasswordStrengthMeter password={newPassword} />}

          {/* Requisitos de senha */}
          <PasswordRequirements password={newPassword} />

          <PasswordInput
            label="Confirmar Senha"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Digite a senha novamente"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Redefinir Senha
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-accent-primary hover:text-accent-primary-hover font-medium"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
