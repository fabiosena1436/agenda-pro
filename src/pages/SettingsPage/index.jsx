import React, { useState, useEffect } from 'react';
import { PageContainer, Form, DayRow, DayLabel, TimeInput, UploadSection, ImagePreview } from './styles';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Button from '../../components/Button';

const defaultWorkingHours = {
  segunda: { isOpen: true, start: '09:00', end: '18:00' },
  terca: { isOpen: true, start: '09:00', end: '18:00' },
  quarta: { isOpen: true, start: '09:00', end: '18:00' },
  quinta: { isOpen: true, start: '09:00', end: '18:00' },
  sexta: { isOpen: true, start: '09:00', end: '18:00' },
  sabado: { isOpen: false, start: '09:00', end: '18:00' },
  domingo: { isOpen: false, start: '09:00', end: '18:00' },
};
const weekDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [workingHours, setWorkingHours] = useState(defaultWorkingHours);
  const [businessData, setBusinessData] = useState(null); // Estado para guardar todos os dados do negócio

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!currentUser) return;
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const docSnap = await getDoc(businessDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessData(data);
        if (data.workingHours) {
          setWorkingHours(data.workingHours);
        }
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

  const handleSaveHours = async (event) => {
    event.preventDefault();
    if (!currentUser) return;
    
    try {
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      await setDoc(businessDocRef, { workingHours }, { merge: true });
      alert('Horários salvos com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      alert('Não foi possível salvar os horários.');
    }
  };

  const handleImageUpload = async (event, imageType) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    const storageRef = ref(storage, `businesses/${currentUser.uid}/${imageType}`);
    
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const fieldToUpdate = imageType === 'logo' ? 'logoUrl' : 'bannerUrl';
      await setDoc(businessDocRef, { [fieldToUpdate]: downloadURL }, { merge: true });

      alert(`Imagem do ${imageType} atualizada com sucesso!`);
      // Atualiza o estado local para mostrar a prévia imediatamente
      setBusinessData(prev => ({...prev, [fieldToUpdate]: downloadURL}));
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      alert("Não foi possível enviar a imagem.");
    }
  };

  return (
    <PageContainer>
      <h1>Configurações do Negócio</h1>
      <br/>
      <Form onSubmit={handleSaveHours}>
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
        <Button type="submit" style={{ marginTop: '20px' }}>Salvar Horários</Button>
      </Form>

      <UploadSection>
        <h2>Personalizar Aparência</h2>
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