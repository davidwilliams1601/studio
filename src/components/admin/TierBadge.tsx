import React from 'react';

interface TierBadgeProps {
  tier: string;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const tierConfig: Record<string, { label: string; bg: string; text: string }> = {
    free: {
      label: 'Free',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
    },
    basic: {
      label: 'Basic',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
    },
    pro: {
      label: 'Pro',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
    },
    business: {
      label: 'Business',
      bg: 'bg-green-100',
      text: 'text-green-700',
    },
    enterprise: {
      label: 'Enterprise',
      bg: 'bg-orange-100',
      text: 'text-orange-700',
    },
  };

  const config = tierConfig[tier.toLowerCase()] || tierConfig.free;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
