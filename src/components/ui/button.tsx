/**
 * Button Component - LinkStream Design System
 * Mobile-first button with proper touch targets and variants
 */

"use client";

import React from 'react';
import { colors, spacing, borderRadius, shadows, transitions, touchTargets, gradients, typography } from '@/styles/design-tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Full width button (useful for mobile) */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before children */
  icon?: React.ReactNode;
  /** Icon to display after children */
  iconRight?: React.ReactNode;
  /** Children */
  children?: React.ReactNode;
  /** Render as child (for Link compatibility) */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      iconRight,
      children,
      className = '',
      style = {},
      ...props
    },
    ref
  ) => {
    // Base styles (mobile-first)
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      fontFamily: typography.fontFamily.sans,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: borderRadius.lg,
      border: 'none',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: `all ${transitions.base}`,
      textDecoration: 'none',
      position: 'relative',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled || loading ? 0.6 : 1,
      WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
      userSelect: 'none',
    };

    // Size variants (ensure minimum touch target of 48px)
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        minHeight: touchTargets.min, // 44px minimum
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.fontSize.sm,
      },
      md: {
        minHeight: touchTargets.comfortable, // 48px recommended
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
      },
      lg: {
        minHeight: touchTargets.large, // 56px large
        padding: `${spacing[4]} ${spacing[8]}`,
        fontSize: typography.fontSize.lg,
      },
      icon: {
        minHeight: touchTargets.comfortable, // 48px
        minWidth: touchTargets.comfortable,
        padding: spacing[2],
        fontSize: typography.fontSize.base,
      },
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: gradients.primary,
        color: colors.text.inverse,
        boxShadow: shadows.md,
      },
      secondary: {
        background: colors.gray[100],
        color: colors.text.primary,
        boxShadow: shadows.sm,
      },
      outline: {
        background: 'transparent',
        color: colors.primary[600],
        border: `2px solid ${colors.border.default}`,
        boxShadow: 'none',
      },
      ghost: {
        background: 'transparent',
        color: colors.text.primary,
        boxShadow: 'none',
      },
      danger: {
        background: gradients.danger,
        color: colors.text.inverse,
        boxShadow: shadows.md,
      },
      destructive: {
        background: gradients.danger,
        color: colors.text.inverse,
        boxShadow: shadows.md,
      },
    };

    // Hover styles (applied via inline style for simplicity)
    const hoverStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: gradients.primaryHover,
        transform: 'translateY(-1px)',
        boxShadow: shadows.lg,
      },
      secondary: {
        background: colors.gray[200],
        transform: 'translateY(-1px)',
        boxShadow: shadows.md,
      },
      outline: {
        background: colors.primary[50],
        borderColor: colors.primary[500],
        transform: 'translateY(-1px)',
      },
      ghost: {
        background: colors.gray[100],
      },
      danger: {
        filter: 'brightness(1.1)',
        transform: 'translateY(-1px)',
        boxShadow: shadows.lg,
      },
      destructive: {
        filter: 'brightness(1.1)',
        transform: 'translateY(-1px)',
        boxShadow: shadows.lg,
      },
    };

    // Active/pressed styles
    const activeStyles: React.CSSProperties = {
      transform: 'translateY(0)',
      boxShadow: shadows.sm,
    };

    // Combine all styles
    const buttonStyles: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    // Handle hover state via onMouseEnter/onMouseLeave
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);

    const appliedStyles = {
      ...buttonStyles,
      ...(isHovered && !disabled && !loading ? hoverStyles[variant] : {}),
      ...(isActive && !disabled && !loading ? activeStyles : {}),
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={className}
        style={appliedStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
            aria-label="Loading"
          />
        )}
        {!loading && icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        {children && <span>{children}</span>}
        {!loading && iconRight && <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>}

        {/* Inline keyframe animation for loading spinner */}
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export for backward compatibility with old button component usage
export const buttonVariants = ({ variant, size }: { variant?: string; size?: string } = {}) => {
  return '';
};

export default Button;
