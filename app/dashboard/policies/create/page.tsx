'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreatePolicyPage() {
  const [policyData, setPolicyData] = useState({
    name: '',
    description: '',
    priority: 100,
    effect: 'allow' as 'allow' | 'deny',
    conditions: [] as Array<{ attribute: string; operator: string; value: string | string[] }>,
    time_conditions: [] as Array<{
      attribute: 'environment.time' | 'environment.day_of_week' | 'environment.date';
      operator: string;
      value: string | string[];
      timezone?: string;
    }>,
  });

  const addTimeCondition = () => {
    setPolicyData({
      ...policyData,
      time_conditions: [
        ...policyData.time_conditions,
        { attribute: 'environment.time', operator: 'between', value: ['08:00', '18:00'] },
      ],
    });
  };

  const updateTimeCondition = (index: number, field: string, value: any) => {
    const updated = [...policyData.time_conditions];
    updated[index] = { ...updated[index], [field]: value };
    setPolicyData({ ...policyData, time_conditions: updated });
  };

  const removeTimeCondition = (index: number) => {
    setPolicyData({
      ...policyData,
      time_conditions: policyData.time_conditions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Policy would be created! (Prototype)');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create ABAC Policy</h1>
          <p className="text-gray-600 mt-2">
            Create advanced access control policies with time-based restrictions.
          </p>
        </div>
        <Link href="/dashboard/roles" className="btn-secondary">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Policy Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Policy Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Name *
              </label>
              <input
                type="text"
                required
                value={policyData.name}
                onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
                placeholder="e.g., Business Hours Only"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={policyData.description}
                onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
                placeholder="Describe what this policy does..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effect *
                </label>
                <select
                  required
                  value={policyData.effect}
                  onChange={(e) => setPolicyData({ ...policyData, effect: e.target.value as 'allow' | 'deny' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <input
                  type="number"
                  required
                  value={policyData.priority}
                  onChange={(e) => setPolicyData({ ...policyData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers = higher priority</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time-Based Conditions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Time-Based Restrictions</h2>
            <button
              type="button"
              onClick={addTimeCondition}
              className="btn-secondary text-sm"
            >
              Add Time Condition
            </button>
          </div>

          {policyData.time_conditions.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">No time conditions added yet</p>
              <button
                type="button"
                onClick={addTimeCondition}
                className="btn-primary"
              >
                Add Your First Time Condition
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {policyData.time_conditions.map((condition, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Time Condition {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeTimeCondition(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attribute
                      </label>
                      <select
                        value={condition.attribute}
                        onChange={(e) => updateTimeCondition(index, 'attribute', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="environment.time">Time of Day</option>
                        <option value="environment.day_of_week">Day of Week</option>
                        <option value="environment.date">Date</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operator
                      </label>
                      <select
                        value={condition.operator}
                        onChange={(e) => updateTimeCondition(index, 'operator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {condition.attribute === 'environment.time' && (
                          <>
                            <option value="between">Between</option>
                            <option value="not_between">Not Between</option>
                            <option value="equals">Equals</option>
                          </>
                        )}
                        {condition.attribute === 'environment.day_of_week' && (
                          <>
                            <option value="in">In</option>
                            <option value="not_in">Not In</option>
                          </>
                        )}
                        {condition.attribute === 'environment.date' && (
                          <>
                            <option value="between">Between</option>
                            <option value="after">After</option>
                            <option value="before">Before</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      {condition.attribute === 'environment.time' && condition.operator === 'between' && (
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={Array.isArray(condition.value) ? condition.value[0] : ''}
                            onChange={(e) => {
                              const newValue = Array.isArray(condition.value) 
                                ? [e.target.value, condition.value[1]]
                                : [e.target.value, '18:00'];
                              updateTimeCondition(index, 'value', newValue);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <span className="py-2">to</span>
                          <input
                            type="time"
                            value={Array.isArray(condition.value) ? condition.value[1] : ''}
                            onChange={(e) => {
                              const newValue = Array.isArray(condition.value)
                                ? [condition.value[0], e.target.value]
                                : ['08:00', e.target.value];
                              updateTimeCondition(index, 'value', newValue);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      )}
                      {condition.attribute === 'environment.day_of_week' && (
                        <div className="flex flex-wrap gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <label key={day} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={Array.isArray(condition.value) && condition.value.includes(day)}
                                onChange={(e) => {
                                  const current = Array.isArray(condition.value) ? condition.value : [];
                                  const newValue = e.target.checked
                                    ? [...current, day]
                                    : current.filter(d => d !== day);
                                  updateTimeCondition(index, 'value', newValue);
                                }}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-green-500"
                              />
                              <span className="ml-1 text-sm text-gray-700">{day.slice(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {condition.attribute === 'environment.date' && (
                        <input
                          type="date"
                          value={Array.isArray(condition.value) ? condition.value[0] : condition.value as string}
                          onChange={(e) => updateTimeCondition(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  </div>

                  {condition.attribute === 'environment.time' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone (Optional)
                      </label>
                      <input
                        type="text"
                        value={condition.timezone || 'Africa/Kampala'}
                        onChange={(e) => updateTimeCondition(index, 'timezone', e.target.value)}
                        placeholder="Africa/Kampala"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Policy Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Policy Preview</h3>
          <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
            {JSON.stringify({
              name: policyData.name,
              effect: policyData.effect,
              priority: policyData.priority,
              time_conditions: policyData.time_conditions,
            }, null, 2)}
          </pre>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">How Time Policies Work</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Time policies are evaluated after permission checks (Phase 2)</li>
            <li>• If a permission grants access but time policy denies → DENY</li>
            <li>• Time policies can restrict by time of day, day of week, or date ranges</li>
            <li>• Multiple time conditions can be combined (AND logic)</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <Link href="/dashboard/roles" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={!policyData.name || policyData.time_conditions.length === 0} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Create Policy
          </button>
        </div>
      </form>
    </div>
  );
}

