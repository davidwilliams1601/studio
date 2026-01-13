'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import { UserTable, User } from '@/components/admin/UserTable';
import { Pagination } from '@/components/admin/Pagination';
import { UserDetailsDialog } from '@/components/admin/UserDetailsDialog';
import { ChangeTierDialog } from '@/components/admin/ChangeTierDialog';
import { CancelSubscriptionDialog } from '@/components/admin/CancelSubscriptionDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function UsersManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 50,
  });

  // Debounce search
  const debouncedSearch = useDebounce(search, 500);

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [changeTierOpen, setChangeTierOpen] = useState(false);
  const [cancelSubOpen, setCancelSubOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const idToken = await user.getIdToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [user, page, debouncedSearch, pagination.limit]);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Dialog handlers
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleChangeTier = (user: User) => {
    setSelectedUser(user);
    setChangeTierOpen(true);
  };

  const handleCancelSubscription = (user: User) => {
    setSelectedUser(user);
    setCancelSubOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteUserOpen(true);
  };

  const handleSuccess = () => {
    // Refresh user list after successful action
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 mt-1">
            Manage user accounts, subscriptions, and tiers
          </p>
        </div>
        <Button icon={<UserPlus size={20} />} disabled>
          Invite User
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable
            users={users}
            loading={loading}
            onViewDetails={handleViewDetails}
            onChangeTier={handleChangeTier}
            onCancelSubscription={handleCancelSubscription}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Dialogs */}
      <UserDetailsDialog
        user={selectedUser}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ChangeTierDialog
        user={selectedUser}
        open={changeTierOpen}
        onOpenChange={setChangeTierOpen}
        onSuccess={handleSuccess}
      />

      <CancelSubscriptionDialog
        user={selectedUser}
        open={cancelSubOpen}
        onOpenChange={setCancelSubOpen}
        onSuccess={handleSuccess}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={deleteUserOpen}
        onOpenChange={setDeleteUserOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
