'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Search, Bell, Settings, Menu, X, Beef } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden" style={{ width: '100vw' }}>
      {/* Top Navigation Bar - Fixed */}
      <nav className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 border-b-2 border-emerald-800 shadow-xl fixed top-0 left-0 right-0 z-50 backdrop-blur-sm h-16 flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/dashboard" className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 hover:text-emerald-200 transition-all transform hover:scale-105">
              <Beef className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-lg" />
              <span className="drop-shadow-md hidden sm:inline">iFarm</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - Hidden on small mobile */}
            <div className="hidden md:flex items-center relative group">
              <Search className="absolute left-4 h-5 w-5 text-emerald-300 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-12 pr-4 py-2.5 bg-emerald-900/50 backdrop-blur-sm border border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 text-white placeholder-emerald-300 text-sm w-64 xl:w-80 transition-all hover:bg-emerald-800/50 focus:bg-emerald-900 shadow-lg"
              />
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 sm:p-2.5 text-white hover:text-emerald-200 hover:bg-white/10 rounded-xl transition-all transform hover:scale-110">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-yellow-400 rounded-full border-2 border-emerald-900 animate-pulse"></span>
            </button>
            
            {/* Settings */}
            <Link
              href="/dashboard/settings"
              className="p-2 sm:p-2.5 text-white hover:text-emerald-200 hover:bg-white/10 rounded-xl transition-all transform hover:scale-110"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {/* User Info - Show on larger screens */}
            <div className="hidden xl:flex items-center space-x-3 pl-4 border-l border-emerald-700/50">
              <div className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center ring-2 ring-emerald-400">
                <span className="text-emerald-700 font-bold text-sm">
                  {user.first_name[0]}{user.last_name[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-emerald-200">{user.email}</p>
                <p className="text-xs font-semibold text-emerald-300">
                  {user.is_super_admin
                    ? 'Super Admin'
                    : user.is_owner 
                      ? 'Owner' 
                      : user.roles && user.roles.length > 0
                        ? user.roles.map(r => r.name).join(', ')
                        : 'No Role'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 relative mt-16" style={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden mt-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Fixed */}
        <div className={`
          fixed lg:fixed top-16 bottom-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content - Scrollable */}
        <div 
          className="flex-1 w-full lg:w-[calc(100vw-256px)] lg:ml-64 overflow-y-auto overflow-x-hidden" 
          style={{ 
            height: '100%'
          }}
        >
          {children}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
