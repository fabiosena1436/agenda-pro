import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // <-- Novidade! Para redirecionar o utilizador
import { PageContainer, FormContainer } from './styles'; // Reutilizamos os mesmos estilos
import Input from '../../components/Input';
import Button from '../../components/Button';
import { auth } from '../../services/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth'; // <-- Importamos a função de LOGIN

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // <-- Inicializamos o hook de navegação

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.warn('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Usamos a função do Firebase para fazer o login
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login bem-sucedido!');
      navigate('/dashboard'); // <-- Redireciona para o painel após o login
    } catch (error) {
      // Trata erros comuns de login
      console.error("Erro ao fazer login:", error);
      toast.error(`Ocorreu um erro: ${error.message}`);
    }
  };

  return (
    <PageContainer>
      <h1>Aceda à sua Conta</h1>
      <FormContainer onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Digite o seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Digite a sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Entrar</Button>
      </FormContainer>
      {/* NOVIDADE: Botão de chamada para Ação para criar uma conta */}
      <div style={{ marginTop: '20px' }}>
        <p>Ainda não tem uma conta?</p>
        <Button type="button" onClick={() => navigate('/register')} style={{ marginTop: '10px' }}>
          Crie a Sua Conta
        </Button>
      </div>
    </PageContainer>
  );
}