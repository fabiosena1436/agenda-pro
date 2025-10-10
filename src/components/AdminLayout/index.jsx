import React, { useState } from 'react'; // Importa o useState
import { Outlet } from 'react-router-dom';
import { LayoutContainer, MainContent } from './styles';
import Sidebar from '../Sidebar';
import MenuToggle from '../MenuToggle'; // Importa o nosso botão sanduíche

export default function AdminLayout() {
  // "Memória" para saber se o menu mobile está aberto ou fechado
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <LayoutContainer>
      {/* O botão sanduíche só aparece em telas pequenas, mas o colocamos aqui */}
      <MenuToggle onClick={toggleSidebar} />

      {/* Passamos o estado 'isOpen' para o Sidebar saber se deve aparecer */}
      <Sidebar isOpen={isMenuOpen} toggleSidebar={toggleSidebar} />

      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}