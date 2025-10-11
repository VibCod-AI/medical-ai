import React, { HTMLAttributes, forwardRef } from 'react';
import { designTokens } from '../tokens';

export type CardVariant = 'default' | 'elevated' | 'outline' | 'glass' | 'medical';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  interactive?: boolean;
  fullWidth?: boolean;
}

const getCardStyles = (
  variant: CardVariant, 
  padding: CardPadding, 
  hover: boolean,
  interactive: boolean,
  fullWidth: boolean
) => {
  const baseStyles = {
    borderRadius: designTokens.borderRadius.xl,
    transition: `all ${designTokens.transition.duration.normal} ${designTokens.transition.easing.easeInOut}`,
    position: 'relative' as const,
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    cursor: interactive ? 'pointer' : 'default'
  };

  // Padding styles
  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: designTokens.spacing[3] },
    md: { padding: designTokens.spacing[4] },
    lg: { padding: designTokens.spacing[6] },
    xl: { padding: designTokens.spacing[8] }
  };

  // Variant styles
  const variantStyles = {
    default: {
      background: designTokens.colors.neutral[0],
      border: `1px solid ${designTokens.colors.neutral[200]}`,
      boxShadow: designTokens.boxShadow.sm,
      ...(hover && {
        ':hover': {
          boxShadow: designTokens.boxShadow.md,
          transform: 'translateY(-2px)'
        }
      })
    },
    elevated: {
      background: designTokens.colors.neutral[0],
      border: 'none',
      boxShadow: designTokens.boxShadow.lg,
      ...(hover && {
        ':hover': {
          boxShadow: designTokens.boxShadow.xl,
          transform: 'translateY(-4px)'
        }
      })
    },
    outline: {
      background: 'transparent',
      border: `2px solid ${designTokens.colors.neutral[300]}`,
      boxShadow: 'none',
      ...(hover && {
        ':hover': {
          borderColor: designTokens.colors.primary[400],
          background: designTokens.colors.neutral[50]
        }
      })
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: designTokens.boxShadow.glass,
      ...(hover && {
        ':hover': {
          background: 'rgba(255, 255, 255, 0.9)',
          transform: 'translateY(-2px)'
        }
      })
    },
    medical: {
      background: `linear-gradient(135deg, ${designTokens.colors.primary[50]} 0%, ${designTokens.colors.secondary[50]} 100%)`,
      border: `1px solid ${designTokens.colors.primary[200]}`,
      boxShadow: `0 4px 16px ${designTokens.colors.primary[500]}10`,
      ...(hover && {
        ':hover': {
          boxShadow: `0 8px 32px ${designTokens.colors.primary[500]}20`,
          transform: 'translateY(-3px)'
        }
      })
    }
  };

  return {
    ...baseStyles,
    ...paddingStyles[padding],
    ...variantStyles[variant]
  };
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default',
    padding = 'md',
    hover = false,
    interactive = false,
    fullWidth = false,
    children,
    ...props 
  }, ref) => {
    const styles = getCardStyles(variant, padding, hover, interactive, fullWidth);

    return (
      <div
        ref={ref}
        style={styles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, children, ...props }, ref) => {
    const headerStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: designTokens.spacing[4]
    };

    const titleStyles = {
      fontSize: designTokens.typography.fontSize.xl,
      fontWeight: designTokens.typography.fontWeight.semibold,
      color: designTokens.colors.neutral[900],
      margin: 0
    };

    const subtitleStyles = {
      fontSize: designTokens.typography.fontSize.sm,
      color: designTokens.colors.neutral[600],
      marginTop: designTokens.spacing[1],
      margin: 0
    };

    return (
      <div ref={ref} style={headerStyles} {...props}>
        <div>
          {title && <h3 style={titleStyles}>{title}</h3>}
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
          {children}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, ...props }, ref) => {
    const contentStyles = {
      flex: 1
    };

    return (
      <div ref={ref} style={contentStyles} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
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
      marginTop: designTokens.spacing[4],
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

CardFooter.displayName = 'CardFooter';
