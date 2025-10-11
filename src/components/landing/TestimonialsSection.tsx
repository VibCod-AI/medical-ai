'use client';

import React from 'react';

interface TestimonialCardProps {
  quote: string;
  doctorName: string;
  hospital: string;
  imageUrl: string;
  isLarge?: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  quote, 
  doctorName, 
  hospital, 
  imageUrl, 
  isLarge = false 
}) => {
  const isGlassCard = doctorName === "Dr. Alberto Flores";
  
  if (isLarge) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '384px',
        height: '502px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        overflow: 'hidden',
        borderRadius: '10px',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
        padding: '1.5rem',
        background: isGlassCard ? 'rgba(231, 236, 235, 0.12)' : 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: isGlassCard 
            ? 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDQwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjUwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAuMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmZmZmYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+Cjwvc3ZnPgo=")'
            : 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDQwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjUwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAuMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmZmZmYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+Cjwvc3ZnPgo=")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isGlassCard ? 0.2 : 1,
          zIndex: 0
        }} />
        <div style={{
          position: 'relative',
          zIndex: 10,
          fontWeight: '400',
          wordBreak: 'break-word',
          color: '#111827',
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontFamily: 'inherit'
        }}>
          "{quote}"
        </div>
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '41px',
            background: isGlassCard ? 'rgba(91, 156, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={imageUrl}
              alt={doctorName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '0.125rem'
          }}>
            <div style={{
              color: '#111827',
              fontSize: '1rem',
              fontWeight: '400',
              lineHeight: '1.5rem'
            }}>
              {doctorName}
            </div>
            <div style={{
              color: '#4B5563',
              fontSize: '1rem',
              fontWeight: '400',
              lineHeight: '1.5rem'
            }}>
              {hospital}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '384px',
      height: '244px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      overflow: 'hidden',
      borderRadius: '10px',
      boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
      padding: '1.875rem',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.8)'
    }}>
      <div style={{
        color: 'rgba(44, 44, 46, 0.8)',
        fontSize: '1.063rem',
        fontWeight: '400',
        lineHeight: '1.5rem'
      }}>
        "{quote}"
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '30.75px',
          background: 'rgba(91, 156, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={imageUrl}
            alt={doctorName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '0.125rem'
        }}>
          <div style={{
            color: '#111827',
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.375rem'
          }}>
            {doctorName}
          </div>
          <div style={{
            color: '#4B5563',
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.375rem'
          }}>
            {hospital}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Medical AI ha transformado completamente nuestra práctica. Las transcripciones en tiempo real son tan precisas que se sienten como tener un asistente médico especializado revisando cada consulta mientras hablas.",
      doctorName: "Dr. Ana Martínez",
      hospital: "Hospital General",
      imageUrl: "/doctors/image.png",
      isLarge: true
    },
    {
      quote: "Integrar Medical AI en nuestro hospital fue sencillo, y las conexiones con nuestros sistemas existentes nos ahorraron semanas de configuración",
      doctorName: "Dr. Carlos Ruiz",
      hospital: "Clínica San Rafael",
      imageUrl: "/doctors/image copy.png"
    },
    {
      quote: "La función de análisis médico con IA ha sido revolucionaria. Estamos detectando patologías complejas en minutos en lugar de horas.",
      doctorName: "Dra. María López",
      hospital: "Centro Médico ABC",
      imageUrl: "/doctors/image copy 2.png"
    },
    {
      quote: "Ya no hacemos malabares con múltiples herramientas. Medical AI integró todas nuestras aplicaciones médicas en un solo lugar.",
      doctorName: "Dr. Roberto Silva",
      hospital: "Hospital Universitario",
      imageUrl: "/doctors/image copy 3.png"
    },
    {
      quote: "Comenzamos con el plan gratuito solo para probarlo, pero en una semana upgradeamos a Pro. Ahora no podemos imaginar trabajar sin Medical AI",
      doctorName: "Dra. Carmen Vega",
      hospital: "Medicina Familiar",
      imageUrl: "/doctors/image copy 4.png"
    },
    {
      quote: "Las consultas colaborativas se sienten naturales ahora. Con las transcripciones en tiempo real de Medical AI, la telemedicina se volvió más productiva.",
      doctorName: "Dr. Luis Fernández",
      hospital: "Telemedicina Plus",
      imageUrl: "/doctors/image copy 5.png"
    },
    {
      quote: "Implementar Medical AI en nuestro centro de diagnóstico no solo fue simple, se sintió perfecto. Fuimos de las consultas tradicionales a ver análisis de IA en vivo en minutos sin problemas de configuración.",
      doctorName: "Dr. Alberto Flores",
      hospital: "Centro de Diagnóstico Avanzado",
      imageUrl: "/doctors/image copy 6.png",
      isLarge: true
    }
  ];

  return (
    <section id="features" style={{
      width: '100%',
      padding: '1.5rem 1.25rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    }}>
      <div style={{
        alignSelf: 'stretch',
        padding: '1.5rem 0 3.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            color: '#111827',
            fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
            fontWeight: '600',
            lineHeight: '1.125',
            letterSpacing: 'tight'
          }}>
            Medicina hecha más eficiente
          </h2>
          <p style={{
            alignSelf: 'stretch',
            textAlign: 'center',
            color: '#4B5563',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            fontWeight: '500',
            lineHeight: '1.3'
          }}>
            Descubre cómo profesionales de la salud diagnostican más rápido, colaboran sin problemas,
            <br />
            y atienden con confianza usando las potentes herramientas de IA de Medical AI
          </p>
        </div>
      </div>
      
      <div style={{
        width: '100%',
        paddingTop: '0.125rem',
        paddingBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '1.5rem',
        maxWidth: '1100px',
        margin: '0 auto',
        flexWrap: 'wrap'
      }}>
        {/* Column 1 */}
        <div style={{
          flex: 1,
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '1.5rem'
        }}>
          <TestimonialCard {...testimonials[0]} />
          <TestimonialCard {...testimonials[1]} />
        </div>

        {/* Column 2 */}
        <div style={{
          flex: 1,
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '1.5rem'
        }}>
          <TestimonialCard {...testimonials[2]} />
          <TestimonialCard {...testimonials[3]} />
          <TestimonialCard {...testimonials[4]} />
        </div>

        {/* Column 3 */}
        <div style={{
          flex: 1,
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '1.5rem'
        }}>
          <TestimonialCard {...testimonials[5]} />
          <TestimonialCard {...testimonials[6]} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
