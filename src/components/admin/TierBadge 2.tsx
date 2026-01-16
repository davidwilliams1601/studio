import { Badge } from '@/components/ui/badge';

type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

interface TierBadgeProps {
  tier: SubscriptionTier;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const getVariant = () => {
    switch (tier) {
      case 'free':
        return 'secondary';
      case 'pro':
        return 'default';
      case 'business':
        return 'default';
      case 'enterprise':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getColor = () => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'pro':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'business':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return '';
    }
  };

  return (
    <Badge variant={getVariant()} className={getColor()}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </Badge>
  );
}
