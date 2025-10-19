import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { db, functions } from '../../services/firebaseConfig';
import { collection, query, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { PageContainer, BusinessTable, ActionsCell, BlockStatus, PlanSelector } from './styles';
import { PLANS } from '../../config/plans';
import { useNavigate } from 'react-router-dom';

// Mapeamento dos nomes de plano (para o PlanSelector)
const ALL_PLANS = PLANS.map(p => p.id);

export default function SuperAdminPage() {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirecionamento para ver a página do negócio (Simula o 'entrar')
  const handleGoToPage = (slug) => {
    if (slug) {
        // Abre em uma nova aba
        window.open(`/agendar/${slug}`, '_blank');
    } else {
        toast.warn("O negócio não tem um slug definido.");
    }
  };

  // Função para gerir o negócio via Cloud Function
  const manageBusiness = async (businessId, action, value = null) => {
    if (!window.confirm(`Tem certeza que deseja executar a ação '${action}' em ${businessId}?`)) return;
    
    const adminManageBusiness = httpsCallable(functions, 'adminManageBusiness');
    try {
      toast.info(`Executando ação ${action}...`);
      const result = await adminManageBusiness({ targetBusinessId: businessId, action, value });
      toast.success(result.data.message || `Ação '${action}' executada com sucesso!`);
    } catch (error) {
      console.error(`Erro na ação de admin '${action}':`, error);
      // O erro do Cloud Function é passado em error.message ou error.details.message
      const errorMessage = error.details?.message || error.message || `Erro ao executar ação '${action}'.`;
      toast.error(errorMessage);
    }
  };

  // Efeito para buscar todos os negócios
  useEffect(() => {
    if (!isSuperAdmin) {
      // Se não for admin, para o carregamento e não tenta buscar dados
      setLoading(false);
      return;
    }
    
    const businessesRef = collection(db, 'businesses');
    const q = query(businessesRef);

    // Usa onSnapshot para obter atualizações em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const businessesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBusinesses(businessesData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar negócios:", error);
      toast.error("Erro ao carregar lista de negócios.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSuperAdmin]);

  // Exibe a mensagem de carregamento ou negação de acesso
  if (loading) {
    return <PageContainer><h2>A carregar painel de Super Admin...</h2></PageContainer>;
  }

  if (!isSuperAdmin) {
    return <PageContainer><h1>Acesso Negado</h1><p>Você não tem permissões de Super Administrador.</p></PageContainer>;
  }

  return (
    <PageContainer>
      <h1>Painel de Super Administrador</h1>
      <p>Controlo total sobre todas as contas de negócios ({businesses.length}).</p>

      <BusinessTable>
        <thead>
          <tr>
            <th>Negócio (ID)</th>
            <th>E-mail</th>
            <th>Plano Atual</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map(b => (
            <tr key={b.id}>
              <td>
                <strong>{b.businessName || 'Sem Nome'}</strong>
                <br />
                <small>{b.id}</small>
              </td>
              <td>{b.email}</td>
              <td>{b.planId?.toUpperCase() || 'FREE'}</td>
              <td>
                <BlockStatus $isBlocked={b.isBlocked}>
                  {b.isBlocked ? 'BLOQUEADO' : 'ATIVO'}
                </BlockStatus>
                {b.isBlocked && <p style={{fontSize: '0.8rem', color: '#dc3545', margin: '5px 0 0'}}>{b.blockReason}</p>}
              </td>
              <ActionsCell>
                {/* Ação: Entrar na Loja (ver a página pública) */}
                <Button onClick={() => handleGoToPage(b.slug)} style={{backgroundColor: '#17a2b8'}}>Ver Loja</Button>
                
                {/* Ação: Mudar Plano */}
                <PlanSelector 
                    value={b.planId} 
                    onChange={(e) => manageBusiness(b.id, 'changePlan', e.target.value)}
                >
                    {ALL_PLANS.map(plan => (
                        <option key={plan} value={plan}>{plan.toUpperCase()}</option>
                    ))}
                </PlanSelector>

                {/* Ação: Bloquear/Desbloquear */}
                {b.isBlocked ? (
                    <Button onClick={() => manageBusiness(b.id, 'unblockBusiness')} style={{backgroundColor: '#28a745'}}>Desbloquear</Button>
                ) : (
                    <Button danger onClick={() => {
                        const reason = window.prompt("Insira a razão do bloqueio:", "Violação de termos de serviço");
                        if (reason) manageBusiness(b.id, 'blockBusiness', reason);
                    }}>Bloquear</Button>
                )}

                {/* Ação: Excluir */}
                <Button danger onClick={() => manageBusiness(b.id, 'deleteBusiness')}>Excluir Negócio</Button>
              </ActionsCell>
            </tr>
          ))}
        </tbody>
      </BusinessTable>
    </PageContainer>
  );
}