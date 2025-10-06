// src/pages/DashboardPage/index.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// NOVO: Importamos os nossos novos componentes de estilo
import { PageContainer, LinkShareContainer, LinkDisplay } from './styles'; 

import { auth, db } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 

  const [slug, setSlug] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copiar');

  useEffect(() => {
    if (!currentUser) return;

    const fetchBusinessData = async () => {
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const docSnap = await getDoc(businessDocRef);

      if (docSnap.exists()) {
        setSlug(docSnap.data().slug);
      } else {
        console.log("Documento do negócio não encontrado!");
      }
    };

    fetchBusinessData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const fullLink = `${window.location.origin}/agendar/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullLink).then(() => {
      setCopyButtonText('Copiado!');
      setTimeout(() => setCopyButtonText('Copiar'), 2000);
    }).catch(err => {
      console.error('Erro ao copiar link: ', err);
      alert('Não foi possível copiar o link.');
    });
  };

  return (
    // NOVO: Usamos o PageContainer importado
    <PageContainer>
      <h1>Bem-vindo ao seu Painel!</h1>
      <p>Utilize o menu lateral para gerir o seu negócio.</p>

      {slug && (
        // NOVO: Usamos os componentes de estilo em vez de divs com `style`
        <LinkShareContainer>
          <h3>O seu Link de Agendamento</h3>
          <p>Partilhe este link com os seus clientes!</p>
          <LinkDisplay>{fullLink}</LinkDisplay>
          <Button onClick={handleCopyLink}>{copyButtonText}</Button>
        </LinkShareContainer>
      )}
    </PageContainer>
  );
}