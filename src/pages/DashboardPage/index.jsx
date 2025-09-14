import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Para redirecionar
import { PageContainer } from './styles';
import { auth } from '../../services/firebaseConfig'; // Importamos a instância do auth
import { signOut } from 'firebase/auth'; // Importamos a função de logout
import Button from '../../components/Button'; // Nosso botão reutilizável

export default function DashboardPage() {
  const navigate = useNavigate();

  // Função assíncrona para lidar com o logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Chama a função de logout do Firebase
      alert('Você saiu com sucesso!');
      navigate('/login'); // Redireciona para a página de login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Ocorreu um erro ao tentar sair.');
    }
  };

  return (
    <PageContainer>
      <h1>Bem-vindo ao seu Painel!</h1>
      <p>Login efetuado com sucesso.</p>
      <br />
       <Link to="/dashboard/appointments">
          <Button>Ver Agenda</Button>
        </Link>
       <br />
       <Link to="/dashboard/services">
        <Button>Gerenciar Meus Serviços</Button>
      </Link>
       <Link to="/dashboard/settings">
          <Button>Configurações</Button>
        </Link>
      <br />
      <Button onClick={handleLogout}>
        Sair
      </Button>
    </PageContainer>
  );
}