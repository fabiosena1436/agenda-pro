import React, { useState, useEffect } from 'react';
import { 
  PageContainer, Form, Section, DayRow, DayLabel, TimeInput, UploadSection, ImagePreview, InputGroup, StyledTextArea,
  BlockedTimeCard, BlockedTimeHeader, BlockedTimeActions,
  IntervalsContainer, IntervalRow, AddButton, RemoveButton
} from './styles';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, onSnapshot, addDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { GalleryGrid, ImageContainer, DeleteButton, UploadLabel } from '../ServicesPage/styles';
import imageCompression from 'browser-image-compression';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const defaultWorkingHours = {
  segunda: { isOpen: true, intervals: [{ start: '09:00', end: '18:00' }] },
  terca: { isOpen: true, intervals: [{ start: '09:00', end: '18:00' }] },
  quarta: { isOpen: true, intervals: [{ start: '09:00', end: '18:00' }] },
  quinta: { isOpen: true, intervals: [{ start: '09:00', end: '18:00' }] },
  sexta: { isOpen: true, intervals: [{ start: '09:00', end: '18:00' }] },
  sabado: { isOpen: false, intervals: [] },
  domingo: { isOpen: false, intervals: [] },
};

const defaultTheme = {
  primaryColor: '#007bff',
  backgroundColor: '#f8f9fa',
  textColor: '#ffffff',
};
const weekDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

export default function SettingsPage() {
  const { currentUser } = useAuth();
  
  const [workingHours, setWorkingHours] = useState(defaultWorkingHours);
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [theme, setTheme] = useState(defaultTheme);
  const [businessData, setBusinessData] = useState(null);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutGallery, setAboutGallery] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [blockDate, setBlockDate] = useState(new Date());
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchBusinessData = async () => {
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const docSnap = await getDoc(businessDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessData(data);
        const loadedHours = data.workingHours || defaultWorkingHours;
        Object.keys(loadedHours).forEach(day => {
          if (!loadedHours[day].intervals) {
            loadedHours[day].intervals = loadedHours[day].start ? [{start: loadedHours[day].start, end: loadedHours[day].end}] : [];
          }
        });
        setWorkingHours(loadedHours);
        setAddress(data.address || '');
        setContactPhone(data.contactPhone || '');
        setTheme(data.theme || defaultTheme);
        setInstagramUrl(data.instagramUrl || '');
        setWhatsappLink(data.whatsappLink || '');
        setAboutDescription(data.aboutDescription || '');
        setAboutGallery(data.aboutGallery || []);
      }
    };
    fetchBusinessData();

    const blockagesCollectionRef = collection(db, 'businesses', currentUser.uid, 'blockages');
    const q = query(blockagesCollectionRef, orderBy('startTime', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blockagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
      }));
      setBlockedTimes(blockagesData);
    });

    return () => unsubscribe();

  }, [currentUser]);
  
  const handleHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleIntervalChange = (day, index, field, value) => {
    const newWorkingHours = { ...workingHours };
    newWorkingHours[day].intervals[index][field] = value;
    setWorkingHours(newWorkingHours);
  };

  const addInterval = (day) => {
    const newWorkingHours = { ...workingHours };
    newWorkingHours[day].intervals.push({ start: '09:00', end: '18:00' });
    setWorkingHours(newWorkingHours);
  };

  const removeInterval = (day, index) => {
    const newWorkingHours = { ...workingHours };
    newWorkingHours[day].intervals.splice(index, 1);
    setWorkingHours(newWorkingHours);
  };

  const handleThemeChange = (color, value) => {
    setTheme(prev => ({ ...prev, [color]: value }));
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    if (!currentUser) return;
    try {
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const dataToSave = {
        workingHours,
        address,
        contactPhone,
        theme,
        instagramUrl,
        whatsappLink,
        aboutDescription,
      };
      await setDoc(businessDocRef, dataToSave, { merge: true });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert('Não foi possível salvar as configurações.');
    }
  };

  const handleImageUpload = async (event, imageType) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    const storageRef = ref(storage, `businesses/${currentUser.uid}/${imageType}`);
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024 });
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const fieldToUpdate = imageType === 'logo' ? 'logoUrl' : 'bannerUrl';
      await setDoc(businessDocRef, { [fieldToUpdate]: downloadURL }, { merge: true });
      alert(`Imagem do ${imageType} atualizada com sucesso!`);
      setBusinessData(prev => ({...prev, [fieldToUpdate]: downloadURL}));
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      alert("Não foi possível enviar a imagem. Verifique as configurações de CORS do seu Storage.");
    }
  };
  
  const handleAboutGalleryUpload = async (event) => {
    if (!currentUser) return;
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const businessDocRef = doc(db, "businesses", currentUser.uid);
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true };

    try {
      for (const file of files) {
        const compressedFile = await imageCompression(file, options);
        const imageId = `${Date.now()}-${compressedFile.name}`;
        const storageRef = ref(storage, `businesses/${currentUser.uid}/about_gallery/${imageId}`);
        
        await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(businessDocRef, {
          aboutGallery: arrayUnion(downloadURL)
        });
        
        setAboutGallery(prev => [...prev, downloadURL]);
      }
      alert("Imagens adicionadas à galeria da loja!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Ocorreu um erro ao enviar as imagens.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAboutImageDelete = async (imageUrl) => {
    if (!currentUser || !window.confirm("Tem certeza que deseja apagar esta imagem?")) return;
    try {
      const businessDocRef = doc(db, "businesses", currentUser.uid);
      await updateDoc(businessDocRef, {
        aboutGallery: arrayRemove(imageUrl)
      });
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      
      setAboutGallery(prev => prev.filter(url => url !== imageUrl));
      alert("Imagem apagada com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar imagem:", error);
      alert("Não foi possível apagar a imagem.");
    }
  };

  const handleAddBlockage = async (e) => {
    e.preventDefault();
    if (!blockDate || !blockStartTime || !blockEndTime) {
      return alert("Por favor, preencha a data e os horários de início e fim.");
    }

    const [startH, startM] = blockStartTime.split(':').map(Number);
    const [endH, endM] = blockEndTime.split(':').map(Number);

    const startTime = new Date(blockDate);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(blockDate);
    endTime.setHours(endH, endM, 0, 0);

    if (startTime >= endTime) {
      return alert("O horário de início deve ser anterior ao horário de fim.");
    }
    
    try {
      const blockagesCollectionRef = collection(db, "businesses", currentUser.uid, "blockages");
      await addDoc(blockagesCollectionRef, {
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        reason: blockReason || 'Horário Bloqueado',
      });
      alert("Horário bloqueado com sucesso!");
      setBlockStartTime('');
      setBlockEndTime('');
      setBlockReason('');
    } catch (error) {
      console.error("Erro ao bloquear horário:", error);
      alert("Não foi possível bloquear o horário.");
    }
  };

  const handleDeleteBlockage = async (blockageId) => {
    if (!window.confirm("Tem certeza que deseja remover este bloqueio?")) return;
    try {
      const blockageDocRef = doc(db, "businesses", currentUser.uid, "blockages", blockageId);
      await deleteDoc(blockageDocRef);
      alert("Bloqueio removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover bloqueio:", error);
      alert("Não foi possível remover o bloqueio.");
    }
  };

  return (
    <PageContainer>
      <h1>Configurações do Negócio</h1>
      
      <Form onSubmit={handleSaveSettings}>
        <Section>
          <h2>Horário de Funcionamento</h2>
          {weekDays.map(day => (
            <DayRow key={day}>
              <div style={{display: 'flex', alignItems: 'center', width: '150px'}}>
                <DayLabel htmlFor={`check-${day}`}>{day.charAt(0).toUpperCase() + day.slice(1)}</DayLabel>
                <input
                  type="checkbox"
                  id={`check-${day}`}
                  checked={workingHours[day]?.isOpen || false}
                  onChange={(e) => handleHoursChange(day, 'isOpen', e.target.checked)}
                />
              </div>
              
              <IntervalsContainer>
                {workingHours[day]?.isOpen ? (
                  <>
                    {workingHours[day].intervals && workingHours[day].intervals.map((interval, index) => (
                      <IntervalRow key={index}>
                        <TimeInput
                          type="time"
                          value={interval.start}
                          onChange={(e) => handleIntervalChange(day, index, 'start', e.target.value)}
                        />
                        <span>até</span>
                        <TimeInput
                          type="time"
                          value={interval.end}
                          onChange={(e) => handleIntervalChange(day, index, 'end', e.target.value)}
                        />
                        <RemoveButton type="button" onClick={() => removeInterval(day, index)}>–</RemoveButton>
                      </IntervalRow>
                    ))}
                    <AddButton type="button" onClick={() => addInterval(day)}>+ Adicionar intervalo</AddButton>
                  </>
                ) : (
                   <span>Fechado</span>
                )}
              </IntervalsContainer>
            </DayRow>
          ))}
        </Section>

        <Section>
          <h2>Dados e Redes Sociais</h2>
          <Input 
            placeholder="Endereço do seu estabelecimento"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input 
            placeholder="Nº de telefone para contacto (ex: 5511999998888)"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <Input 
            placeholder="Link completo do seu perfil no Instagram (ex: https://instagram.com/seu_usuario)"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
          <Input 
            placeholder="Link do WhatsApp para contacto (ex: https://wa.me/5511999998888)"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
          />
        </Section>

        <Section>
          <h2>Aparência da Página</h2>
          <p>Personalize as cores da sua página de agendamento.</p>
          <InputGroup>
            <div>
              <label>Cor Principal:</label>
              <input type="color" value={theme.primaryColor} onChange={(e) => handleThemeChange('primaryColor', e.target.value)} />
            </div>
            <div>
              <label>Cor do Texto:</label>
              <input type="color" value={theme.textColor} onChange={(e) => handleThemeChange('textColor', e.target.value)} />
            </div>
            <div>
              <label>Cor de Fundo:</label>
              <input type="color" value={theme.backgroundColor} onChange={(e) => handleThemeChange('backgroundColor', e.target.value)} />
            </div>
          </InputGroup>
        </Section>

        <Button type="submit" style={{ marginTop: '20px', width: '100%' }}>Salvar Alterações</Button>
      </Form>

      <Section style={{marginTop: '30px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}>
        <h2>Bloquear Horários na Agenda</h2>
        <p>Adicione bloqueios para compromissos únicos.</p>
        <Form onSubmit={handleAddBlockage}>
            <div style={{display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
              <DatePicker selected={blockDate} onChange={(date) => setBlockDate(date)} dateFormat="dd/MM/yyyy" />
              <TimeInput type="time" value={blockStartTime} onChange={e => setBlockStartTime(e.target.value)} required />
              <span>até</span>
              <TimeInput type="time" value={blockEndTime} onChange={e => setBlockEndTime(e.target.value)} required />
              <Input placeholder="Motivo (opcional)" value={blockReason} onChange={e => setBlockReason(e.target.value)} style={{flex: 1, marginBottom: 0}} />
            </div>
            <Button type="submit" style={{marginTop: '20px'}}>Bloquear Horário</Button>
        </Form>
        <hr style={{margin: '30px 0'}}/>
        <h3>Horários Bloqueados</h3>
        {blockedTimes.length > 0 ? (
          blockedTimes.map(block => (
            <BlockedTimeCard key={block.id}>
              <BlockedTimeHeader>
                <strong>{block.reason}</strong>
                <span>{block.startTime.toLocaleDateString('pt-BR')}</span>
              </BlockedTimeHeader>
              <p>
                Das {block.startTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} 
                às {block.endTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
              </p>
              <BlockedTimeActions>
                <Button danger onClick={() => handleDeleteBlockage(block.id)}>Remover</Button>
              </BlockedTimeActions>
            </BlockedTimeCard>
          ))
        ) : (
          <p>Nenhum horário bloqueado.</p>
        )}
      </Section>

      <UploadSection>
        <h2>Sobre o seu Negócio</h2>
        <p>Escreva uma descrição e adicione fotos do seu espaço ou dos seus melhores trabalhos para aparecer na aba "Detalhes" da sua página.</p>
        <StyledTextArea 
          placeholder="Fale um pouco sobre o seu negócio, sua história e o que você oferece..."
          value={aboutDescription}
          onChange={(e) => setAboutDescription(e.target.value)}
        />
        <Button type="button" onClick={handleSaveSettings} style={{marginBottom: '30px'}}>Salvar Descrição</Button>

        <h4>Galeria de Fotos da Loja</h4>
        <GalleryGrid>
          {aboutGallery.map((url) => (
            <ImageContainer key={url}>
              <img src={url} alt="Foto da loja" />
              <DeleteButton onClick={() => handleAboutImageDelete(url)}>X</DeleteButton>
            </ImageContainer>
          ))}
        </GalleryGrid>
        <UploadLabel htmlFor="about-gallery-upload">{isUploading ? 'A enviar...' : 'Adicionar Fotos'}</UploadLabel>
        <input 
          id="about-gallery-upload"
          type="file" 
          multiple 
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAboutGalleryUpload}
          disabled={isUploading}
        />
      </UploadSection>

      <UploadSection>
        <h2>Imagens da Marca</h2>
        <div style={{ marginBottom: '20px' }}>
          <h4>Logo do Negócio</h4>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
          {businessData?.logoUrl && <ImagePreview src={businessData.logoUrl} alt="Prévia do Logo" />}
        </div>
        <div>
          <h4>Banner da Página</h4>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
          {businessData?.bannerUrl && <ImagePreview src={businessData.bannerUrl} alt="Prévia do Banner" />}
        </div>
      </UploadSection>
    </PageContainer>
  );
}