import React, { useState, useEffect } from "react";
import {
  PageContainer,
  FormSection,
  ServicesListSection,
  ServiceItem,
} from "./styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { db } from "../../services/firebaseConfig";
import Modal from "../../components/Modal";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext"; // Para pegar o usuário logado

export default function ServicesPage() {
  const { currentUser } = useAuth(); // Pega o usuário do nosso contexto de autenticação

  // Estados para o formulário
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");

  // Estado para a lista de serviços
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // Guarda o serviço a ser editado

  // CREATE: Função para adicionar um novo serviço
  const handleAddService = async (event) => {
    event.preventDefault();
    if (!serviceName || !servicePrice || !serviceDuration) {
      return alert("Por favor, preencha todos os campos.");
    }

    try {
      // O caminho para a sub-coleção de serviços do usuário logado
      const servicesCollectionRef = collection(
        db,
        "businesses",
        currentUser.uid,
        "services"
      );
      await addDoc(servicesCollectionRef, {
        name: serviceName,
        price: parseFloat(servicePrice), // Converte o preço para número
        duration: parseInt(serviceDuration), // Converte a duração para número
      });

      alert("Serviço adicionado com sucesso!");
      // Limpa o formulário
      setServiceName("");
      setServicePrice("");
      setServiceDuration("");
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
      alert("Não foi possível adicionar o serviço.");
    }
  };
  // ... aqui está a sua função handleAddService ...

  // COLE A NOVA FUNÇÃO AQUI
  // DELETE: Função para apagar um serviço
  const handleDeleteService = async (serviceId) => {
    // 1. Pergunta se o usuário tem certeza
    if (!window.confirm("Tem certeza que deseja apagar este serviço?")) {
      return; // Se ele clicar "Cancelar", a função para aqui
    }

    try {
      // 2. Cria o "endereço" exato do serviço no banco de dados que queremos apagar
      const serviceDocRef = doc(
        db,
        "businesses",
        currentUser.uid,
        "services",
        serviceId
      );
      // 3. Manda a ordem para o Firestore apagar o documento nesse "endereço"
      await deleteDoc(serviceDocRef);
      alert("Serviço apagado com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar serviço:", error);
      alert("Não foi possível apagar o serviço.");
    }
  };

  // UPDATE: Função para atualizar um serviço
  const handleUpdateService = async (event) => {
    event.preventDefault();
    if (!editingService) return;

    const { name, price, duration } = event.target.elements;

    try {
      const serviceDocRef = doc(
        db,
        "businesses",
        currentUser.uid,
        "services",
        editingService.id
      );
      await updateDoc(serviceDocRef, {
        name: name.value,
        price: parseFloat(price.value),
        duration: parseInt(duration.value),
      });
      alert("Serviço atualizado com sucesso!");
      setIsModalOpen(false); // Fecha a janelinha
      setEditingService(null); // Limpa o serviço em edição
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      alert("Não foi possível atualizar o serviço.");
    }
  };

  // READ: Efeito para ler os serviços em tempo real
  useEffect(() => {
    if (!currentUser) return; // Garante que o usuário existe

    const servicesCollectionRef = collection(
      db,
      "businesses",
      currentUser.uid,
      "services"
    );
    const q = query(servicesCollectionRef); // Cria uma query

    // onSnapshot é o ouvinte em tempo real do Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    });

    return unsubscribe; // Limpa o ouvinte ao sair da página
  }, [currentUser]); // Roda o efeito sempre que o currentUser mudar

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
                  Preço: R$ {service.price.toFixed(2)} | Duração:{" "}
                  {service.duration} min
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
      {/* A nossa Janelinha Mágica (Modal) */}
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
