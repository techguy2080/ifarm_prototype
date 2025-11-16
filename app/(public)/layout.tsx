'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import './public-layout.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Public Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Barn/Farm structure */}
                    <path d="M3 21h18M4 21V10l8-7 8 7v11M9 21V14h6v7" />
                    {/* Roof accent */}
                    <path d="M2 10l10-8 10 8" strokeWidth="2.5" />
                    {/* Door */}
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 tracking-tight leading-none group-hover:text-green-600 transition-colors">iFarm</span>
                <span className="text-xs font-semibold text-green-600 tracking-wide uppercase leading-none">Livestock Manager</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Home
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                About Us
              </Link>
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <Link href="/" className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg">
                Home
              </Link>
              <Link href="/pricing" className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg">
                Pricing
              </Link>
              <Link href="/about" className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg">
                About Us
              </Link>
              <Link href="/login" className="block px-4 py-2 btn-primary text-center">
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
      {children}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Barn/Farm structure */}
                    <path d="M3 21h18M4 21V10l8-7 8 7v11M9 21V14h6v7" />
                    {/* Roof accent */}
                    <path d="M2 10l10-8 10 8" strokeWidth="2.5" />
                    {/* Door */}
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-none">iFarm</h3>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide">Livestock Manager</p>
                </div>
              </div>
              <p className="text-gray-400">
                Modern farm management tools that help you track animals, manage operations, and grow your business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 iFarm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

