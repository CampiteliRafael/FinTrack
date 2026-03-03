import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, KeyRound } from 'lucide-react';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { userService } from '../services/userService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { PasswordRequirements } from '../components/ui/PasswordRequirements';
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter';
import { useToastContext } from '../contexts/ToastContext';
import { strongPasswordSchema } from '../shared/validators/password.validator';
import { handleFormError } from '../shared/utils/error-handler.utils';

const profileSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    setError: setProfileError,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPasswordForm,
    watch,
    setError: setPasswordError,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword', '');

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await userService.updateProfile(data);
      updateUser(updatedUser);
      toast.success('Perfil atualizado com sucesso');
    } catch (error: any) {
      handleFormError(error, setProfileError, toast.error);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await userService.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Senha atualizada com sucesso');
      resetPasswordForm();
    } catch (error: any) {
      handleFormError(error, setPasswordError, toast.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground-primary">Meu Perfil</h1>
        <p className="text-foreground-secondary mt-1">Gerencie suas informações pessoais e senha</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-background-secondary rounded-lg p-6 border border-primary">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-accent-primary flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground-primary">{user?.name}</h2>
            <p className="text-foreground-secondary">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-accent-primary text-accent-primary font-semibold'
                : 'border-transparent text-foreground-secondary hover:text-foreground-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Informações Pessoais</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-accent-primary text-accent-primary font-semibold'
                : 'border-transparent text-foreground-secondary hover:text-foreground-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              <span>Alterar Senha</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-background-secondary rounded-lg p-6 border border-primary">
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <Input
              label="Nome"
              {...registerProfile('name')}
              error={profileErrors.name?.message}
              placeholder="Seu nome completo"
            />

            <Input
              label="Email"
              type="email"
              {...registerProfile('email')}
              error={profileErrors.email?.message}
              placeholder="seu@email.com"
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isProfileSubmitting}>
                Salvar Alterações
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <PasswordInput
              label="Senha Atual"
              {...registerPassword('currentPassword')}
              error={passwordErrors.currentPassword?.message}
              placeholder="Digite sua senha atual"
            />

            <PasswordInput
              label="Nova Senha"
              {...registerPassword('newPassword')}
              error={passwordErrors.newPassword?.message}
            />

            {/* Medidor de força da senha */}
            {newPassword && <PasswordStrengthMeter password={newPassword} />}

            {/* Requisitos de senha */}
            <PasswordRequirements password={newPassword} />

            <PasswordInput
              label="Confirmar Nova Senha"
              {...registerPassword('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
              placeholder="Digite a nova senha novamente"
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isPasswordSubmitting}>
                Atualizar Senha
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
