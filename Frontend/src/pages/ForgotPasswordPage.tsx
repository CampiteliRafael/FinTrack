import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../features/auth/services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('');
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao processar solicitação');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground-primary">Email Enviado</h2>
            <div className="mt-6 p-6 bg-background-secondary rounded-lg border border-primary">
              <p className="text-foreground-secondary">
                Se o email informado estiver cadastrado, você receberá um link para redefinir sua
                senha.
              </p>
              <p className="mt-4 text-sm text-foreground-tertiary">
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/login"
                className="text-accent-primary hover:text-accent-primary-hover font-medium"
              >
                Voltar para o login
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
          <h2 className="text-3xl font-bold text-foreground-primary">Esqueceu a senha?</h2>
          <p className="mt-2 text-foreground-secondary">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="seu@email.com"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Enviar link de recuperação
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
