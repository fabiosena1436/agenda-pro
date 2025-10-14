import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PageContainer, AppointmentCard, AppointmentHeader, CardActions } from './styles';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import Button from '../../components/Button';

export default function AppointmentsPage() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const appointmentsRef = collection(db, 'businesses', currentUser.uid, 'appointments');
    const q = query(appointmentsRef, orderBy('startTime', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
        }
      });
      setAppointments(appointmentsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const confirmationText = newStatus === 'completed' 
      ? "Tem a certeza que deseja marcar este agendamento como concluído?" 
      : "Tem a certeza que deseja cancelar este agendamento?";

    if (!window.confirm(confirmationText)) return;

    try {
      const appointmentDocRef = doc(db, 'businesses', currentUser.uid, 'appointments', appointmentId);
      await updateDoc(appointmentDocRef, {
        status: newStatus,
      });
      toast.success('Status do agendamento atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar o status:", error);
      toast.error('Não foi possível atualizar o status.');
    }
  };

  if (loading) {
    return <PageContainer><h2>A carregar agendamentos...</h2></PageContainer>;
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

              {/* CÓDIGO CORRIGIDO E ADICIONADO ABAIXO */}
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