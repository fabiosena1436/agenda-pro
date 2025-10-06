// src/pages/PlansPage/index.jsx

import React, { useState, useEffect } from 'react';
import { PageContainer, PlansGrid, PlanCard, PlanFeatures } from './styles';
import { PLANS } from '../../config/plans';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export default function PlansPage() {
  const { currentUser } = useAuth();
  const [currentUserPlanId, setCurrentUserPlanId] = useState('free');
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (currentUser) {
        const businessDocRef = doc(db, 'businesses', currentUser.uid);
        const docSnap = await getDoc(businessDocRef);
        if (docSnap.exists() && docSnap.data().planId) {
          setCurrentUserPlanId(docSnap.data().planId);
        }
      }
      setLoadingPlan(false);
    };
    fetchUserPlan();
  }, [currentUser]);

  const handleUpgrade = async (planId) => {
    setIsRedirecting(true);
    try {
      const functions = getFunctions();
      // AJUSTE: Adicionamos a região, por consistência e robustez.
      const createSubscription = httpsCallable(functions, 'createSubscription', { region: 'us-central1' });
      const result = await createSubscription({ planId });

      // O resultado agora vem dentro de um objeto 'data'
      window.location.href = result.data.init_point;
    } catch (error) {
      console.error("Erro ao iniciar o processo de assinatura:", error);
      alert("Não foi possível iniciar a assinatura. Tente novamente.");
      setIsRedirecting(false);
    }
  };

  if (loadingPlan) {
    return <PageContainer><h1>A carregar os seus dados...</h1></PageContainer>;
  }

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
            <Button 
              onClick={() => handleUpgrade(plan.id)} 
              disabled={currentUserPlanId === plan.id || isRedirecting || plan.id === 'free'}
            >
              {isRedirecting ? 'Aguarde...' : (currentUserPlanId === plan.id ? 'Plano Atual' : 'Mudar para este Plano')}
            </Button>
          </PlanCard>
        ))}
      </PlansGrid>
    </PageContainer>
  );
}