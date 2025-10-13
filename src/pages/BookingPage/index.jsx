import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db, functions } from '../../services/firebaseConfig';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ThemeProvider } from 'styled-components';
import { 
  PageContainer, HeaderWrapper, Header, BusinessInfo, ContentWrapper, ServiceList, 
  ServiceCard, TimeSlotsGrid, TimeSlot, Footer, BookingPageTheme,
  GalleryModalGrid, GalleryImage,
  ServiceImage, ServiceContent // Novos imports
} from './styles';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import DatePicker from 'react-datepicker';
import { addMinutes } from 'date-fns';

const defaultTheme = {
  primaryColor: '#007bff',
  backgroundColor: '#f0f2f5',
  textColor: '#ffffff',
  hoverColor: '#0056b3'
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

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState('');

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

  const handleOpenGalleryModal = (service) => {
    if (service.gallery && service.gallery.length > 0) {
      setGalleryImages(service.gallery);
      setGalleryTitle(service.name);
      setIsGalleryModalOpen(true);
    } else {
      alert("Este serviço ainda não tem fotos na galeria.");
    }
  };

  if (loading) return <p>A carregar informações do estabelecimento...</p>;
  if (!businessData) return <p>Estabelecimento não encontrado.</p>;

  // URL de uma imagem placeholder para serviços sem galeria
  const placeholderImage = "https://via.placeholder.com/300x200.png/E9ECEF/6C757D?text=Servi%C3%A7o";

  return (
    <ThemeProvider theme={businessData.theme || defaultTheme}>
      <BookingPageTheme theme={businessData.theme || defaultTheme} />
      <PageContainer>
        <HeaderWrapper>
          <Header bgImage={businessData.bannerUrl} />
          <BusinessInfo>
            {businessData.logoUrl && <img src={businessData.logoUrl} alt="Logo" />}
            <h1>{businessData.businessName || 'Nome do Estabelecimento'}</h1>
          </BusinessInfo>
        </HeaderWrapper>

        <ContentWrapper>
          <h2>Os nossos Serviços</h2>
          <ServiceList>
            {services.map(service => (
              <ServiceCard key={service.id}>
                <ServiceImage 
                  src={(service.gallery && service.gallery.length > 0) ? service.gallery[0] : placeholderImage} 
                  alt={service.name} 
                />
                <ServiceContent>
                  <h3>{service.name}</h3>
                  <p>R$ {service.price.toFixed(2)} | {service.duration} minutos</p>
                  <div>
                    <Button onClick={() => handleOpenBookingModal(service)}>Agendar</Button>
                    {service.gallery && service.gallery.length > 0 && (
                      <Button onClick={() => handleOpenGalleryModal(service)} style={{backgroundColor: '#6c757d'}}>Galeria</Button>
                    )}
                  </div>
                </ServiceContent>
              </ServiceCard>
            ))}
          </ServiceList>
        </ContentWrapper>
      </PageContainer>
      
      <Footer>
        {businessData.address && <p>{businessData.address}</p>}
        {businessData.contactPhone && <p>Contacto: {businessData.contactPhone}</p>}
      </Footer>

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

      <Modal isOpen={isGalleryModalOpen} onClose={() => setIsGalleryModalOpen(false)}>
        <h2>Galeria de "{galleryTitle}"</h2>
        <GalleryModalGrid>
          {galleryImages.map(url => (
            <GalleryImage key={url} src={url} alt={`Foto do serviço ${galleryTitle}`} />
          ))}
        </GalleryModalGrid>
      </Modal>

    </ThemeProvider>
  );
}