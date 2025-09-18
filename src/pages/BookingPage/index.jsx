// src/pages/BookingPage/index.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db, functions } from '../../services/firebaseConfig'; // Importar 'functions'
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions'; // Importar httpsCallable
import { PageContainer, Header, BusinessInfo, ServiceList, ServiceCard, TimeSlotsGrid, TimeSlot } from './styles';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import DatePicker from 'react-datepicker';
import { addMinutes } from 'date-fns';

export default function BookingPage() {
  const { slug } = useParams();
  const [businessData, setBusinessData] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false); // Novo estado para carregar slots

  // Estados para o fluxo de agendamento no Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Busca inicial dos dados do negócio e serviços
  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setBusinessData(null);
        } else {
          const businessDoc = querySnapshot.docs[0];
          setBusinessId(businessDoc.id);
          setBusinessData(businessDoc.data());

          const servicesRef = collection(db, 'businesses', businessDoc.id, 'services');
          const servicesSnapshot = await getDocs(servicesRef);
          const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do negócio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessInfo();
  }, [slug]);

  // Nova função que chama a Cloud Function
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedService || !selectedDate || !businessId) return;

    setLoadingSlots(true);
    setAvailableSlots([]); // Limpa os slots antigos

    try {
      const calculateAvailableSlots = httpsCallable(functions, 'calculateAvailableSlots');
      const result = await calculateAvailableSlots({
        businessId: businessId,
        serviceId: selectedService.id,
        selectedDate: selectedDate.toISOString(),
      });
      // Converte as strings de data de volta para objetos Date
      const slotsAsDates = result.data.availableSlots.map(slot => new Date(slot));
      setAvailableSlots(slotsAsDates);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      alert("Não foi possível carregar os horários. Tente novamente.");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedService, businessId]);

  // Roda a busca de horários sempre que a data ou serviço mudarem
  useEffect(() => {
    if (isModalOpen) {
      fetchAvailableSlots();
    }
  }, [fetchAvailableSlots, isModalOpen]);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setSelectedSlot(null);
    setClientName('');
    setClientPhone('');
    setSelectedDate(new Date()); // Reseta a data
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    if (!selectedSlot || !clientName || !clientPhone) {
      return alert("Por favor, preencha todos os dados.");
    }
    setIsBooking(true);
    try {
      const appointmentsRef = collection(db, 'businesses', businessId, 'appointments');
      await addDoc(appointmentsRef, {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        clientName,
        clientPhone,
        startTime: Timestamp.fromDate(selectedSlot),
        endTime: Timestamp.fromDate(addMinutes(selectedSlot, selectedService.duration)),
        status: 'confirmed',
      });
      alert('Agendamento confirmado com sucesso!');
      handleCloseModal();
      // Não precisa recalcular os slots aqui, pois o modal será fechado.
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      alert("Não foi possível confirmar o agendamento.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <p>A carregar informações do estabelecimento...</p>;
  if (!businessData) return <p>Estabelecimento não encontrado.</p>;

  return (
    <PageContainer>
      <Header bgImage={businessData.bannerUrl}>
        {!businessData.bannerUrl && 'Banner do Estabelecimento'}
      </Header>
      <BusinessInfo>
        {businessData.logoUrl && <img src={businessData.logoUrl} alt="Logo" style={{maxWidth: '150px', maxHeight: '150px', borderRadius: '50%', marginBottom: '10px'}} />}
        <h1>{businessData.businessName || 'Nome do Estabelecimento'}</h1>
      </BusinessInfo>
      <h2>Os nossos Serviços</h2>
      <ServiceList>
        {services.map(service => (
          <ServiceCard key={service.id} onClick={() => handleSelectService(service)}>
            <h3>{service.name}</h3>
            <p>R$ {service.price.toFixed(2)}</p>
            <p>{service.duration} minutos</p>
          </ServiceCard>
        ))}
      </ServiceList>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2>Agendar {selectedService?.name}</h2>
        <hr style={{ margin: '15px 0' }} />

        {selectedSlot ? (
          <form onSubmit={handleBooking}>
            <h4>Confirmar Agendamento</h4>
            <p><strong>Serviço:</strong> {selectedService?.name}</p>
            <p><strong>Data:</strong> {selectedSlot.toLocaleDateString()}</p>
            <p><strong>Horário:</strong> {selectedSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <br/>
            <Input
              placeholder="O seu nome completo"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <Input
              placeholder="O seu telemóvel (WhatsApp)"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
            />
            <Button type="submit" disabled={isBooking}>{isBooking ? 'A agendar...' : 'Confirmar Agendamento'}</Button>
            <Button type="button" danger onClick={() => setSelectedSlot(null)} style={{ marginLeft: '10px' }}>Voltar</Button>
          </form>
        ) : (
          <>
            <p>Selecione uma data:</p>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              inline
              minDate={new Date()}
            />
            <h3>Horários Disponíveis:</h3>
            {loadingSlots ? (
                <p>A procurar horários...</p>
            ) : (
                <TimeSlotsGrid>
                {availableSlots.length > 0 ? (
                    availableSlots.map(slot => (
                    <TimeSlot key={slot.toISOString()} onClick={() => setSelectedSlot(slot)}>
                        {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TimeSlot>
                    ))
                ) : (
                    <p>Nenhum horário disponível para este dia.</p>
                )}
                </TimeSlotsGrid>
            )}
          </>
        )}
      </Modal>
    </PageContainer>
  );
}