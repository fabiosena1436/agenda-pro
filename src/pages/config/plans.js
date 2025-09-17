// src/config/plans.js
export const PLANS = [
  {
    id: 'free',
    name: 'Plano Grátis',
    price: 0,
    features: [
      'Até 10 serviços',
      'Até 20 agendamentos por mês',
      'Página de agendamento online',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 29.90,
    features: [
      'Até 50 serviços',
      'Agendamentos ilimitados',
      'Página de agendamento online',
      'Personalização de logo e banner',
      'Suporte prioritário por e-mail',
    ],
  },
  {
    id: 'pro',
    name: 'Plano Pro',
    price: 49.90,
    features: [
      'Serviços ilimitados',
      'Agendamentos ilimitados',
      'Página de agendamento online',
      'Personalização de logo e banner',
      'Notificações por WhatsApp (Em breve)',
      'Suporte via WhatsApp',
    ],
  },
];