import React, { useState, useEffect } from 'react';
import { 
  PageContainer, Form, Section, DayRow, DayLabel, TimeInput, UploadSection, ImagePreview, InputGroup, StyledTextArea
} from './styles';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { GalleryGrid, ImageContainer, DeleteButton, UploadLabel } from '../ServicesPage/styles';
import imageCompression from 'browser-image-compression';

const defaultWorkingHours = {
  segunda: { isOpen: true, start: '09:00', end: '18:00' },
  terca: { isOpen: true, start: '09:00', end: '18:00' },
  quarta: { isOpen: true, start: '09:00', end: '18:00' },
  quinta: { isOpen: true, start: '09:00', end: '18:00' },
  sexta: { isOpen: true, start: '09:00', end: '18:00' },
  sabado: { isOpen: false, start: '09:00', end: '18:00' },
  domingo: { isOpen: false, start: '09:00', end: '18:00' },
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

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!currentUser) return;
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const docSnap = await getDoc(businessDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessData(data);
        setWorkingHours(data.workingHours || defaultWorkingHours);
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
  }, [currentUser]);
  
  const handleHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
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
        
        // Atualiza o estado local para exibir a imagem imediatamente
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
      
      // Atualiza o estado local para remover a imagem imediatamente
      setAboutGallery(prev => prev.filter(url => url !== imageUrl));
      alert("Imagem apagada com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar imagem:", error);
      alert("Não foi possível apagar a imagem.");
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
              <DayLabel htmlFor={`check-${day}`}>{day.charAt(0).toUpperCase() + day.slice(1)}</DayLabel>
              <input
                type="checkbox"
                id={`check-${day}`}
                checked={workingHours[day]?.isOpen || false}
                onChange={(e) => handleHoursChange(day, 'isOpen', e.target.checked)}
              />
              <label style={{ marginLeft: '5px' }}>{workingHours[day]?.isOpen ? 'Aberto' : 'Fechado'}</label>
              <div>
                <TimeInput
                  type="time"
                  value={workingHours[day]?.start || '00:00'}
                  onChange={(e) => handleHoursChange(day, 'start', e.target.value)}
                  disabled={!workingHours[day]?.isOpen}
                />
                <span>até</span>
                <TimeInput
                  type="time"
                  value={workingHours[day]?.end || '00:00'}
                  onChange={(e) => handleHoursChange(day, 'end', e.target.value)}
                  disabled={!workingHours[day]?.isOpen}
                />
              </div>
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
            placeholder="Nº de telefone para contacto (ex: 11999998888)"
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