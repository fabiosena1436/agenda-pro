import React from 'react';
import { Link } from 'react-router-dom'; // Ferramenta para criar links
import { PageContainer } from './styles';
import Button from '../../components/Button'; // Nosso botão reutilizável

export default function HomePage() {
  return (
    <PageContainer>
      <h1>Bem-vindo ao AgendaPro!</h1>
      <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>
        A solução completa para gerir os seus agendamentos.
      </p>
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link to="/login">
          <Button>Entrar</Button>
        </Link>
        <Link to="/register">
          <Button>Criar Conta</Button>
        </Link>
      </div>
    </PageContainer>
  );
}