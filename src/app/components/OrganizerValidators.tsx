import React, { useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';

interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
}

interface OrganizerValidator {
  id: string;
  fullName: string;
  email: string;
  assignedEventIds?: string[];
}

interface OrganizerValidatorsProps {
  events?: OrganizerEvent[];
  validators?: OrganizerValidator[];
  onCreateValidator?: (payload: { fullName: string; email: string; password: string }) => Promise<any>;
  onAssignValidator?: (eventId: string, validatorId: string) => Promise<any>;
  onUnassignValidator?: (eventId: string, validatorId: string) => Promise<any>;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'border-green-500/30 bg-green-500/20 text-green-400';
    case 'draft':
      return 'border-gray-500/30 bg-gray-500/20 text-gray-400';
    case 'archived':
      return 'border-red-500/30 bg-red-500/20 text-red-400';
    case 'pending':
      return 'border-amber-500/30 bg-amber-500/20 text-amber-300';
    default:
      return 'border-purple-500/30 bg-purple-500/20 text-purple-400';
  }
};

export const OrganizerValidators: React.FC<OrganizerValidatorsProps> = ({
  events = [],
  validators = [],
  onCreateValidator,
  onAssignValidator,
  onUnassignValidator,
}) => {
  const [validatorForm, setValidatorForm] = useState({ fullName: '', email: '', password: '' });
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({});
  const [validatorFormError, setValidatorFormError] = useState('');
  const [validatorFormSuccess, setValidatorFormSuccess] = useState('');

  const publishedEvents = events.filter((event) => event.status === 'published');

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Validators</h1>
          <p className="text-gray-400">Create validator accounts and assign them to published events.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-purple-600/15 p-3">
                <UserPlus className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Validator Accounts</h2>
                <p className="text-sm text-gray-400">Create staff accounts for ticket validation at the entrance.</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                autoComplete="off"
                name="validator-full-name"
                value={validatorForm.fullName}
                onChange={(e) => setValidatorForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full name"
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-purple-500"
              />
              <input
                autoComplete="off"
                name="validator-email"
                value={validatorForm.email}
                onChange={(e) => setValidatorForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-purple-500"
              />
              <input
                type="password"
                autoComplete="new-password"
                name="validator-password"
                value={validatorForm.password}
                onChange={(e) => setValidatorForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-purple-500"
              />
              {validatorFormError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {validatorFormError}
                </div>
              )}
              {validatorFormSuccess && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {validatorFormSuccess}
                </div>
              )}
              <button
                onClick={() => {
                  if (!onCreateValidator) return;
                  setValidatorFormError('');
                  setValidatorFormSuccess('');
                  onCreateValidator(validatorForm)
                    .then((result) => {
                      setValidatorForm({ fullName: '', email: '', password: '' });
                      setValidatorFormSuccess(result?.message || 'Validator account created. Activation email sent.');
                    })
                    .catch((error) => {
                      setValidatorFormError(error?.message || 'Failed to create validator account.');
                    });
                }}
                className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-500"
              >
                Create Validator
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {validators.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 p-5 text-sm text-gray-400">
                  No validator accounts yet.
                </div>
              ) : validators.map((validator) => (
                <div key={validator.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <p className="font-semibold text-white">{validator.fullName}</p>
                  <p className="mt-1 text-sm text-gray-400">{validator.email}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Assigned to {validator.assignedEventIds?.length || 0} event{(validator.assignedEventIds?.length || 0) === 1 ? '' : 's'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-purple-600/15 p-3">
                <ShieldCheck className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Validator Assignments</h2>
                <p className="text-sm text-gray-400">Assign validators to your published events.</p>
              </div>
            </div>

            {publishedEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 p-5 text-sm text-gray-400">
                Publish at least one event first to assign validators.
              </div>
            ) : (
              <div className="space-y-4">
                {publishedEvents.map((event) => {
                  const assignedValidators = validators.filter((validator) => (validator.assignedEventIds || []).includes(event.id));
                  return (
                    <div key={event.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-semibold text-white">{event.title}</p>
                          <p className="mt-1 text-sm text-gray-400">{formatDate(event.date)} at {event.time}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {assignedValidators.length === 0 ? (
                          <span className="text-sm text-gray-500">No validators assigned yet.</span>
                        ) : assignedValidators.map((validator) => (
                          <button
                            key={validator.id}
                            onClick={() => onUnassignValidator?.(event.id, validator.id).catch(() => {})}
                            className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-200 transition-colors hover:bg-red-600/20 hover:text-red-300"
                          >
                            {validator.fullName} x
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 md:flex-row">
                        <select
                          value={assignSelections[event.id] || ''}
                          onChange={(e) => setAssignSelections((prev) => ({ ...prev, [event.id]: e.target.value }))}
                          className="flex-1 rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-purple-500"
                        >
                          <option value="">Select validator</option>
                          {validators.map((validator) => (
                            <option key={validator.id} value={validator.id}>
                              {validator.fullName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const validatorId = assignSelections[event.id];
                            if (!validatorId || !onAssignValidator) return;
                            onAssignValidator(event.id, validatorId)
                              .then(() => setAssignSelections((prev) => ({ ...prev, [event.id]: '' })))
                              .catch(() => {});
                          }}
                          className="rounded-xl bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-500"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
