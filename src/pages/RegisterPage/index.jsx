// src/pages/RegisterPage/index.jsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Importamos a ferramenta de navegação
import { PageContainer, FormContainer } from './styles';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { auth } from '../../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Inicializamos a ferramenta de navegação

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.warn('Por favor, preencha todos os campos.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Utilizador criado com sucesso! A redirecionar para o seu painel...');

      // A mágica acontece aqui! Após o sucesso, navegamos para o dashboard.
      // O Firebase já mantém o utilizador logado automaticamente após o registo.
      navigate('/dashboard'); 

    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      toast.error(`Ocorreu um erro: ${error.message}`);
    }
  };

  return (
    <PageContainer>
      <h1>Crie a sua Conta</h1>
      <p>É rápido e fácil.</p>
      <FormContainer onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Digite o seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Crie uma senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Registar</Button>
      </FormContainer>
      {/* NOVIDADE: Botão de chamada para Ação para fazer Login */}
      <div style={{ marginTop: '20px' }}>
        <p>Já tem uma conta?</p>
        <Button type="button" onClick={() => navigate('/login')} className="secondary" style={{ marginTop: '10px' }}>
          Fazer Login
        </Button>
      </div>
    </PageContainer>
  );
}