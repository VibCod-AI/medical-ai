import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { designTokens } from '../tokens';

// Button variants and sizes
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const getButtonStyles = (variant: ButtonVariant, size: ButtonSize, isLoading: boolean, fullWidth: boolean) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing[2],
    fontFamily: designTokens.typography.fontFamily.primary,
    fontWeight: designTokens.typography.fontWeight.medium,
    borderRadius: designTokens.borderRadius.lg,
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: `all ${designTokens.transition.duration.normal} ${designTokens.transition.easing.easeInOut}`,
    textDecoration: 'none',
    outline: 'none',
    position: 'relative' as const,
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: isLoading ? 0.7 : 1,
    
    // Focus styles
    ':focus-visible': {
      outline: `2px solid ${designTokens.colors.primary[500]}`,
      outlineOffset: '2px'
    }
  };

  // Size styles
  const sizeStyles = {
    sm: {
      height: designTokens.components.button.height.sm,
      padding: designTokens.components.button.padding.sm,
      fontSize: designTokens.typography.fontSize.sm
    },
    md: {
      height: designTokens.components.button.height.md,
      padding: designTokens.components.button.padding.md,
      fontSize: designTokens.typography.fontSize.base
    },
    lg: {
      height: designTokens.components.button.height.lg,
      padding: designTokens.components.button.padding.lg,
      fontSize: designTokens.typography.fontSize.lg
    }
  };

  // Variant styles
  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${designTokens.colors.primary[500]} 0%, ${designTokens.colors.primary[600]} 100%)`,
      color: designTokens.colors.neutral[0],
      boxShadow: `0 4px 14px ${designTokens.colors.primary[500]}40`,
      ':hover': {
        background: `linear-gradient(135deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.primary[700]} 100%)`,
        transform: 'translateY(-1px)',
        boxShadow: `0 6px 20px ${designTokens.colors.primary[500]}50`
      },
      ':active': {
        transform: 'translateY(0)',
        boxShadow: `0 2px 8px ${designTokens.colors.primary[500]}40`
      }
    },
    secondary: {
      background: `linear-gradient(135deg, ${designTokens.colors.secondary[500]} 0%, ${designTokens.colors.secondary[600]} 100%)`,
      color: designTokens.colors.neutral[0],
      boxShadow: `0 4px 14px ${designTokens.colors.secondary[500]}40`,
      ':hover': {
        background: `linear-gradient(135deg, ${designTokens.colors.secondary[600]} 0%, ${designTokens.colors.secondary[700]} 100%)`,
        transform: 'translateY(-1px)'
      }
    },
    accent: {
      background: `linear-gradient(135deg, ${designTokens.colors.accent[500]} 0%, ${designTokens.colors.accent[600]} 100%)`,
      color: designTokens.colors.neutral[0],
      boxShadow: `0 4px 14px ${designTokens.colors.accent[500]}40`,
      ':hover': {
        background: `linear-gradient(135deg, ${designTokens.colors.accent[600]} 0%, ${designTokens.colors.accent[700]} 100%)`,
        transform: 'translateY(-1px)'
      }
    },
    success: {
      background: designTokens.colors.semantic.success.main,
      color: designTokens.colors.semantic.success.contrastText,
      ':hover': {
        background: designTokens.colors.semantic.success.dark,
        transform: 'translateY(-1px)'
      }
    },
    warning: {
      background: designTokens.colors.semantic.warning.main,
      color: designTokens.colors.semantic.warning.contrastText,
      ':hover': {
        background: designTokens.colors.semantic.warning.dark,
        transform: 'translateY(-1px)'
      }
    },
    error: {
      background: designTokens.colors.semantic.error.main,
      color: designTokens.colors.semantic.error.contrastText,
      ':hover': {
        background: designTokens.colors.semantic.error.dark,
        transform: 'translateY(-1px)'
      }
    },
    ghost: {
      background: 'transparent',
      color: designTokens.colors.neutral[700],
      ':hover': {
        background: designTokens.colors.neutral[100],
        color: designTokens.colors.neutral[900]
      }
    },
    outline: {
      background: 'transparent',
      color: designTokens.colors.primary[600],
      border: `1px solid ${designTokens.colors.primary[300]}`,
      ':hover': {
        background: designTokens.colors.primary[50],
        borderColor: designTokens.colors.primary[400]
      }
    }
  };

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const styles = getButtonStyles(variant, size, isLoading, fullWidth);

    return (
      <button
        ref={ref}
        style={styles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        )}
        {!isLoading && leftIcon && leftIcon}
        {children}
        {!isLoading && rightIcon && rightIcon}
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';
