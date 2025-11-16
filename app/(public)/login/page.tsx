'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, demoUsers } from '@/lib/auth';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = login(email, password);
      if (user) {
        // Store in localStorage (in real app, use secure session)
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  const useDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Try Demo Accounts</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">Welcome Back</h1>
          <p className="text-xl text-gray-600 font-light">Sign in to access your <span className="text-green-600 font-semibold">iFarm</span> dashboard</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-100 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <p className="text-sm font-bold text-gray-900 mb-5 text-center tracking-wide uppercase">Quick Demo Access</p>
            <div className="space-y-3">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => useDemoAccount(user.email, user.password)}
                  className="group w-full text-left px-5 py-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{user.first_name} {user.last_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    {user.is_owner && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Owner</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
              <p className="text-sm text-center text-gray-700">
                <span className="font-semibold text-emerald-700">Password for all demos:</span> 
                <code className="ml-2 px-3 py-1 bg-white rounded-lg font-mono font-bold text-emerald-600 border border-emerald-200">demo123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

