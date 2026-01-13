import { ReactNode } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold text-gray-900">
                  ⚙️ Admin Panel
                </h1>
                <nav className="flex gap-4">
                  <Link
                    href="/dashboard/admin"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Users
                  </Link>
                  <Link
                    href="/dashboard/admin/email"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Email
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Back to App
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
