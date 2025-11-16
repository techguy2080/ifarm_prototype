'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockRoles, mockFarms } from '@/lib/mockData';

export default function InviteUserPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    farm_id: '',
    role_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would call the API
    alert('Invitation would be sent! (Prototype)');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invite User</h1>
          <p className="text-gray-600 mt-2">
            Send a secure invitation email. User will set their password when accepting.
          </p>
        </div>
        <Link href="/dashboard/users" className="btn-secondary">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* User Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+256 700 000 000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm *
              </label>
              <select
                required
                value={formData.farm_id}
                onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a farm</option>
                {mockFarms.map((farm) => (
                  <option key={farm.farm_id} value={farm.farm_id}>
                    {farm.farm_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                required
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a role</option>
                {mockRoles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Invitation Security</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Secure invitation link will be sent via email</li>
            <li>• Link expires in 48-72 hours</li>
            <li>• User will create password when accepting</li>
            <li>• Password must meet strength requirements (12+ chars, complexity)</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <Link href="/dashboard/users" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Send Invitation
          </button>
        </div>
      </form>
    </div>
  );
}

