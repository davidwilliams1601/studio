/**
 * Skeleton Component - LinkStream Design System
 * Loading skeleton for better perceived performance
 */

"use client";

import React from 'react';
import { colors, borderRadius, transitions } from '@/styles/design-tokens';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (can be string or number) */
  width?: string | number;
  /** Height (can be string or number) */
  height?: string | number;
  /** Animation speed */
  animation?: 'pulse' | 'wave' | 'none';
  /** Children */
  children?: React.ReactNode;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      className = '',
      style = {},
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles: React.CSSProperties = {
      backgroundColor: colors.gray[200],
      display: 'inline-block',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      text: {
        height: height || '1em',
        width: width || '100%',
        borderRadius: borderRadius.sm,
        transform: 'scale(1, 0.6)',
      },
      circular: {
        height: height || '40px',
        width: width || '40px',
        borderRadius: borderRadius.full,
      },
      rectangular: {
        height: height || '100px',
        width: width || '100%',
        borderRadius: borderRadius.lg,
      },
    };

    // Animation styles
    const animationStyles: Record<string, React.CSSProperties> = {
      pulse: {
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      },
      wave: {
        background: `linear-gradient(90deg, ${colors.gray[200]} 0%, ${colors.gray[300]} 50%, ${colors.gray[200]} 100%)`,
        backgroundSize: '200% 100%',
        animation: 'skeleton-wave 1.5s ease-in-out infinite',
      },
      none: {},
    };

    // Combine styles
    const skeletonStyles: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
      ...(animation !== 'none' ? animationStyles[animation] : {}),
    };

    return (
      <>
        <div ref={ref} className={className} style={skeletonStyles} {...props}>
          {children}
        </div>

        {/* Inline keyframe animations */}
        <style jsx>{`
          @keyframes skeleton-pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.4;
            }
          }

          @keyframes skeleton-wave {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton patterns for common use cases

export const SkeletonText: React.FC<{ lines?: number; width?: string }> = ({
  lines = 3,
  width = '100%',
}) => {
  return (
    <div style={{ width }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          style={{
            marginBottom: '0.5rem',
            width: index === lines - 1 ? '80%' : '100%',
          }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ showAvatar?: boolean }> = ({
  showAvatar = true,
}) => {
  return (
    <div
      style={{
        padding: '1.5rem',
        border: `1px solid ${colors.border.light}`,
        borderRadius: borderRadius.xl,
      }}
    >
      {showAvatar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Skeleton variant="circular" width="48px" height="48px" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" style={{ marginBottom: '0.5rem' }} />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
      )}
      <SkeletonText lines={3} />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '1rem',
            padding: '1rem 0',
            borderBottom: `1px solid ${colors.border.light}`,
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboard: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Header skeleton */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Skeleton
          variant="text"
          width="300px"
          height="2rem"
          style={{ margin: '0 auto 1rem auto' }}
        />
        <Skeleton
          variant="text"
          width="200px"
          height="1rem"
          style={{ margin: '0 auto' }}
        />
      </div>

      {/* Card skeleton */}
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton variant="rectangular" height="300px" />
      </div>

      {/* List skeleton */}
      <SkeletonCard />
      <div style={{ height: '1rem' }} />
      <SkeletonCard />
    </div>
  );
};

export default Skeleton;
