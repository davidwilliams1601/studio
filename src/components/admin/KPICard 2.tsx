import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'danger';
}

export function KPICard({ title, value, trend, icon, variant = 'default' }: KPICardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';

    if (variant === 'success') {
      return trend.direction === 'up' ? 'text-green-600' : 'text-red-600';
    }
    if (variant === 'danger') {
      return trend.direction === 'up' ? 'text-red-600' : 'text-green-600';
    }
    return 'text-gray-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${getTrendColor()}`}>
            {trend.direction === 'up' ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
