/**
 * Input Component - LinkStream Design System
 * Mobile-first input with proper keyboard handling and touch targets
 */

"use client";

import React from 'react';
import { colors, spacing, borderRadius, shadows, transitions, typography, touchTargets } from '@/styles/design-tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input variant */
  variant?: 'default' | 'filled';
  /** Input size */
  inputSize?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Icon to display before input */
  icon?: React.ReactNode;
  /** Icon to display after input */
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      error = false,
      errorMessage,
      label,
      helperText,
      fullWidth = true,
      icon,
      iconRight,
      disabled = false,
      className = '',
      style = {},
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    // Container styles
    const containerStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[2],
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: error ? colors.danger[600] : colors.text.primary,
      marginBottom: spacing[1],
    };

    // Input wrapper styles (for icons)
    const wrapperStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    };

    // Base input styles
    const baseStyles: React.CSSProperties = {
      width: '100%',
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.fontSize.base, // 16px minimum to prevent iOS zoom
      fontWeight: typography.fontWeight.normal,
      borderRadius: borderRadius.lg,
      border: error
        ? `2px solid ${colors.danger[500]}`
        : `2px solid ${colors.border.light}`,
      transition: `all ${transitions.base}`,
      outline: 'none',
      WebkitAppearance: 'none', // Remove iOS default styling
      appearance: 'none',
      color: colors.text.primary,
      ...(icon ? { paddingLeft: spacing[10] } : {}),
      ...(iconRight ? { paddingRight: spacing[10] } : {}),
    };

    // Size variants (ensure minimum touch target)
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        minHeight: touchTargets.min, // 44px
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
      },
      md: {
        minHeight: touchTargets.comfortable, // 48px
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
      },
      lg: {
        minHeight: touchTargets.large, // 56px
        padding: `${spacing[4]} ${spacing[5]}`,
        fontSize: typography.fontSize.lg,
      },
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: colors.background,
      },
      filled: {
        background: colors.gray[50],
        border: `2px solid ${colors.gray[50]}`,
      },
    };

    // Focus styles
    const focusStyles: React.CSSProperties = error
      ? {
          borderColor: colors.danger[500],
          boxShadow: `0 0 0 3px ${colors.danger[100]}`,
        }
      : {
          borderColor: colors.primary[500],
          boxShadow: `0 0 0 3px ${colors.primary[100]}`,
        };

    // Disabled styles
    const disabledStyles: React.CSSProperties = disabled
      ? {
          opacity: 0.6,
          cursor: 'not-allowed',
          background: colors.gray[100],
        }
      : {};

    // Icon styles
    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      color: colors.text.secondary,
      pointerEvents: 'none',
    };

    const leftIconStyles: React.CSSProperties = {
      ...iconStyles,
      left: spacing[3],
    };

    const rightIconStyles: React.CSSProperties = {
      ...iconStyles,
      right: spacing[3],
    };

    // Helper/error text styles
    const helperTextStyles: React.CSSProperties = {
      fontSize: typography.fontSize.sm,
      color: error ? colors.danger[600] : colors.text.secondary,
      marginTop: spacing[1],
    };

    // Combine styles
    const inputStyles: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[inputSize],
      ...variantStyles[variant],
      ...(isFocused ? focusStyles : {}),
      ...disabledStyles,
      ...style,
    };

    // Set appropriate inputMode for mobile keyboards
    const getInputMode = () => {
      if (props.inputMode) return props.inputMode;

      switch (type) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'url':
          return 'url';
        case 'number':
          return 'numeric';
        case 'search':
          return 'search';
        default:
          return 'text';
      }
    };

    // Set appropriate autocomplete for better UX
    const getAutoComplete = () => {
      if (props.autoComplete) return props.autoComplete;

      switch (type) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'password':
          return 'current-password';
        default:
          return undefined;
      }
    };

    return (
      <div style={containerStyles}>
        {label && <label style={labelStyles}>{label}</label>}

        <div style={wrapperStyles}>
          {icon && <span style={leftIconStyles}>{icon}</span>}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={className}
            style={inputStyles}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            inputMode={getInputMode() as any}
            autoComplete={getAutoComplete()}
            {...props}
          />

          {iconRight && <span style={rightIconStyles}>{iconRight}</span>}
        </div>

        {(errorMessage || helperText) && (
          <span style={helperTextStyles}>
            {error && errorMessage ? errorMessage : helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
