import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { PasswordRequirements } from '../../../components/ui/PasswordRequirements';
import { PasswordStrengthMeter } from '../../../components/ui/PasswordStrengthMeter';
import { strongPasswordSchema } from '../../../shared/validators/password.validator';
import { handleFormError } from '../../../shared/utils/error-handler.utils';
import { useToast } from '../../../contexts/ToastContext';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: strongPasswordSchema,
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: showErrorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
  });

  const password = watch('password', '');

  async function onSubmit(data: RegisterFormData) {
    try {
      await registerUser(data);
      success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err: any) {
      handleFormError(err, setFieldError, showErrorToast);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nome" {...register('name')} error={errors.name?.message} />
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <PasswordInput label="Senha" {...register('password')} error={errors.password?.message} />

      {/* Medidor de força da senha */}
      {password && <PasswordStrengthMeter password={password} />}

      {/* Requisitos de senha */}
      <PasswordRequirements password={password} />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Cadastrar
      </Button>
    </form>
  );
}
