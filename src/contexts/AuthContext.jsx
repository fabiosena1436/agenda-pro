import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// 1. Cria o Contexto
const AuthContext = createContext({});

// 2. Cria o Provedor do Contexto
// Este componente vai "prover" a informação do utilizador para toda a aplicação
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Efeito que executa uma vez para verificar o estado de autenticação
  useEffect(() => {
    // A função onAuthStateChanged é um "ouvinte" do Firebase.
    // Ele notifica-nos sempre que o estado de login muda.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Define o utilizador (pode ser null se não estiver logado)
      setLoading(false); // Marca que o carregamento inicial terminou
    });

    // Retorna a função de limpeza para parar de "ouvir" quando o componente for desmontado
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  // 4. Retorna o Provedor com o valor do utilizador
  // O `!loading && children` garante que a aplicação só é renderizada
  // depois de o Firebase ter verificado o estado de autenticação.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 5. Exporta um hook customizado para usar o contexto mais facilmente
export const useAuth = () => {
    return useContext(AuthContext);
}