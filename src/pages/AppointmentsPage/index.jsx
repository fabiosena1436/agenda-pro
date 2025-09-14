import React, { useState, useEffect } from 'react';
import { PageContainer, AppointmentCard, AppointmentHeader, CardActions } from './styles';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import Button from '../../components/Button';

export default function AppointmentsPage() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Efeito para buscar os agendamentos em tempo real
  useEffect(() => {
    // Garante que só vamos buscar dados se o usuário estiver logado
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 1. Define o caminho para a sub-coleção de agendamentos do usuário logado
    const appointmentsRef = collection(db, 'businesses', currentUser.uid, 'appointments');
    
    // 2. Cria uma "query" para ordenar os agendamentos por data, do mais próximo para o mais distante
    const q = query(appointmentsRef, orderBy('startTime', 'asc'));

    // 3. Usa o onSnapshot para ouvir as mudanças em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          // Converte os Timestamps do Firebase para objetos Date do JavaScript
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
        }
      });
      setAppointments(appointmentsData);
      setLoading(false);
    });

    // Limpa o "ouvinte" quando a página for desmontada para evitar vazamento de memória
    return () => unsubscribe();
  }, [currentUser]); // A dependência [currentUser] garante que o efeito rode novamente se o usuário mudar

  // Função para atualizar o status de um agendamento
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const confirmationText = newStatus === 'completed' 
      ? "Tem certeza que deseja marcar este agendamento como concluído?" 
      : "Tem certeza que deseja cancelar este agendamento?";
      
    if (!window.confirm(confirmationText)) return;

    try {
      const appointmentDocRef = doc(db, 'businesses', currentUser.uid, 'appointments', appointmentId);
      await updateDoc(appointmentDocRef, {
        status: newStatus,
      });
      alert('Status do agendamento atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert('Não foi possível atualizar o status.');
    }
  };

  if (loading) {
    return <PageContainer><h2>Carregando agendamentos...</h2></PageContainer>;
  }

  return (
    <PageContainer>
      <h1>Meus Agendamentos</h1>
      <br/>
      {appointments.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <div>
          {appointments.map(app => (
            <AppointmentCard key={app.id} status={app.status}>
              <AppointmentHeader>
                <h3>{app.serviceName}</h3>
                <strong>{app.startTime.toLocaleDateString('pt-BR')}</strong>
              </AppointmentHeader>
              <p><strong>Cliente:</strong> {app.clientName}</p>
              <p><strong>Horário:</strong> {app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {app.endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Telefone:</strong> {app.clientPhone}</p>
              <p><strong>Status:</strong> <span style={{fontWeight: 'bold'}}>{app.status}</span></p>

              {/* Mostra os botões apenas se o status for 'confirmed' */}
              {app.status === 'confirmed' && (
                <CardActions>
                  <Button onClick={() => handleUpdateStatus(app.id, 'completed')}>
                    Concluir
                  </Button>
                  <Button danger onClick={() => handleUpdateStatus(app.id, 'cancelled')}>
                    Cancelar
                  </Button>
                </CardActions>
              )}
            </AppointmentCard>
          ))}
        </div>
      )}
    </PageContainer>
  );
}