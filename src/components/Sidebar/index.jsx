import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarContainer, Logo, NavList, NavItem } from './styles';
import Button from '../Button';
import { auth } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
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
    <SidebarContainer>
      <Logo>AgendaPro</Logo>
      <NavList>
        <li>
          <NavItem to="/dashboard/appointments">Agenda</NavItem>
        </li>
        <li>
          <NavItem to="/dashboard/services">Serviços</NavItem>
        </li>
        <li>
          <NavItem to="/dashboard/settings">Configurações</NavItem>
        </li>
      </NavList>
      <Button danger onClick={handleLogout}>Sair</Button>
    </SidebarContainer>
  );
}