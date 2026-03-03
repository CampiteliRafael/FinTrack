import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { handleFormError } from '../../../shared/utils/error-handler.utils';
import { useToast } from '../../../contexts/ToastContext';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success, error: showErrorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data);
      success('Login realizado com sucesso! Bem-vindo(a) de volta!');
      navigate('/dashboard');
    } catch (err: any) {
      handleFormError(err, setFieldError, showErrorToast);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <PasswordInput label="Senha" {...register('password')} error={errors.password?.message} />
      <div className="flex items-center justify-end">
        <Link to="/forgot-password" className="text-sm text-accent-primary hover:text-accent-primary-hover">
          Esqueceu a senha?
        </Link>
      </div>
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
