// src/components/Sidebar/index.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SidebarContainer, Logo, NavList, NavItem, Overlay } from './styles';
import Button from '../Button';
import { auth } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <SidebarContainer isOpen={isOpen}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Logo>AgendaPro</Logo>
        </Link>

        <NavList>
          <li>
            <NavItem to="/dashboard" end>Início</NavItem>
          </li>
          <li>
            <NavItem to="/dashboard/appointments">Agenda</NavItem>
          </li>
          <li>
            <NavItem to="/dashboard/services">Serviços</NavItem>
          </li>
          <li>
            <NavItem to="/dashboard/settings">Configurações</NavItem>
          </li>
          {/* NOVO: Adicionamos o link para a página de Planos e Assinatura */}
          <li>
            <NavItem to="/dashboard/plans">Planos e Assinatura</NavItem>
          </li>
        </NavList>

        <Button danger onClick={handleLogout}>Sair</Button>
      </SidebarContainer>
      <Overlay isOpen={isOpen} onClick={toggleSidebar} />
    </>
  );
}