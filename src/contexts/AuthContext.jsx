import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig'; // ADICIONADO: db para verificar o status de Admin
import { doc, onSnapshot } from 'firebase/firestore'; // ADICIONADO: Firestore imports

// 1. Cria o Contexto
// ADICIONADO: isSuperAdmin ao contexto
const AuthContext = createContext({});

// 2. Cria o Provedor do Contexto
// Este componente vai "prover" a informação do utilizador para toda a aplicação
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // NOVIDADE: Status do Super Admin

  // 3. Efeito que executa uma vez para verificar o estado de autenticação
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Define o utilizador (pode ser null se não estiver logado)
      setLoading(false); // Marca que o carregamento inicial terminou
    });

    // Retorna a função de limpeza para parar de "ouvir" a autenticação
    return unsubscribeAuth;
  }, []);

  // NOVIDADE: Efeito para verificar o status de Super Admin
  useEffect(() => {
    if (currentUser) {
      // Assumimos a existência de uma coleção 'superAdmins'
      const adminDocRef = doc(db, 'superAdmins', currentUser.uid);
      
      // Observa em tempo real se o utilizador é um Super Admin
      const unsubscribeAdmin = onSnapshot(adminDocRef, (docSnap) => {
        setIsSuperAdmin(docSnap.exists());
      }, (error) => {
        console.error("Erro ao verificar status de Super Admin:", error);
        setIsSuperAdmin(false);
      });
      
      // Limpa o listener do admin quando o componente é desmontado ou o user muda
      return () => unsubscribeAdmin(); 
    } else {
      setIsSuperAdmin(false);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    isSuperAdmin, // EXPOSTO: isSuperAdmin
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