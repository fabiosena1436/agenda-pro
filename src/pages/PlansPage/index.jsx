import React from 'react';
import { PageContainer, PlansGrid, PlanCard, PlanFeatures } from './styles';
import { PLANS } from '../../config/plans'; // Importa nosso "cardápio" de planos
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext'; // Para saber o plano atual do usuário

export default function PlansPage() {
  // No futuro, vamos ler o plano do usuário do AuthContext
  const currentUserPlanId = 'free'; // Por enquanto, fixo para teste

  return (
    <PageContainer>
      <h1>Planos e Assinatura</h1>
      <p>Escolha o plano que melhor se adapta ao seu negócio.</p>
      <PlansGrid>
        {PLANS.map(plan => (
          <PlanCard key={plan.id}>
            <h2>{plan.name}</h2>
            <h3>R$ {plan.price.toFixed(2)} /mês</h3>
            <PlanFeatures>
              {plan.features.map((feature, index) => (
                <li key={index}>✅ {feature}</li>
              ))}
            </PlanFeatures>
            <Button disabled={currentUserPlanId === plan.id}>
              {currentUserPlanId === plan.id ? 'Plano Atual' : 'Mudar para este Plano'}
            </Button>
          </PlanCard>
        ))}
      </PlansGrid>
    </PageContainer>
  );
}