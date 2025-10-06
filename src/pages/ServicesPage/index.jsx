// src/pages/ServicesPage/index.jsx

import React, { useState, useEffect } from "react";
import {
  PageContainer,
  FormSection,
  ServicesListSection,
  ServiceItem,
} from "./styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { db } from "../../services/firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
  getDoc, // Importamos o 'getDoc' para ler um documento específico
} from "firebase/firestore";

export default function ServicesPage() {
  const { currentUser } = useAuth();

  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // CREATE: Função para adicionar um novo serviço
  const handleAddService = async (event) => {
    event.preventDefault();

    // --- VALIDAÇÃO DO PLANO ---
    // Buscamos os dados do negócio para saber qual é o plano atual
    const businessDocRef = doc(db, "businesses", currentUser.uid);
    const docSnap = await getDoc(businessDocRef);

    if (docSnap.exists()) {
      const businessData = docSnap.data();
      const planId = businessData.planId || 'free';

      // Verificamos se o plano é 'free' e se a quantidade de serviços já atingiu o limite
      if (planId === 'free' && services.length >= 10) {
        alert("Você atingiu o limite de 10 serviços para o Plano Grátis. Faça um upgrade para adicionar mais!");
        return; // A função para aqui
      }
    }
    // --- FIM DA VALIDAÇÃO ---

    if (!serviceName || !servicePrice || !serviceDuration) {
      return alert("Por favor, preencha todos os campos.");
    }

    try {
      const servicesCollectionRef = collection(db, "businesses", currentUser.uid, "services");
      await addDoc(servicesCollectionRef, {
        name: serviceName,
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration),
      });

      alert("Serviço adicionado com sucesso!");
      setServiceName("");
      setServicePrice("");
      setServiceDuration("");
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
      alert("Não foi possível adicionar o serviço.");
    }
  };

  // DELETE: Função para apagar um serviço
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Tem certeza que deseja apagar este serviço?")) {
      return;
    }
    try {
      const serviceDocRef = doc(db, "businesses", currentUser.uid, "services", serviceId);
      await deleteDoc(serviceDocRef);
      alert("Serviço apagado com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar serviço:", error);
      alert("Não foi possível apagar o serviço.");
    }
  };

  // UPDATE: Função para atualizar um serviço (dentro do Modal)
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
      setIsModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      alert("Não foi possível atualizar o serviço.");
    }
  };

  // READ: Efeito para ler os serviços em tempo real
  useEffect(() => {
    if (!currentUser) return;

    const servicesCollectionRef = collection(db, "businesses", currentUser.uid, "services");
    const q = query(servicesCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    });

    return () => unsubscribe(); // Limpa o "ouvinte" ao sair da página
  }, [currentUser]);

  return (
    <PageContainer>
      <FormSection>
        <h2>Adicionar Novo Serviço</h2>
        <form onSubmit={handleAddService}>
          <Input
            placeholder="Nome do Serviço (ex: Corte de Cabelo)"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Preço (ex: 30.50)"
            value={servicePrice}
            onChange={(e) => setServicePrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Duração em minutos (ex: 30)"
            value={serviceDuration}
            onChange={(e) => setServiceDuration(e.target.value)}
          />
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
              <div>
                <strong>{service.name}</strong>
                <p>
                  Preço: R$ {service.price.toFixed(2)} | Duração: {service.duration} min
                </p>
              </div>
              <div>
                <Button
                  style={{ marginRight: "10px" }}
                  onClick={() => {
                    setEditingService(service);
                    setIsModalOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button danger onClick={() => handleDeleteService(service.id)}>
                  Apagar
                </Button>
              </div>
            </ServiceItem>
          ))
        )}
      </ServicesListSection>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {editingService && (
          <form onSubmit={handleUpdateService}>
            <h2>Editar Serviço</h2>
            <Input
              name="name"
              defaultValue={editingService.name}
              placeholder="Nome do Serviço"
            />
            <Input
              name="price"
              type="number"
              defaultValue={editingService.price}
              placeholder="Preço"
            />
            <Input
              name="duration"
              type="number"
              defaultValue={editingService.duration}
              placeholder="Duração em minutos"
            />
            <div style={{ marginTop: '20px' }}>
              <Button type="submit" style={{ marginRight: '10px' }}>
                Salvar Alterações
              </Button>
              <Button type="button" danger onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
}