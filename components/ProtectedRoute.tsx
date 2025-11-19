'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, hasAnyPermission } from '@/lib/auth';
import { getRequiredPermissions } from '@/lib/permissions';
import type { AuthUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // Check if path requires permissions
      const requiredPermissions = getRequiredPermissions(pathname || '');
      
      // If no permissions required, allow access
      if (requiredPermissions.length === 0) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // Check if user has required permissions
      const hasAccess = hasAnyPermission(currentUser, requiredPermissions);
      
      if (!hasAccess) {
        // Redirect to dashboard with error message
        router.push('/dashboard?error=unauthorized');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!authorized || !user) {
    return null;
  }

  return <>{children}</>;
}








