import React from 'react';
import { ModalBackdrop, ModalContent } from './styles';

export default function Modal({ isOpen, onClose, children }) {
  // Se a propriedade 'isOpen' for falsa, a janelinha não desenha nada.
  if (!isOpen) {
    return null;
  }

  // 'children' é qualquer coisa que a gente colocar dentro do Modal
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalBackdrop>
  );
}