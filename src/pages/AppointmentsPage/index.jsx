import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  PageContainer, 
  AppointmentCard, 
  AppointmentHeader, 
  CardActions,
  DatePickerWrapper,
  TimeSlotsGrid,
  TimeSlot,
  ButtonGroup 
} from './styles';
import { useAuth } from '../../contexts/AuthContext';
import { db, functions } from '../../services/firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { addMinutes } from 'date-fns';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaWhatsapp } from 'react-icons/fa';

export default function AppointmentsPage() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

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

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("ATENÇÃO: Esta ação é irreversível. Deseja realmente excluir este agendamento?")) return;

    try {
      const appointmentDocRef = doc(db, 'businesses', currentUser.uid, 'appointments', appointmentId);
      await deleteDoc(appointmentDocRef);
      toast.success('Agendamento excluído com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error('Não foi possível excluir o agendamento.');
    }
  };
  
  const handleOpenRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.startTime);
    setIsRescheduleModalOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedAppointment(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const fetchAvailableSlotsForReschedule = useCallback(async () => {
    if (!selectedAppointment || !newDate || !currentUser) return;
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    try {
      const calculateAvailableSlots = httpsCallable(functions, 'calculateAvailableSlots');
      const result = await calculateAvailableSlots({
        businessId: currentUser.uid,
        serviceId: selectedAppointment.serviceId,
        selectedDate: newDate.toISOString(),
      });
      const slotsAsDates = result.data.availableSlots.map(slot => new Date(slot));
      setAvailableSlots(slotsAsDates);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      toast.error("Não foi possível carregar os horários. Tente novamente.");
    } finally {
      setLoadingSlots(false);
    }
  }, [newDate, selectedAppointment, currentUser]);

  useEffect(() => {
    if (isRescheduleModalOpen) {
      fetchAvailableSlotsForReschedule();
    }
  }, [fetchAvailableSlotsForReschedule, isRescheduleModalOpen]);
  
  const handleRescheduleSubmit = async () => {
    if (!selectedSlot || !selectedAppointment) {
      toast.warn("Por favor, selecione um novo horário.");
      return;
    }
    setIsUpdating(true);
    try {
      const appointmentDocRef = doc(db, 'businesses', currentUser.uid, 'appointments', selectedAppointment.id);
      
      const newStartTime = Timestamp.fromDate(selectedSlot);
      const newEndTime = Timestamp.fromDate(addMinutes(selectedSlot, selectedAppointment.duration || 60));

      await updateDoc(appointmentDocRef, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
      
      toast.success("Agendamento reagendado com sucesso!");
      handleCloseRescheduleModal();

    } catch (error) {
      console.error("Erro ao reagendar:", error);
      toast.error("Não foi possível reagendar.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <PageContainer><h2>A carregar agendamentos...</h2></PageContainer>;
  }

  return (
    <>
      <PageContainer>
        <h1>Meus Agendamentos</h1>
        <br/>
        {appointments.length === 0 ? (
          <p>Nenhum agendamento encontrado.</p>
        ) : (
          <div>
            {appointments.map(app => {
              const clientPhone = cleanPhoneNumber(app.clientPhone);
              const reminderMessage = encodeURIComponent(
                `Olá, ${app.clientName}! Passando para lembrar do seu agendamento de ${app.serviceName} no dia ${app.startTime.toLocaleDateString('pt-BR')} às ${app.startTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}. Aguardamos você!`
              );
              const reminderLink = `https://wa.me/${clientPhone}?text=${reminderMessage}`;

              return (
              <AppointmentCard key={app.id} status={app.status}>
                <AppointmentHeader>
                  <h3>{app.serviceName}</h3>
                  <strong>{app.startTime.toLocaleDateString('pt-BR')}</strong>
                </AppointmentHeader>
                <p><strong>Cliente:</strong> {app.clientName}</p>
                <p><strong>Horário:</strong> {app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {app.endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Telefone:</strong> {app.clientPhone}</p>
                <p><strong>Status:</strong> <span style={{fontWeight: 'bold'}}>{app.status}</span></p>

                <CardActions>
                  {app.status === 'confirmed' && (
                    <>
                      {clientPhone && (
                        <a href={reminderLink} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
                          <Button style={{backgroundColor: '#25D366', display: 'flex', alignItems: 'center'}}>
                            <FaWhatsapp style={{marginRight: '8px'}} /> Lembrar
                          </Button>
                        </a>
                      )}
                      <Button onClick={() => handleUpdateStatus(app.id, 'completed')}>
                        Concluir
                      </Button>
                      <Button onClick={() => handleOpenRescheduleModal(app)}>
                        Reagendar
                      </Button>
                      <Button danger onClick={() => handleUpdateStatus(app.id, 'cancelled')}>
                        Cancelar
                      </Button>
                    </>
                  )}
                   <Button danger onClick={() => handleDeleteAppointment(app.id)}> 
                      Excluir
                    </Button>
                </CardActions>
              </AppointmentCard>
            )})}
          </div>
        )}
      </PageContainer>
      
      <Modal isOpen={isRescheduleModalOpen} onClose={handleCloseRescheduleModal}>
        <h2>Reagendar Horário</h2>
        {selectedAppointment && <p>Reagendando para: <strong>{selectedAppointment.clientName}</strong></p>}
        <hr style={{margin: '15px 0'}} />
        <p>Selecione a nova data:</p>
        <DatePickerWrapper>
          <DatePicker
            selected={newDate}
            onChange={(date) => setNewDate(date)}
            inline
            minDate={new Date()}
          />
        </DatePickerWrapper>
        <h3>Novos Horários Disponíveis:</h3>
        {loadingSlots ? (
            <p>A procurar horários...</p>
        ) : (
            <TimeSlotsGrid>
            {availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                <TimeSlot 
                    key={slot.toISOString()} 
                    onClick={() => setSelectedSlot(slot)}
                    selected={selectedSlot?.toISOString() === slot.toISOString()}
                >
                    {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TimeSlot>
                ))
            ) : (
                <p>Nenhum horário disponível para este dia.</p>
            )}
            </TimeSlotsGrid>
        )}
        <ButtonGroup>
          <Button className="secondary" onClick={handleCloseRescheduleModal}>Fechar</Button>
          <Button className="primary" onClick={handleRescheduleSubmit} disabled={!selectedSlot || isUpdating}>
            {isUpdating ? 'Salvando...' : 'Confirmar Reagendamento'}
          </Button>
        </ButtonGroup>
      </Modal>
    </>
  );
}