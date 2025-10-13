import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db, functions } from '../../services/firebaseConfig';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ThemeProvider } from 'styled-components';
import { 
  PageContainer, HeaderWrapper, Header, BusinessInfo, ContentWrapper, ServiceList, ServiceCard,
  TimeSlotsGrid, TimeSlot, BookingPageTheme, SocialLinks, TabContainer, TabButton, SearchBar,
  ServiceInfo, TimeInfo, DetailsContainer, GalleryModalGrid, GalleryImage, ServiceImage,
  DatePickerWrapper
} from './styles';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import DatePicker from 'react-datepicker';
import { addMinutes } from 'date-fns';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';

const defaultTheme = {
  primaryColor: '#db8e8e',
  backgroundColor: '#fdf7f7',
  textColor: '#ffffff',
  hoverColor: '#c97a7a'
};

const weekDaysMap = {
  segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira', 
  quinta: 'Quinta-feira', sexta: 'Sexta-feira', sabado: 'Sábado', domingo: 'Domingo'
};

export default function BookingPage() {
  const { slug } = useParams();
  const [businessData, setBusinessData] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const [activeTab, setActiveTab] = useState('servicos');
  const [searchTerm, setSearchTerm] = useState('');

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
          setBusinessData({ ...businessDoc.data(), theme: { ...defaultTheme, ...businessDoc.data().theme } });

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

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedService || !selectedDate || !businessId) return;
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const calculateAvailableSlots = httpsCallable(functions, 'calculateAvailableSlots', { region: 'us-central1' });
      const result = await calculateAvailableSlots({
        businessId: businessId,
        serviceId: selectedService.id,
        selectedDate: selectedDate.toISOString(),
      });
      const slotsAsDates = result.data.availableSlots.map(slot => new Date(slot));
      setAvailableSlots(slotsAsDates);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      alert("Não foi possível carregar os horários. Tente novamente.");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedService, businessId]);

  useEffect(() => {
    if (isBookingModalOpen) {
      fetchAvailableSlots();
    }
  }, [fetchAvailableSlots, isBookingModalOpen]);

  const handleOpenBookingModal = (service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
    setSelectedSlot(null);
    setClientName('');
    setClientPhone('');
    setSelectedDate(new Date());
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
      handleCloseBookingModal();
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      alert("Não foi possível confirmar o agendamento.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <p>A carregar...</p>;
  if (!businessData) return <p>Estabelecimento não encontrado.</p>;
  
  const theme = { ...defaultTheme, ...businessData.theme };

  return (
    <ThemeProvider theme={theme}>
      <BookingPageTheme theme={theme} />
      <PageContainer>
        <HeaderWrapper>
          <Header bgImage={businessData.bannerUrl} />
          <BusinessInfo>
            {businessData.logoUrl && <img src={businessData.logoUrl} alt="Logo" />}
          </BusinessInfo>
          <SocialLinks theme={theme}>
            {businessData.whatsappLink && <a href={businessData.whatsappLink} target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>}
            {businessData.instagramUrl && <a href={businessData.instagramUrl} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
          </SocialLinks>
        </HeaderWrapper>

        <TabContainer>
          <TabButton theme={theme} active={activeTab === 'servicos'} onClick={() => setActiveTab('servicos')}>Serviços</TabButton>
          <TabButton theme={theme} active={activeTab === 'detalhes'} onClick={() => setActiveTab('detalhes')}>Detalhes</TabButton>
        </TabContainer>

        <ContentWrapper>
          {activeTab === 'servicos' && (
            <>
              <SearchBar 
                theme={theme}
                placeholder="Pesquisar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ServiceList>
                {filteredServices.map(service => (
                  <ServiceCard key={service.id}>
                    {service.gallery && service.gallery.length > 0 && (
                      <ServiceImage src={service.gallery[0]} alt={service.name} />
                    )}
                    <ServiceInfo>
                      <h3>{service.name}</h3>
                      <p>Sob Consulta</p>
                    </ServiceInfo>
                    <TimeInfo><FiClock /> {service.duration}min</TimeInfo>
                    <Button onClick={() => handleOpenBookingModal(service)}>Agendar</Button>
                  </ServiceCard>
                ))}
              </ServiceList>
            </>
          )}

          {activeTab === 'detalhes' && (
            <DetailsContainer>
              {businessData.aboutDescription && (
                <>
                  <h3>Sobre Nós</h3>
                  <p>{businessData.aboutDescription}</p>
                  <br/>
                </>
              )}
              
              {businessData.aboutGallery && businessData.aboutGallery.length > 0 && (
                <>
                  <h3>Nossa Galeria</h3>
                  <GalleryModalGrid>
                    {businessData.aboutGallery.map(url => (
                      <GalleryImage key={url} src={url} alt="Foto da loja" />
                    ))}
                  </GalleryModalGrid>
                  <br/>
                </>
              )}

              <h3>Endereço</h3>
              <p>{businessData.address || 'Endereço não informado.'}</p>
              <br/>

              <h3>Horário de Funcionamento</h3>
              {businessData.workingHours ? (
                <ul>
                  {Object.entries(businessData.workingHours).map(([day, hours]) => (
                    <li key={day}>
                      <strong>{weekDaysMap[day]}:</strong> {hours.isOpen ? `${hours.start} - ${hours.end}` : 'Fechado'}
                    </li>
                  ))}
                </ul>
              ) : <p>Horários não informados.</p>}
            </DetailsContainer>
          )}
        </ContentWrapper>
      </PageContainer>
      
      <Modal isOpen={isBookingModalOpen} onClose={handleCloseBookingModal}>
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
            <DatePickerWrapper>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                minDate={new Date()}
              />
            </DatePickerWrapper>
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
    </ThemeProvider>
  );
}