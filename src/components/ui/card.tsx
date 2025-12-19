/**
 * Card Component - LinkStream Design System
 * Mobile-first card with hover effects and variants
 */

"use client";

import React from 'react';
import { colors, spacing, borderRadius, shadows, transitions, typography } from '@/styles/design-tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether the card is clickable/hoverable */
  hoverable?: boolean;
  /** Children */
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      children,
      className = '',
      style = {},
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // Base styles
    const baseStyles: React.CSSProperties = {
      borderRadius: borderRadius.xl,
      transition: `all ${transitions.base}`,
      overflow: 'hidden',
    };

    // Padding variants
    const paddingStyles: Record<string, React.CSSProperties> = {
      none: { padding: 0 },
      sm: { padding: spacing[4] },    // 16px
      md: { padding: spacing[6] },    // 24px
      lg: { padding: spacing[8] },    // 32px
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: colors.background,
        border: 'none',
        boxShadow: 'none',
      },
      bordered: {
        background: colors.background,
        border: `1px solid ${colors.border.light}`,
        boxShadow: 'none',
      },
      elevated: {
        background: colors.background,
        border: 'none',
        boxShadow: shadows.md,
      },
      interactive: {
        background: colors.background,
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.sm,
        cursor: 'pointer',
      },
    };

    // Hover styles
    const hoverStyles: Record<string, React.CSSProperties> = {
      default: {},
      bordered: {
        borderColor: colors.border.default,
        boxShadow: shadows.sm,
      },
      elevated: {
        boxShadow: shadows.lg,
        transform: 'translateY(-2px)',
      },
      interactive: {
        borderColor: colors.primary[300],
        boxShadow: shadows.md,
        transform: 'translateY(-2px)',
      },
    };

    // Combine styles
    const cardStyles: React.CSSProperties = {
      ...baseStyles,
      ...paddingStyles[padding],
      ...variantStyles[variant],
      ...(isHovered && (hoverable || variant === 'interactive') ? hoverStyles[variant] : {}),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={className}
        style={cardStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// CardHeader Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', style = {}, ...props }, ref) => {
    const headerStyles: React.CSSProperties = {
      marginBottom: spacing[4],
      ...style,
    };

    return (
      <div ref={ref} className={className} style={headerStyles} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// CardTitle Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as = 'h3', children, className = '', style = {}, ...props }, ref) => {
    const Component = as;

    const titleStyles: React.CSSProperties = {
      ...typography.heading[as],
      color: colors.text.primary,
      margin: 0,
      ...style,
    };

    return (
      <Component ref={ref} className={className} style={titleStyles} {...props}>
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// CardDescription Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className = '', style = {}, ...props }, ref) => {
    const descriptionStyles: React.CSSProperties = {
      ...typography.small,
      color: colors.text.secondary,
      margin: `${spacing[2]} 0 0 0`,
      ...style,
    };

    return (
      <p ref={ref} className={className} style={descriptionStyles} {...props}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

// CardContent Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', style = {}, ...props }, ref) => {
    const contentStyles: React.CSSProperties = {
      ...style,
    };

    return (
      <div ref={ref} className={className} style={contentStyles} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// CardFooter Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', style = {}, ...props }, ref) => {
    const footerStyles: React.CSSProperties = {
      marginTop: spacing[4],
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      ...style,
    };

    return (
      <div ref={ref} className={className} style={footerStyles} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
