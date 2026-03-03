import { Link } from 'react-router-dom';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { Card } from '../components/ui/Card';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card hover={false}>
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground-primary">
            Criar sua conta
          </h2>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="text-accent-primary hover:text-accent-primary-hover font-medium"
            >
              Faça login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
