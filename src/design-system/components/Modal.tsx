import React, { HTMLAttributes, forwardRef, useEffect, useState } from 'react';
import { designTokens } from '../tokens';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  title?: string;
  subtitle?: string;
}

const getModalStyles = (size: ModalSize) => {
  const sizeStyles = {
    sm: { maxWidth: '400px', width: '90vw' },
    md: { maxWidth: '600px', width: '90vw' },
    lg: { maxWidth: '800px', width: '90vw' },
    xl: { maxWidth: '1200px', width: '95vw' },
    full: { maxWidth: '100vw', width: '100vw', height: '100vh', borderRadius: 0 }
  };

  return {
    position: 'relative' as const,
    background: designTokens.colors.neutral[0],
    borderRadius: size === 'full' ? 0 : designTokens.borderRadius['2xl'],
    boxShadow: designTokens.boxShadow['2xl'],
    maxHeight: size === 'full' ? '100vh' : '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    ...sizeStyles[size]
  };
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    isOpen,
    onClose,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    title,
    subtitle,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (isOpen) {
        setIsVisible(true);
        setIsAnimating(true);
        document.body.style.overflow = 'hidden';
      } else {
        setIsAnimating(false);
        const timer = setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = 'unset';
        }, 200);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    useEffect(() => {
      if (!closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    if (!isVisible) return null;

    const overlayStyles = {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size === 'full' ? 0 : designTokens.spacing[4],
      zIndex: designTokens.zIndex.modal,
      opacity: isAnimating ? 1 : 0,
      transition: `opacity ${designTokens.transition.duration.normal} ${designTokens.transition.easing.easeInOut}`
    };

    const modalStyles = {
      ...getModalStyles(size),
      transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
      transition: `all ${designTokens.transition.duration.normal} ${designTokens.transition.easing.easeInOut}`
    };

    const headerStyles = {
      padding: designTokens.spacing[6],
      borderBottom: `1px solid ${designTokens.colors.neutral[200]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    };

    const titleStyles = {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      color: designTokens.colors.neutral[900],
      margin: 0
    };

    const subtitleStyles = {
      fontSize: designTokens.typography.fontSize.base,
      color: designTokens.colors.neutral[600],
      marginTop: designTokens.spacing[1],
      margin: 0
    };

    const closeButtonStyles = {
      width: '40px',
      height: '40px',
      borderRadius: designTokens.borderRadius.full,
      border: 'none',
      background: 'transparent',
      color: designTokens.colors.neutral[500],
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: `all ${designTokens.transition.duration.fast} ${designTokens.transition.easing.easeInOut}`,
      ':hover': {
        background: designTokens.colors.neutral[100],
        color: designTokens.colors.neutral[700]
      }
    };

    const contentStyles = {
      flex: 1,
      overflow: 'auto',
      padding: designTokens.spacing[6]
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div style={overlayStyles} onClick={handleOverlayClick}>
        <div ref={ref} style={modalStyles} {...props}>
          {(title || subtitle || showCloseButton) && (
            <div style={headerStyles}>
              <div>
                {title && <h2 style={titleStyles}>{title}</h2>}
                {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button
                  style={closeButtonStyles}
                  onClick={onClose}
                  aria-label="Close modal"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = designTokens.colors.neutral[100];
                    e.currentTarget.style.color = designTokens.colors.neutral[700];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = designTokens.colors.neutral[500];
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          )}
          
          <div style={contentStyles}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

// Modal subcomponents
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ title, subtitle, children, ...props }, ref) => {
    const headerStyles = {
      marginBottom: designTokens.spacing[6]
    };

    const titleStyles = {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      color: designTokens.colors.neutral[900],
      margin: 0,
      marginBottom: subtitle ? designTokens.spacing[2] : 0
    };

    const subtitleStyles = {
      fontSize: designTokens.typography.fontSize.base,
      color: designTokens.colors.neutral[600],
      margin: 0
    };

    return (
      <div ref={ref} style={headerStyles} {...props}>
        {title && <h3 style={titleStyles}>{title}</h3>}
        {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        {children}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, ...props }, ref) => {
    const contentStyles = {
      flex: 1,
      marginBottom: designTokens.spacing[6]
    };

    return (
      <div ref={ref} style={contentStyles} {...props}>
        {children}
      </div>
    );
  }
);

ModalContent.displayName = 'ModalContent';

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ justify = 'end', children, ...props }, ref) => {
    const justifyContent = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between'
    };

    const footerStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: justifyContent[justify],
      gap: designTokens.spacing[3],
      paddingTop: designTokens.spacing[4],
      borderTop: `1px solid ${designTokens.colors.neutral[200]}`
    };

    return (
      <div ref={ref} style={footerStyles} {...props}>
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';
