import React from 'react';
import { FooterContainer, FooterContent, WorkingHoursList } from './styles';

const weekDaysMap = {
  segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira', 
  quinta: 'Quinta-feira', sexta: 'Sexta-feira', sabado: 'Sábado', domingo: 'Domingo'
};

const Footer = ({ workingHours, address }) => {
  return (
    <FooterContainer>
      <FooterContent>
        <div>
          <h3>Horário de Funcionamento</h3>
          {workingHours ? (
            <WorkingHoursList>
              {Object.entries(workingHours).map(([day, config]) => (
                <li key={day}>
                  <strong>{weekDaysMap[day]}:</strong> 
                  <span>{config.isOpen ? 
                      (config.intervals.map(i => `${i.start} - ${i.end}`).join(' | ')) 
                      : 'Fechado'}</span>
                </li>
              ))}
            </WorkingHoursList>
          ) : <p>Horários não informados.</p>}
        </div>
        <div>
          <h3>Endereço</h3>
          <p>{address || 'Endereço não informado.'}</p>
        </div>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
