'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { mockPermissions, mockRoleTemplates } from '@/lib/mockData';
import { Permission } from '@/types';

function CreateRoleContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const selectedTemplate = templateId 
    ? mockRoleTemplates.find(t => t.template_id === parseInt(templateId))
    : null;

  const [roleName, setRoleName] = useState(selectedTemplate?.name || '');
  const [roleDescription, setRoleDescription] = useState(selectedTemplate?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    selectedTemplate?.permissions.map(p => p.permission_id) || []
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['animals', 'activities', 'reports', 'management'] as const;

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getSelectedPermissions = () => {
    return mockPermissions.filter(p => selectedPermissions.includes(p.permission_id));
  };

  const filteredPermissions = mockPermissions.filter((perm) => {
    const matchesCategory = !selectedCategory || perm.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedTemplate ? 'Clone Template' : 'Create Custom Role'}
          </h1>
          <p className="text-gray-600 mt-2">
            Select permissions from the library to create a custom role. No policy writing needed.
          </p>
        </div>
        <Link href="/dashboard/roles" className="btn-secondary">
          Cancel
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Details Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Helper, Senior Vet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Describe what this role is for..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {selectedTemplate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800">
                    Cloning from: <strong>{selectedTemplate.display_name}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Permissions Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Permissions ({selectedPermissions.length})
            </h2>
            {selectedPermissions.length === 0 ? (
              <p className="text-sm text-gray-500">No permissions selected yet.</p>
            ) : (
              <div className="space-y-2">
                {getSelectedPermissions().map((perm) => (
                  <div
                    key={perm.permission_id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-700">{perm.display_name}</span>
                    <button
                      onClick={() => togglePermission(perm.permission_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            disabled={!roleName || selectedPermissions.length === 0}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Role
          </button>
        </div>

        {/* Permission Selection */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Permissions</h2>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => {
                const perms = filteredPermissions.filter(p => p.category === category);
                if (selectedCategory && selectedCategory !== category) return null;
                if (perms.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {perms.map((permission) => {
                        const isSelected = selectedPermissions.includes(permission.permission_id);
                        return (
                          <div
                            key={permission.permission_id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => togglePermission(permission.permission_id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-green-500"
                                  />
                                  <h4 className="font-medium text-gray-900">
                                    {permission.display_name}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 ml-6">
                                  {permission.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 ml-6 font-mono">
                                  {permission.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateRolePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CreateRoleContent />
    </Suspense>
  );
}

