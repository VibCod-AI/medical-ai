import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { designTokens } from '../tokens';

export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const getInputStyles = (
  variant: InputVariant, 
  size: InputSize, 
  hasError: boolean, 
  isFocused: boolean,
  fullWidth: boolean
) => {
  const baseStyles = {
    fontFamily: designTokens.typography.fontFamily.primary,
    fontSize: designTokens.typography.fontSize.base,
    borderRadius: designTokens.borderRadius.lg,
    transition: `all ${designTokens.transition.duration.normal} ${designTokens.transition.easing.easeInOut}`,
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    
    '::placeholder': {
      color: designTokens.colors.neutral[400]
    }
  };

  // Size styles
  const sizeStyles = {
    sm: {
      height: designTokens.components.input.height.sm,
      padding: '0.5rem 0.75rem',
      fontSize: designTokens.typography.fontSize.sm
    },
    md: {
      height: designTokens.components.input.height.md,
      padding: designTokens.components.input.padding,
      fontSize: designTokens.typography.fontSize.base
    },
    lg: {
      height: designTokens.components.input.height.lg,
      padding: '1rem 1.25rem',
      fontSize: designTokens.typography.fontSize.lg
    }
  };

  // Variant styles
  const variantStyles = {
    default: {
      background: designTokens.colors.neutral[0],
      border: `1px solid ${hasError ? designTokens.colors.semantic.error.main : designTokens.colors.neutral[300]}`,
      color: designTokens.colors.neutral[900],
      ':focus': {
        borderColor: hasError ? designTokens.colors.semantic.error.main : designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${hasError ? designTokens.colors.semantic.error.main : designTokens.colors.primary[500]}20`
      }
    },
    filled: {
      background: designTokens.colors.neutral[100],
      border: `1px solid transparent`,
      color: designTokens.colors.neutral[900],
      ':focus': {
        background: designTokens.colors.neutral[0],
        borderColor: hasError ? designTokens.colors.semantic.error.main : designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${hasError ? designTokens.colors.semantic.error.main : designTokens.colors.primary[500]}20`
      }
    },
    outline: {
      background: 'transparent',
      border: `2px solid ${hasError ? designTokens.colors.semantic.error.main : designTokens.colors.neutral[300]}`,
      color: designTokens.colors.neutral[900],
      ':focus': {
        borderColor: hasError ? designTokens.colors.semantic.error.main : designTokens.colors.primary[500],
        background: designTokens.colors.neutral[0]
      }
    }
  };

  // Apply focus styles if focused
  const focusStyles = isFocused ? variantStyles[variant][':focus'] || {} : {};

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...focusStyles
  };
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default',
    size = 'md',
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    fullWidth = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = !!error;
    
    const inputStyles = getInputStyles(variant, size, hasError, isFocused, fullWidth);
    
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: designTokens.spacing[1],
      width: fullWidth ? '100%' : 'auto'
    };

    const labelStyles = {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      color: hasError ? designTokens.colors.semantic.error.main : designTokens.colors.neutral[700],
      marginBottom: designTokens.spacing[1]
    };

    const helperTextStyles = {
      fontSize: designTokens.typography.fontSize.xs,
      color: hasError ? designTokens.colors.semantic.error.main : designTokens.colors.neutral[500],
      marginTop: designTokens.spacing[1]
    };

    const inputWrapperStyles = {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      width: fullWidth ? '100%' : 'auto'
    };

    const iconStyles = {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      color: designTokens.colors.neutral[400],
      pointerEvents: 'none' as const,
      zIndex: 1
    };

    const leftIconStyles = {
      ...iconStyles,
      left: designTokens.spacing[3]
    };

    const rightIconStyles = {
      ...iconStyles,
      right: designTokens.spacing[3]
    };

    // Adjust padding if icons are present
    const paddingAdjustment = {
      paddingLeft: leftIcon ? designTokens.spacing[10] : inputStyles.padding?.split(' ')[1] || designTokens.spacing[3],
      paddingRight: rightIcon ? designTokens.spacing[10] : inputStyles.padding?.split(' ')[1] || designTokens.spacing[3]
    };

    return (
      <div style={containerStyles}>
        {label && (
          <label style={labelStyles}>
            {label}
          </label>
        )}
        
        <div style={inputWrapperStyles}>
          {leftIcon && (
            <div style={leftIconStyles}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            style={{
              ...inputStyles,
              ...paddingAdjustment
            }}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {rightIcon && (
            <div style={rightIconStyles}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <div style={helperTextStyles}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
