'use client';

import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  };

  return (
    <div
      style={{
        width: '100%',
        background: 'rgba(231, 236, 235, 0.08)',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.16)',
        overflow: 'hidden',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <div style={{
        width: '100%',
        padding: '18px 16px 18px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'left',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{
          flex: 1,
          color: '#111827',
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '24px',
          wordBreak: 'break-word'
        }}>
          {question}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            style={{
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isOpen ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1)'
            }}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), padding 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: isOpen ? '500px' : '0px',
          opacity: isOpen ? 1 : 0
        }}
      >
        <div style={{
          padding: isOpen ? '8px 20px 18px 20px' : '0px 20px 0px 20px',
          transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateY(0)' : 'translateY(-8px)'
        }}>
          <div style={{
            color: 'rgba(17, 24, 39, 0.8)',
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '24px',
            wordBreak: 'break-word'
          }}>
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FAQData {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  
  const faqData: FAQData[] = [
    {
      question: "¿Qué es Codal y para quién está diseñado?",
      answer: "Codal es una plataforma de IA médica diseñada para médicos, equipos de salud y organizaciones que buscan acelerar su flujo de trabajo clínico. Es perfecto tanto para médicos individuales que buscan mejorar su productividad como para equipos que necesitan herramientas de colaboración eficientes."
    },
    {
      question: "¿Cómo funciona el análisis médico con IA?",
      answer: "Nuestra IA analiza las consultas en tiempo real, proporcionando sugerencias inteligentes para diagnósticos, detectando posibles complicaciones y asegurando las mejores prácticas. Aprende de tus patrones clínicos y se adapta a los estándares de tu equipo médico."
    },
    {
      question: "¿Puedo integrar Codal con mis herramientas existentes?",
      answer: "¡Sí! Codal ofrece integraciones con sistemas populares de historias clínicas, laboratorios, sistemas hospitalarios y muchos más. Nuestra conectividad permite gestionar fácilmente el acceso a servidores en todo tu stack de salud."
    },
    {
      question: "¿Qué incluye el plan gratuito?",
      answer: "El plan gratuito incluye hasta 50 consultas mensuales, transcripción básica en tiempo real, análisis básico de IA, informes CIE-10 y soporte por email. Es perfecto para médicos individuales que están comenzando."
    },
    {
      question: "¿Cómo funcionan las transcripciones en tiempo real?",
      answer: "Nuestras transcripciones en tiempo real pueden procesar múltiples consultas simultáneamente, convirtiendo conversaciones médicas complejas en texto estructurado más rápido que los métodos tradicionales de documentación manual."
    },
    {
      question: "¿Mis datos médicos están seguros con Codal?",
      answer: "Absolutamente. Utilizamos medidas de seguridad de nivel empresarial incluyendo encriptación de extremo a extremo, transmisión segura de datos y cumplimiento con estándares de la industria como HIPAA. Tus datos nunca salen de tu entorno seguro sin tu permiso explícito."
    }
  ];

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section id="faq" style={{
      width: '100%',
      paddingTop: '66px',
      paddingBottom: '80px',
      padding: '66px 20px 160px 20px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '300px',
        height: '500px',
        position: 'absolute',
        top: '150px',
        left: '50%',
        transform: 'translateX(-50%) rotate(-33.39deg)',
        transformOrigin: 'top left',
        background: 'rgba(91, 156, 255, 0.1)',
        filter: 'blur(100px)',
        zIndex: 0
      }} />
      <div style={{
        alignSelf: 'stretch',
        paddingTop: '32px',
        paddingBottom: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h2 style={{
            width: '100%',
            maxWidth: '435px',
            textAlign: 'center',
            color: '#111827',
            fontSize: '40px',
            fontWeight: '600',
            lineHeight: '40px',
            wordBreak: 'break-word'
          }}>
            Preguntas Frecuentes
          </h2>
          <p style={{
            alignSelf: 'stretch',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '18.20px',
            wordBreak: 'break-word'
          }}>
            Todo lo que necesitas saber sobre Codal y cómo puede transformar tu práctica médica
          </p>
        </div>
      </div>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        paddingTop: '2px',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        {faqData.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question}
            answer={faq.answer}
            isOpen={openItems.has(index)} 
            onToggle={() => toggleItem(index)} 
          />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
