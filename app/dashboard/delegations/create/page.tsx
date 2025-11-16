'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockUsers, mockRoles, mockPermissions } from '@/lib/mockData';

export default function CreateDelegationPage() {
  const [formData, setFormData] = useState({
    delegate_user_id: '',
    delegation_type: 'permission' as 'permission' | 'role' | 'full_access',
    start_date: '',
    end_date: '',
    description: '',
    delegated_role_id: '',
    delegated_permission_ids: [] as number[],
    restrictions: {
      time_restriction: { start: '', end: '' },
      resource_restriction: { animal_ids: [] as number[] },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Delegation would be created! (Prototype)');
  };

  const togglePermission = (permissionId: number) => {
    setFormData({
      ...formData,
      delegated_permission_ids: formData.delegated_permission_ids.includes(permissionId)
        ? formData.delegated_permission_ids.filter(id => id !== permissionId)
        : [...formData.delegated_permission_ids, permissionId],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Delegation</h1>
          <p className="text-gray-600 mt-2">
            Grant temporary access to another user with time-bound expiration.
          </p>
        </div>
        <Link href="/dashboard/delegations" className="btn-secondary">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delegate To *
              </label>
              <select
                required
                value={formData.delegate_user_id}
                onChange={(e) => setFormData({ ...formData, delegate_user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select user</option>
                {mockUsers.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delegation Type *
              </label>
              <select
                required
                value={formData.delegation_type}
                onChange={(e) => setFormData({
                  ...formData,
                  delegation_type: e.target.value as 'permission' | 'role' | 'full_access',
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="permission">Permission Delegation</option>
                <option value="role">Role Delegation</option>
                <option value="full_access">Full Access Delegation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Why are you delegating access?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* What to Delegate */}
        {formData.delegation_type === 'permission' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {mockPermissions.map((perm) => {
                const isSelected = formData.delegated_permission_ids.includes(perm.permission_id);
                return (
                  <div
                    key={perm.permission_id}
                    onClick={() => togglePermission(perm.permission_id)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected ? 'border-emerald-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{perm.display_name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {formData.delegation_type === 'role' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Role</h2>
            <select
              required
              value={formData.delegated_role_id}
              onChange={(e) => setFormData({ ...formData, delegated_role_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a role</option>
              {mockRoles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name} ({role.permissions.length} permissions)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Optional Restrictions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Restrictions</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Restriction Start
                </label>
                <input
                  type="time"
                  value={formData.restrictions.time_restriction.start}
                  onChange={(e) => setFormData({
                    ...formData,
                    restrictions: {
                      ...formData.restrictions,
                      time_restriction: {
                        ...formData.restrictions.time_restriction,
                        start: e.target.value,
                      },
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Restriction End
                </label>
                <input
                  type="time"
                  value={formData.restrictions.time_restriction.end}
                  onChange={(e) => setFormData({
                    ...formData,
                    restrictions: {
                      ...formData.restrictions,
                      time_restriction: {
                        ...formData.restrictions.time_restriction,
                        end: e.target.value,
                      },
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Delegation Notes</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• All delegated actions are logged with both delegate and delegator information</li>
            <li>• Delegations automatically expire at the end date</li>
            <li>• You can revoke delegations early if needed</li>
            <li>• Full access delegations grant all permissions temporarily</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <Link href="/dashboard/delegations" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Delegation
          </button>
        </div>
      </form>
    </div>
  );
}

