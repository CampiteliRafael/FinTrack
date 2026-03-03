import { Link } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { Card } from '../components/ui/Card';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card hover={false}>
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground-primary">
            Entrar na sua conta
          </h2>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="text-accent-primary hover:text-accent-primary-hover font-medium"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
