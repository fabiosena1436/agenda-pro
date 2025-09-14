import React, { useState } from 'react'; // Importa o useState
import { Outlet } from 'react-router-dom';
import { LayoutContainer, MainContent } from './styles';
import Sidebar from '../Sidebar';
import MenuToggle from '../MenuToggle'; // Importa o nosso botão sanduíche

export default function AdminLayout() {
  // "Memória" para saber se o menu mobile está aberto ou fechado
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <LayoutContainer>
      {/* O botão sanduíche só aparece em telas pequenas, mas o colocamos aqui */}
      <MenuToggle onClick={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Passamos o estado 'isOpen' para o Sidebar saber se deve aparecer */}
      <Sidebar isOpen={isMenuOpen} />

      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}