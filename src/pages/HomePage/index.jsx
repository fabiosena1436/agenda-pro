import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { db, functions } from '../../services/firebaseConfig';
import { collection, query, getDocs, addDoc, Timestamp, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import Modal from '../../components/Modal';
import DatePicker from 'react-datepicker';
import { addMinutes } from 'date-fns';
import { FaWhatsapp, FaInstagram, FaCheck } from 'react-icons/fa';
import ImageGallery from 'react-image-gallery';
import { FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink, scroller } from 'react-scroll';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom'; // NOVIDADE: Importar useNavigate

import {
  PageContainer,
  HeaderWrapper,
  Header,
  BusinessInfo,
  SocialLinks,
  ContentWrapper,
  Section,
  SectionTitle,
  SearchBar,
  ServiceList,
  ServiceCard,
  ServiceImage,
  ServiceInfo,
  ServiceCardActions,
  TimeInfo,
  DetailsContainer,
  TimeSlotsGrid,
  TimeSlot,
  GalleryModalGrid,
  GalleryImage,
  DatePickerWrapper,
  BookingForm,
  Input,
  Button, // NOVIDADE: Importar Button
  ButtonGroup,
  ConfirmationWrapper,
  ConfirmationCard,
  SuccessIcon,
  ConfirmationHeader,
  ConfirmationMessage,
  BookingDetails,
  DetailItem,
  Navbar
} from './styles';

// Componente de Navegação
const Navigation = () => (
  <Navbar>
    <ScrollLink to="about" smooth={true} duration={500} offset={-80}>Sobre Nós</ScrollLink>
    <ScrollLink to="gallery" smooth={true} duration={500} offset={-80}>Galeria</ScrollLink>
    <ScrollLink to="services" smooth={true} duration={500} offset={-80}>Serviços</ScrollLink>
  </Navbar>
);

export default function HomePage() {
  const navigate = useNavigate(); // NOVIDADE: Inicializar useNavigate
  const [businessData, setBusinessData] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isServiceGalleryOpen, setIsServiceGalleryOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const handleOpenLightbox = (index) => {
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleSelectService = (service) => {
    setServiceDetails(service);
    scroller.scrollTo('details', { 
      duration: 800, 
      delay: 0, 
      smooth: 'easeInOutQuart',
      offset: -100
    });
  };

  const handleOpenBookingModal = (service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      setLoading(true);
      try {
        const businessesRef = collection(db, 'businesses');
        // Buscamos o primeiro negócio da coleção
        const q = query(businessesRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setBusinessData(null);
          toast.error("Nenhum negócio encontrado.");
        } else {
          const businessDoc = querySnapshot.docs[0];
          setBusinessId(businessDoc.id);
          setBusinessData({ ...businessDoc.data() });

          const servicesRef = collection(db, 'businesses', businessDoc.id, 'services');
          const servicesSnapshot = await getDocs(servicesRef);
          const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do negócio:", error);
        toast.error("Erro ao carregar dados do negócio.");
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessInfo();
  }, []);

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const businessGalleryImages = useMemo(() => {
    if (!businessData?.aboutGallery || businessData.aboutGallery.length === 0) return [];
    return businessData.aboutGallery.map(url => ({
      original: url,
      thumbnail: url,
    }));
  }, [businessData]);

  const serviceDetailsGalleryImages = useMemo(() => {
    if (!serviceDetails?.gallery || serviceDetails.gallery.length === 0) return [];
    return serviceDetails.gallery.map(url => ({
      original: url,
      thumbnail: url,
    }));
  }, [serviceDetails]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedService || !selectedDate || !businessId) return;
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const calculateAvailableSlots = httpsCallable(functions, 'calculateAvailableSlots');
      const result = await calculateAvailableSlots({
        businessId: businessId,
        serviceId: selectedService.id,
        selectedDate: selectedDate.toISOString(),
      });
      const slotsAsDates = result.data.availableSlots.map(slot => new Date(slot));
      setAvailableSlots(slotsAsDates);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      toast.error("Não foi possível carregar os horários. Tente novamente.");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedService, businessId]);

  useEffect(() => {
    if (isBookingModalOpen) {
      fetchAvailableSlots();
    }
  }, [fetchAvailableSlots, isBookingModalOpen]);

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
    setSelectedSlot(null);
    setClientName('');
    setClientPhone('');
    setSelectedDate(new Date());
  };
  
  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setBookingDetails(null);
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    if (!selectedSlot || !clientName || !clientPhone) {
      return toast.warn("Por favor, preencha todos os dados.");
    }
    setIsBooking(true);
    try {
      const appointmentsRef = collection(db, 'businesses', businessId, 'appointments');
      const docRef = await addDoc(appointmentsRef, {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        clientName,
        clientPhone,
        startTime: Timestamp.fromDate(selectedSlot),
        endTime: Timestamp.fromDate(addMinutes(selectedSlot, selectedService.duration)),
        status: 'confirmed',
        duration: selectedService.duration
      });
      
      setBookingDetails({
        id: docRef.id,
        serviceName: selectedService.name,
        clientName: clientName,
        date: selectedSlot.toLocaleDateString('pt-BR'),
        time: selectedSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      
      handleCloseBookingModal();
      setIsConfirmationOpen(true);

    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      toast.error("Não foi possível confirmar o agendamento.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleRegisterClick = () => { // NOVIDADE: Função para navegar para a página de registo
    navigate('/register');
  };

  if (loading) return <p>A carregar...</p>;
  if (!businessData) return <p>Estabelecimento não encontrado.</p>;
  
  const whatsAppNumber = businessData?.contactPhone ? cleanPhoneNumber(businessData.contactPhone) : '';
  const whatsAppMessage = bookingDetails ? encodeURIComponent(
    `Olá! Acabei de confirmar meu agendamento.\n\n` +
    `*Serviço:* ${bookingDetails.serviceName}\n` +
    `*Cliente:* ${bookingDetails.clientName}\n` +
    `*Data:* ${bookingDetails.date}\n` +
    `*Hora:* ${bookingDetails.time}`
  ) : '';
  const whatsAppLink = `https://wa.me/${whatsAppNumber}?text=${whatsAppMessage}`;

  return (
    <PageContainer>
      <Navigation />
      <HeaderWrapper>
        <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1>{businessData.name}</h1>
          <p>{businessData.slogan}</p>
          {/* NOVIDADE: Botão que incentiva o novo utilizador a registar */}
          <Button 
            className="primary" 
            onClick={handleRegisterClick} 
            style={{ marginTop: '2rem', padding: '15px 30px', fontSize: '1.2rem' }}
          >
            Crie a Sua Agenda Agora
          </Button>
        </Header>
      </HeaderWrapper>

      <BusinessInfo $bannerUrl={businessData?.bannerUrl}>
        <img src={businessData.logoUrl} alt="Logo" style={{ width: 120, height: 120, borderRadius: '50%', marginTop: '-80px', border: '5px solid white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
        <h2>{businessData.name}</h2>
        <p>{businessData.address}</p>
        <SocialLinks>
          {businessData.whatsappLink && (
            <a href={businessData.whatsappLink} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
          )}
          {businessData.instagramUrl && (
            <a href={businessData.instagramUrl} target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          )}
        </SocialLinks>
      </BusinessInfo>

      <ContentWrapper>
        <Section id="about">
          <SectionTitle>Sobre Nós</SectionTitle>
          <DetailsContainer>
            {businessData.aboutDescription ? <p>{businessData.aboutDescription}</p> : <p>Informações sobre o negócio não disponíveis.</p>}
          </DetailsContainer>
        </Section>

        <Section id="gallery">
          <SectionTitle>Nossa Galeria</SectionTitle>
          <DetailsContainer>
            {businessGalleryImages.length > 0 ? (
              <GalleryModalGrid>
                {businessGalleryImages.map((image, index) => (
                  <GalleryImage
                    key={image.original}
                    src={image.thumbnail}
                    alt={image.thumbnailAlt}
                    onClick={() => handleOpenLightbox(index)}
                  />
                ))}
              </GalleryModalGrid>
            ) : <p>Galeria de fotos não disponível.</p>}
          </DetailsContainer>
        </Section>

        <Section id="services">
          <SectionTitle>Serviços</SectionTitle>
          <SearchBar
            type="text"
            placeholder="Pesquisar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ServiceList>
            {filteredServices.map(service => (
              <ServiceCard key={service.id} whileHover={{ y: -5 }}>
                <ServiceImage src={service.gallery && service.gallery.length > 0 ? service.gallery[0] : 'https://via.placeholder.com/300x180.png/eee/ccc?text=Serviço'} alt={service.name} />
                <ServiceInfo>
                  <h3>{service.name}</h3>
                  <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}</p>
                  <TimeInfo>
                    <FiClock />
                    <span>{service.duration}min</span>
                  </TimeInfo>
                  <ServiceCardActions>
                    <Button className="primary" onClick={() => handleSelectService(service)}>Ver Detalhes</Button>
                  </ServiceCardActions>
                </ServiceInfo>
              </ServiceCard>
            ))}
          </ServiceList>
        </Section>

        {serviceDetails && (
          <Section id="details">
            <SectionTitle>Detalhes de "{serviceDetails.name}"</SectionTitle>
            <DetailsContainer>
              <p>{serviceDetails.description || "Descrição não disponível."}</p>
              {serviceDetailsGalleryImages.length > 0 && (
                <ImageGallery
                  items={serviceDetailsGalleryImages}
                  showPlayButton={false}
                  showFullscreenButton={true}
                  useBrowserFullscreen={false}
                  showThumbnails={true}
                  showNav={true}
                />
              )}
              <ButtonGroup style={{ justifyContent: 'center', marginTop: '2rem' }}>
                <Button className="primary" onClick={() => handleOpenBookingModal(serviceDetails)}>Agendar Horário</Button>
              </ButtonGroup>
            </DetailsContainer>
          </Section>
        )}

      </ContentWrapper>

      {/* Modals */}
      <AnimatePresence>
        {isServiceGalleryOpen && (
          <Modal isOpen={isServiceGalleryOpen} onClose={handleCloseServiceGallery} size="large">
            <h2>Galeria de "{selectedService?.name}"</h2>
            {serviceGalleryImages.length > 0 ? (
              <ImageGallery
                items={serviceGalleryImages}
                showPlayButton={false}
                showFullscreenButton={true}
                useBrowserFullscreen={false}
                showThumbnails={true}
                showNav={true}
              />
            ) : (
              <p>Este serviço ainda não tem fotos na galeria.</p>
            )}
            <ButtonGroup style={{ justifyContent: 'center', marginTop: '2rem' }}>
              <Button className="primary" onClick={handleProceedToBooking}>Agendar Horário</Button>
            </ButtonGroup>
          </Modal>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modal isOpen={isBookingModalOpen} onClose={handleCloseBookingModal}>
              <h2>Agendar {selectedService?.name}</h2>
              <hr style={{ margin: '15px 0' }} />
              {selectedSlot ? (
                <BookingForm onSubmit={handleBooking}>
                  <h4>Confirmar Agendamento</h4>
                  <p><strong>Serviço:</strong> {selectedService?.name}</p>
                  <p><strong>Data:</strong> {selectedSlot.toLocaleDateString()}</p>
                  <p><strong>Horário:</strong> {selectedSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <br/>
                  <Input type="text" placeholder="O seu nome completo" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                  <Input type="text" placeholder="O seu telemóvel (WhatsApp)" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
                  <ButtonGroup>
                    <Button type="button" className="secondary" onClick={() => setSelectedSlot(null)}>Voltar</Button>
                    <Button type="submit" className="primary" disabled={isBooking}>{isBooking ? 'A agendar...' : 'Confirmar'}</Button>
                  </ButtonGroup>
                </BookingForm>
              ) : (
                <>
                  <p>Selecione uma data:</p>
                  <DatePickerWrapper>
                    <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} inline minDate={new Date()} />
                  </DatePickerWrapper>
                  <h3>Horários Disponíveis:</h3>
                  {loadingSlots ? (
                      <p>A procurar horários...</p>
                  ) : (
                      <TimeSlotsGrid>
                      {availableSlots.length > 0 ? (
                          availableSlots.map(slot => (
                          <TimeSlot key={slot.toISOString()} onClick={() => setSelectedSlot(slot)} selected={selectedSlot && selectedSlot.toISOString() === slot.toISOString()}>
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmationOpen && (
          <Modal isOpen={isConfirmationOpen} onClose={handleCloseConfirmation}>
            <ConfirmationWrapper initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <ConfirmationCard>
                <SuccessIcon initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                  <FaCheck />
                </SuccessIcon>
                <ConfirmationHeader>Agendamento Confirmado!</ConfirmationHeader>
                <ConfirmationMessage>O seu horário foi marcado com sucesso. Vemo-nos em breve!</ConfirmationMessage>
                {bookingDetails && (
                  <BookingDetails>
                    <DetailItem><span>Serviço:</span><span>{bookingDetails.serviceName}</span></DetailItem>
                    <DetailItem><span>Data:</span><span>{bookingDetails.date}</span></DetailItem>
                    <DetailItem><span>Hora:</span><span>{bookingDetails.time}</span></DetailItem>
                  </BookingDetails>
                )}
                {whatsAppNumber && (
                    <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
                        <Button style={{marginTop: '1.5rem', width: '100%', backgroundColor: '#25D366'}}>
                            <FaWhatsapp style={{marginRight: '8px'}}/> Notificar no WhatsApp
                        </Button>
                    </a>
                )}
                <ButtonGroup>
                    <Button style={{marginTop: '1rem', width: '100%'}} className='secondary' onClick={handleCloseConfirmation}> Fechar</Button>
                </ButtonGroup>
              </ConfirmationCard>
            </ConfirmationWrapper>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLightboxOpen && (
          <Modal isOpen={isLightboxOpen} onClose={handleCloseLightbox} size="large">
            <ImageGallery
              items={businessGalleryImages}
              startIndex={lightboxStartIndex}
              showPlayButton={false}
              showFullscreenButton={true}
              useBrowserFullscreen={false}
              showThumbnails={true}
              showNav={true}
            />
          </Modal>
        )}
      </AnimatePresence>
      <Footer workingHours={businessData.workingHours} address={businessData.address} />
    </PageContainer>
  );
}