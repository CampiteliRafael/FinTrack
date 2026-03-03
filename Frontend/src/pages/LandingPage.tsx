import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, Target, CreditCard, PieChart, Bell } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const features = [
    {
      icon: Wallet,
      title: 'Múltiplas Contas',
      description: 'Gerencie contas correntes, poupança e dinheiro em um só lugar',
    },
    {
      icon: TrendingUp,
      title: 'Controle Total',
      description: 'Acompanhe receitas e despesas com filtros inteligentes e relatórios',
    },
    {
      icon: Target,
      title: 'Metas Financeiras',
      description: 'Defina objetivos e acompanhe seu progresso em tempo real',
    },
    {
      icon: CreditCard,
      title: 'Parcelamentos',
      description: 'Controle suas compras parceladas e vencimentos automáticos',
    },
    {
      icon: PieChart,
      title: 'Dashboard Completo',
      description: 'Visualize seus gastos por categoria com gráficos e estatísticas',
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Receba alertas sobre metas atingidas e movimentações importantes',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground-primary mb-6">
            Controle suas finanças de
            <span className="text-accent-primary"> forma simples</span>
          </h1>
          <p className="text-xl text-foreground-secondary mb-8 max-w-3xl mx-auto">
            Gerencie suas contas, transações, metas e parcelamentos em um só lugar. Tenha controle
            total sobre seu dinheiro com dashboard intuitivo e relatórios detalhados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-8">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground-primary mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
              Tudo que você precisa para ter controle total das suas finanças pessoais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background-primary rounded-lg p-6 border border-primary hover:border-accent-primary transition-all duration-200"
              >
                <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground-primary mb-6">
            Por que escolher o FinTrack?
          </h2>
          <div className="space-y-6 text-lg text-foreground-secondary">
            <p>
              O FinTrack foi desenvolvido para ser a solução completa de gestão financeira pessoal.
              Com uma interface moderna e intuitiva, você tem acesso a todos os recursos necessários
              para organizar suas finanças.
            </p>
            <p>
              Nossa plataforma oferece controle total sobre múltiplas contas, categorização
              automática de gastos, acompanhamento de metas e muito mais. Tudo isso com segurança de
              dados e design responsivo para uso em qualquer dispositivo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-4xl font-bold text-accent-primary mb-2">100%</div>
                <div className="text-sm text-foreground-secondary">Gratuito</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent-primary mb-2">Seguro</div>
                <div className="text-sm text-foreground-secondary">Dados Protegidos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent-primary mb-2">Moderno</div>
                <div className="text-sm text-foreground-secondary">Interface Intuitiva</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Crie sua conta gratuitamente e comece a controlar suas finanças hoje mesmo
          </p>
          <Link to="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-accent-primary hover:bg-gray-100 px-8"
            >
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
