import React, { useState } from 'react'; // 1. Importa o useState
import { PageContainer, FormContainer } from './styles';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { auth } from '../../services/firebaseConfig'; // 2. Importa a autenticação do Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth'; // 3. Importa a função de criar utilizador

export default function RegisterPage() {
  // 4. Cria "estados" para guardar o email e a senha que o utilizador digita
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 5. Função que será executada quando o formulário for submetido
  const handleSubmit = async (event) => {
    event.preventDefault(); // Impede que a página recarregue

    if (!email || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // 6. Usa a função do Firebase para criar um novo utilizador
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Utilizador criado com sucesso!');
      // Aqui, no futuro, podemos redirecionar o utilizador para o painel
    } catch (error) {
      // 7. Se der um erro (ex: email já existe, senha fraca), mostra um alerta
      console.error("Erro ao criar utilizador:", error);
      alert(`Ocorreu um erro: ${error.message}`);
    }
  };

  return (
    <PageContainer>
      <h1>Crie a sua Conta</h1>
      <p>É rápido e fácil.</p>
      <FormContainer onSubmit={handleSubmit}> {/* 8. Liga a função ao formulário */}
        <Input
          type="email"
          placeholder="Digite o seu e-mail"
          value={email} // 9. Liga o input ao estado 'email'
          onChange={(e) => setEmail(e.target.value)} // Atualiza o estado a cada letra digitada
        />
        <Input
          type="password"
          placeholder="Crie uma senha"
          value={password} // 10. Liga o input ao estado 'password'
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Registar</Button>
      </FormContainer>
    </PageContainer>
  );
}