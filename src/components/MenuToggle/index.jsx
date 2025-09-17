import React from 'react';
import { ToggleButton } from './styles';

export default function MenuToggle({ onClick }) {
  return (
    <ToggleButton onClick={onClick}>
      <span />
      <span />
      <span />
    </ToggleButton>
  );
}