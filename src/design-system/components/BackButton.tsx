import React from 'react';
import { useRouter } from 'next/navigation';
import { designTokens } from '../tokens';

export interface BackButtonProps {
  to?: string;
  label?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  variant?: 'glass' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const getPositionStyles = (position: BackButtonProps['position']) => {
  const positions = {
    'top-left': { top: '2rem', left: '2rem' },
    'top-right': { top: '2rem', right: '2rem' },
    'bottom-left': { bottom: '2rem', left: '2rem' },
    'bottom-right': { bottom: '2rem', right: '2rem' }
  };
  
  return positions[position || 'top-left'];
};

const getVariantStyles = (variant: BackButtonProps['variant']) => {
  const variants = {
    glass: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${designTokens.colors.neutral[200]}`,
      boxShadow: designTokens.boxShadow.glass,
      ':hover': {
        background: 'rgba(255, 255, 255, 1)',
        boxShadow: designTokens.boxShadow.floating
      }
    },
    solid: {
      background: designTokens.colors.neutral[0],
      border: `1px solid ${designTokens.colors.neutral[300]}`,
      boxShadow: designTokens.boxShadow.md,
      ':hover': {
        background: designTokens.colors.neutral[50],
        boxShadow: designTokens.boxShadow.lg
      }
    },
    outline: {
      background: 'transparent',
      border: `2px solid ${designTokens.colors.primary[300]}`,
      color: designTokens.colors.primary[600],
      ':hover': {
        background: designTokens.colors.primary[50],
        borderColor: designTokens.colors.primary[400]
      }
    }
  };
  
  return variants[variant || 'glass'];
};

const getSizeStyles = (size: BackButtonProps['size']) => {
  const sizes = {
    sm: {
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
      fontSize: designTokens.typography.fontSize.xs,
      iconSize: '14px'
    },
    md: {
      padding: `${designTokens.spacing[3]} ${designTokens.spacing[4]}`,
      fontSize: designTokens.typography.fontSize.sm,
      iconSize: '16px'
    },
    lg: {
      padding: `${designTokens.spacing[4]} ${designTokens.spacing[5]}`,
      fontSize: designTokens.typography.fontSize.base,
      iconSize: '18px'
    }
  };
  
  return sizes[size || 'md'];
};

export const BackButton: React.FC<BackButtonProps> = ({
  to = '/',
  label = 'Volver',
  position = 'top-left',
  variant = 'glass',
  size = 'md',
  className = '',
  onClick
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(to);
    }
  };

  const positionStyles = getPositionStyles(position);
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  const buttonStyles = {
    position: 'absolute' as const,
    zIndex: designTokens.zIndex.sticky,
    display: 'flex',
    alignItems: 'center',
    gap: designTokens.spacing[2],
    borderRadius: designTokens.borderRadius.xl,
    cursor: 'pointer',
    transition: `all ${designTokens.transition.duration.normal} ${designTokens.transition.easing.easeInOut}`,
    fontFamily: designTokens.typography.fontFamily.primary,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: variant === 'outline' ? designTokens.colors.primary[600] : designTokens.colors.neutral[700],
    textDecoration: 'none',
    outline: 'none',
    border: 'none',
    
    ':focus-visible': {
      outline: `2px solid ${designTokens.colors.primary[500]}`,
      outlineOffset: '2px'
    },
    
    ...positionStyles,
    ...variantStyles,
    ...sizeStyles
  };

  const arrowIconStyles = {
    width: sizeStyles.iconSize,
    height: sizeStyles.iconSize,
    transition: `transform ${designTokens.transition.duration.fast} ${designTokens.transition.easing.easeInOut}`,
    flexShrink: 0
  };

  return (
    <button
      onClick={handleClick}
      style={buttonStyles}
      className={className}
      onMouseEnter={(e) => {
        const hoverStyles = variantStyles[':hover'] || {};
        Object.assign(e.currentTarget.style, hoverStyles);
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.color = variant === 'outline' 
          ? designTokens.colors.primary[700] 
          : designTokens.colors.primary[600];
        
        const arrow = e.currentTarget.querySelector('.back-arrow-icon') as HTMLElement;
        if (arrow) arrow.style.transform = 'translateX(-2px)';
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, {
          ...variantStyles,
          transform: 'translateY(0)',
          color: variant === 'outline' ? designTokens.colors.primary[600] : designTokens.colors.neutral[700]
        });
        
        const arrow = e.currentTarget.querySelector('.back-arrow-icon') as HTMLElement;
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
      aria-label={`${label} - Navegar hacia atrás`}
    >
      <svg 
        className="back-arrow-icon"
        style={arrowIconStyles}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5"/>
        <path d="M12 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
};

export default BackButton;
