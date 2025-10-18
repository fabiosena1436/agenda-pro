import React from 'react';
import { ModalBackdrop, ModalContent } from './styles';

export default function Modal({ isOpen, onClose, children, size }) {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} size={size}>
        {children}
      </ModalContent>
    </ModalBackdrop>
  );
}
