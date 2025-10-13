import React, { useState, useEffect } from "react";
import {
  PageContainer, FormSection, ServicesListSection, ServiceItem, ServiceInfo, ServiceActions, GalleryGrid, ImageContainer, DeleteButton, UploadLabel
} from "./styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { db, storage, functions } from "../../services/firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection, addDoc, onSnapshot, query, doc, deleteDoc, updateDoc, getDoc, arrayUnion, arrayRemove
} from "firebase/firestore";
import { ref, deleteObject, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';

export default function ServicesPage() {
  const { currentUser } = useAuth();
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [services, setServices] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedServiceForGallery, setSelectedServiceForGallery] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddService = async (event) => {
    event.preventDefault();
    const businessDocRef = doc(db, "businesses", currentUser.uid);
    const docSnap = await getDoc(businessDocRef);
    if (docSnap.exists()) {
      const businessData = docSnap.data();
      const planId = businessData.planId || 'free';
      if (planId === 'free' && services.length >= 10) {
        alert("Você atingiu o limite de 10 serviços para o Plano Grátis. Faça um upgrade para adicionar mais!");
        return;
      }
    }
    if (!serviceName || !servicePrice || !serviceDuration) {
      return alert("Por favor, preencha todos os campos.");
    }
    try {
      const servicesCollectionRef = collection(db, "businesses", currentUser.uid, "services");
      await addDoc(servicesCollectionRef, {
        name: serviceName,
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration),
        gallery: [],
      });
      alert("Serviço adicionado com sucesso!");
      setServiceName(""); setServicePrice(""); setServiceDuration("");
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
      alert("Não foi possível adicionar o serviço.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Tem certeza que deseja apagar este serviço?")) return;
    try {
      const serviceDocRef = doc(db, "businesses", currentUser.uid, "services", serviceId);
      await deleteDoc(serviceDocRef);
      alert("Serviço apagado com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar serviço:", error);
      alert("Não foi possível apagar o serviço.");
    }
  };

  const handleUpdateService = async (event) => {
    event.preventDefault();
    if (!editingService) return;
    const { name, price, duration } = event.target.elements;
    try {
      const serviceDocRef = doc(db, "businesses", currentUser.uid, "services", editingService.id);
      await updateDoc(serviceDocRef, {
        name: name.value,
        price: parseFloat(price.value),
        duration: parseInt(duration.value),
      });
      alert("Serviço atualizado com sucesso!");
      setIsEditModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      alert("Não foi possível atualizar o serviço.");
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const servicesCollectionRef = collection(db, "businesses", currentUser.uid, "services");
    const q = query(servicesCollectionRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleOpenGallery = (service) => {
    setSelectedServiceForGallery(service);
    setIsGalleryModalOpen(true);
  };
  
  const handleImageUpload = async (event) => {
    if (!selectedServiceForGallery || !currentUser) return;
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const serviceDocRef = doc(db, "businesses", currentUser.uid, "services", selectedServiceForGallery.id);
    
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const idToken = await currentUser.getIdToken();

      for (const file of files) {
        const compressedFile = await imageCompression(file, options);
        
        const imageId = `${Date.now()}-${compressedFile.name}`;
        const filePath = `businesses/${currentUser.uid}/services/${selectedServiceForGallery.id}/${imageId}`;

        const result = await fetch('https://us-central1-agendapro-web.cloudfunctions.net/generateUploadUrl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            data: {
              filePath: filePath,
              contentType: compressedFile.type
            }
          })
        });

        if (!result.ok) {
          throw new Error('Falha ao obter a URL de upload.');
        }

        const { data } = await result.json();
        const { signedUrl } = data;

        await fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': compressedFile.type },
            body: compressedFile,
        });

        const storageRef = ref(storage, filePath);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(serviceDocRef, {
            gallery: arrayUnion(downloadURL)
        });
      }
      alert("Imagens adicionadas com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload de imagens:", error);
      alert("Ocorreu um erro ao enviar as imagens.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleImageDelete = async (imageUrl) => {
    if (!selectedServiceForGallery || !window.confirm("Tem certeza que deseja apagar esta imagem?")) return;
    try {
      const serviceDocRef = doc(db, "businesses", currentUser.uid, "services", selectedServiceForGallery.id);
      await updateDoc(serviceDocRef, {
        gallery: arrayRemove(imageUrl)
      });
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      alert("Imagem apagada com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar imagem:", error);
      alert("Não foi possível apagar a imagem.");
    }
  };

  return (
    <PageContainer>
      <FormSection>
        <h2>Adicionar Novo Serviço</h2>
        <form onSubmit={handleAddService}>
          <Input placeholder="Nome do Serviço" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
          <Input type="number" placeholder="Preço (ex: 30.50)" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} />
          <Input type="number" placeholder="Duração em minutos (ex: 30)" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} />
          <Button type="submit">Adicionar Serviço</Button>
        </form>
      </FormSection>

      <ServicesListSection>
        <h2>Meus Serviços</h2>
        {services.length === 0 ? (
          <p>Você ainda não cadastrou nenhum serviço.</p>
        ) : (
          services.map((service) => (
            <ServiceItem key={service.id}>
              <ServiceInfo>
                <strong>{service.name}</strong>
                <p>Preço: R$ {service.price.toFixed(2)} | Duração: {service.duration} min</p>
              </ServiceInfo>
              <ServiceActions>
                <Button onClick={() => handleOpenGallery(service)}>Galeria</Button>
                <Button onClick={() => { setEditingService(service); setIsEditModalOpen(true); }}>Editar</Button>
                <Button danger onClick={() => handleDeleteService(service.id)}>Apagar</Button>
              </ServiceActions>
            </ServiceItem>
          ))
        )}
      </ServicesListSection>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        {editingService && (
          <form onSubmit={handleUpdateService}>
            <h2>Editar Serviço</h2>
            <Input name="name" defaultValue={editingService.name} placeholder="Nome do Serviço" />
            <Input name="price" type="number" defaultValue={editingService.price} placeholder="Preço" />
            <Input name="duration" type="number" defaultValue={editingService.duration} placeholder="Duração em minutos" />
            <div style={{ marginTop: '20px' }}>
              <Button type="submit" style={{ marginRight: '10px' }}>Salvar Alterações</Button>
              <Button type="button" danger onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isGalleryModalOpen} onClose={() => setIsGalleryModalOpen(false)}>
        {selectedServiceForGallery && (
          <div>
            <h2>Galeria de "{selectedServiceForGallery.name}"</h2>
            <p>Adicione ou remova as fotos que representam este serviço.</p>
            
            <GalleryGrid>
              {selectedServiceForGallery.gallery?.map((imageUrl) => (
                <ImageContainer key={imageUrl}>
                  <img src={imageUrl} alt="Foto do serviço" />
                  <DeleteButton onClick={() => handleImageDelete(imageUrl)}>X</DeleteButton>
                </ImageContainer>
              ))}
            </GalleryGrid>

            <UploadLabel htmlFor="image-upload">{isUploading ? 'A enviar...' : 'Adicionar Imagens'}</UploadLabel>
            <input 
              id="image-upload"
              type="file" 
              multiple 
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}