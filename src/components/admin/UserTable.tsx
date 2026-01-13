import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './TierBadge';
import { MoreVertical, Eye, Edit, Ban, Trash2 } from 'lucide-react';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  subscriptionStatus: string;
  createdAt: Date;
}

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onViewDetails: (user: User) => void;
  onChangeTier: (user: User) => void;
  onCancelSubscription: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export function UserTable({
  users,
  loading = false,
  onViewDetails,
  onChangeTier,
  onCancelSubscription,
  onDeleteUser,
}: UserTableProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'cancelled':
      case 'cancelling':
        return 'destructive';
      case 'past_due':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'cancelled':
        return 'Cancelled';
      case 'cancelling':
        return 'Cancelling';
      case 'past_due':
        return 'Past Due';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No users found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Display Name</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.uid}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>{user.displayName || '—'}</TableCell>
            <TableCell>
              <TierBadge tier={user.tier} />
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(user.subscriptionStatus)}>
                {getStatusLabel(user.subscriptionStatus)}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-500">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<MoreVertical size={16} />}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(user)}>
                    <Eye size={16} className="mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeTier(user)}>
                    <Edit size={16} className="mr-2" />
                    Change Tier
                  </DropdownMenuItem>
                  {user.tier !== 'free' && user.subscriptionStatus === 'active' && (
                    <DropdownMenuItem onClick={() => onCancelSubscription(user)}>
                      <Ban size={16} className="mr-2" />
                      Cancel Subscription
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteUser(user)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
