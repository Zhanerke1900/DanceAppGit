import React, { useMemo, useState } from 'react';
import { Shield, Users, UserCheck, ClipboardList, Search, Mail, Calendar, Eye, CheckCircle2, XCircle, FileText, TrendingUp, Ban, RotateCcw } from 'lucide-react';

type AdminTab = 'dashboard' | 'requests' | 'users' | 'moderation';
type BlockReason = 'Fraud' | 'Spam' | 'Fake event' | 'Abuse';

interface AdminPanelProps {
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  overview: {
    totalUsers: number;
    totalOrganizers: number;
    pendingOrganizerApplications: number;
    publishedEvents: number;
    pendingEvents: number;
    usersAddedThisMonth?: number;
    organizersAddedThisMonth?: number;
    eventsAddedThisMonth?: number;
    monthlyGrowth?: Array<{
      label: string;
      users: number;
      organizers: number;
      events: number;
    }>;
  } | null;
  requests: Array<any>;
  archivedRequests: Array<any>;
  users: Array<any>;
  events: Array<any>;
  archivedEvents: Array<any>;
  onSearchUsers: (query: string) => void;
  onDeactivateOrganizer: (id: string) => Promise<any>;
  onActivateOrganizer: (id: string) => Promise<any>;
  onBlockUser: (id: string, reason: BlockReason) => Promise<any>;
  onUnblockUser: (id: string) => Promise<any>;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onApproveEvent: (id: string) => void;
  onRejectEvent: (id: string) => void;
  onViewEvent: (event: any) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  activeTab,
  onNavigate,
  overview,
  requests,
  archivedRequests,
  users,
  events,
  archivedEvents,
  onSearchUsers,
  onDeactivateOrganizer,
  onActivateOrganizer,
  onBlockUser,
  onUnblockUser,
  onApproveRequest,
  onRejectRequest,
  onApproveEvent,
  onRejectEvent,
  onViewEvent,
}) => {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [requestView, setRequestView] = useState<'pending' | 'archive'>('pending');
  const [moderationView, setModerationView] = useState<'pending' | 'archive'>('pending');
  const [blockTarget, setBlockTarget] = useState<any>(null);
  const [blockReason, setBlockReason] = useState<BlockReason>('Fraud');

  const menuItems = [
    { id: 'dashboard', label: 'Admin Panel', icon: Shield },
    { id: 'requests', label: 'Requests', icon: ClipboardList },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'moderation', label: 'Event Moderation', icon: FileText },
  ] as const;

  const statCards = useMemo(() => [
    {
      label: 'Total Users',
      value: overview?.totalUsers ?? 0,
      change: `+${overview?.usersAddedThisMonth ?? 0} this month`,
      icon: Users,
    },
    {
      label: 'Total Organizers',
      value: overview?.totalOrganizers ?? 0,
      change: `+${overview?.organizersAddedThisMonth ?? 0} this month`,
      icon: UserCheck,
    },
    {
      label: 'Pending Organizer Applications',
      value: overview?.pendingOrganizerApplications ?? 0,
      change: 'Waiting for review',
      icon: ClipboardList,
    },
    {
      label: 'Published / Pending Events',
      value: `${overview?.publishedEvents ?? 0} / ${overview?.pendingEvents ?? 0}`,
      change: `+${overview?.eventsAddedThisMonth ?? 0} new this month`,
      icon: Calendar,
    },
  ], [overview]);

  const monthlyGrowth = overview?.monthlyGrowth || [];
  const maxChartValue = Math.max(1, ...monthlyGrowth.flatMap((item) => [item.users, item.organizers, item.events]));

  const buildLine = (values: number[]) => {
    if (!values.length) return '';
    return values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * 100;
        const y = 100 - (value / maxChartValue) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const displayedRequests = requestView === 'pending' ? requests : archivedRequests;
  const displayedEvents = moderationView === 'pending' ? events : archivedEvents;

  const formatDateTime = (value?: string) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const syncSelectedUser = (nextUser: any) => {
    setSelectedUser((current: any) => current?.id === nextUser.id ? nextUser : current);
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="flex">
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 overflow-y-auto border-r border-purple-500/20 bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-8">
          <div className="border-b border-purple-500/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-600/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-purple-100">Developer Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="ml-72 flex-1 p-8 pb-16">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400">Platform overview and moderation shortcuts.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="rounded-xl bg-purple-600/15 p-3">
                          <Icon className="h-6 w-6 text-purple-400" />
                        </div>
                      </div>
                      <p className="mb-2 text-sm text-gray-400">{card.label}</p>
                      <p className="text-3xl font-bold text-white">{card.value}</p>
                      <p className="mt-2 text-sm text-gray-500">{card.change}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Growth</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">Platform Growth This Season</h2>
                      <p className="mt-2 text-sm text-gray-400">Users, organizers, and events added over the last 6 months.</p>
                    </div>
                    <div className="rounded-2xl border border-purple-500/20 bg-purple-600/10 p-3">
                      <TrendingUp className="h-6 w-6 text-purple-300" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                    <div className="mb-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300"><span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400" />Users</div>
                      <div className="flex items-center gap-2 text-gray-300"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />Organizers</div>
                      <div className="flex items-center gap-2 text-gray-300"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Events</div>
                    </div>
                    <div className="h-72">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                        {[20, 40, 60, 80].map((line) => (
                          <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 3" />
                        ))}
                        <polyline fill="none" stroke="#E879F9" strokeWidth="2.4" points={buildLine(monthlyGrowth.map((item) => item.users))} />
                        <polyline fill="none" stroke="#22D3EE" strokeWidth="2.4" points={buildLine(monthlyGrowth.map((item) => item.organizers))} />
                        <polyline fill="none" stroke="#FBBF24" strokeWidth="2.4" points={buildLine(monthlyGrowth.map((item) => item.events))} />
                      </svg>
                    </div>
                    <div className="mt-4 grid grid-cols-6 gap-2 text-center text-xs text-gray-500">
                      {monthlyGrowth.map((item) => (
                        <div key={item.label}>{item.label}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-gray-950 to-black p-6">
                    <p className="text-sm uppercase tracking-[0.25em] text-purple-300">This Month</p>
                    <h3 className="mt-3 text-2xl font-bold text-white">Fresh activity across the platform</h3>
                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-gray-400">New users</p><p className="mt-1 text-3xl font-bold text-white">+{overview?.usersAddedThisMonth ?? 0}</p></div>
                      <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-gray-400">New organizers</p><p className="mt-1 text-3xl font-bold text-white">+{overview?.organizersAddedThisMonth ?? 0}</p></div>
                      <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-gray-400">New events</p><p className="mt-1 text-3xl font-bold text-white">+{overview?.eventsAddedThisMonth ?? 0}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">Requests</h1>
                <p className="text-gray-400">Review organizer applications, archive them, or approve them later.</p>
              </div>

              <div className="inline-flex rounded-2xl border border-purple-500/20 bg-gray-900/70 p-1">
                <button onClick={() => setRequestView('pending')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${requestView === 'pending' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Pending</button>
                <button onClick={() => setRequestView('archive')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${requestView === 'archive' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Archive</button>
              </div>

              <div className="space-y-4">
                {displayedRequests.length === 0 ? (
                  <div className="rounded-2xl border border-purple-500/20 bg-gray-900 p-8 text-gray-400">
                    {requestView === 'pending' ? 'No pending organizer requests right now.' : 'Archive is empty right now.'}
                  </div>
                ) : displayedRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-purple-500/20 bg-gray-900 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{request.fullName}</p>
                        <p className="text-gray-400">{request.email}</p>
                        {request.organizationName && <p className="mt-2 text-purple-300">{request.organizationName}</p>}
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-sm font-medium ${request.organizerStatus === 'rejected' ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-yellow-500/20 bg-yellow-500/15 text-yellow-300'}`}>
                        {request.organizerStatus}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                      <div className="rounded-xl bg-gray-800/40 p-4"><p className="mb-1 text-gray-500">Contact Email</p><p className="break-all text-white">{request.contactEmail || request.email}</p></div>
                      <div className="rounded-xl bg-gray-800/40 p-4"><p className="mb-1 text-gray-500">Phone</p><p className="text-white">{request.phone || 'Not provided'}</p></div>
                    </div>

                    {request.description && (
                      <div className="mt-4 rounded-xl bg-gray-800/30 p-4">
                        <p className="mb-2 text-sm text-gray-500">Description</p>
                        <p className="leading-relaxed text-gray-300">{request.description}</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={() => onApproveRequest(request.id)} className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"><CheckCircle2 className="h-4 w-4" />Approve</button>
                      {request.organizerStatus !== 'rejected' && (
                        <button onClick={() => onRejectRequest(request.id)} className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 text-red-300 transition-colors hover:bg-red-600/25"><XCircle className="h-4 w-4" />Reject</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">User Management</h1>
                <p className="text-gray-400">Search users, inspect account details, and manage access.</p>
              </div>

              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    onSearchUsers(value);
                  }}
                  placeholder="Search by email or name"
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-10 pr-4 text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  {users.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-purple-500/20 bg-gray-900 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-white">{item.fullName}</p>
                          <p className="mt-1 flex items-center gap-2 text-gray-400"><Mail className="h-4 w-4" />{item.email}</p>
                          <p className="mt-2 text-sm text-gray-500">Created At: {formatDateTime(item.createdAt)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-purple-500/20 bg-purple-600/15 px-3 py-1 text-sm text-purple-300">{item.role}</span>
                          <span className={`rounded-full border px-3 py-1 text-sm ${item.accountStatus === 'blocked' ? 'border-red-500/20 bg-red-500/15 text-red-300' : 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300'}`}>
                            {item.accountStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedUser(item)}
                          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        {(item.role === 'organizer' || item.organizerStatus === 'approved') && item.organizerAccessStatus !== 'deactivated' && (
                          <button
                            onClick={() => onDeactivateOrganizer(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="flex items-center gap-2 rounded-xl bg-amber-600/15 px-4 py-2 text-amber-300 transition-colors hover:bg-amber-600/25"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Deactivate
                          </button>
                        )}
                        {(item.role === 'organizer' || item.organizerStatus === 'approved') && item.organizerAccessStatus === 'deactivated' && (
                          <button
                            onClick={() => onActivateOrganizer(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Activate
                          </button>
                        )}
                        {item.accountStatus === 'blocked' ? (
                          <button
                            onClick={() => onUnblockUser(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBlockTarget(item);
                              setBlockReason('Fraud');
                            }}
                            className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 text-red-300 transition-colors hover:bg-red-600/25"
                          >
                            <Ban className="h-4 w-4" />
                            Block
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky top-8 h-fit rounded-2xl border border-purple-500/20 bg-gray-900 p-6">
                  <h2 className="mb-4 text-xl font-bold text-white">User Details</h2>
                  {selectedUser ? (
                    <div className="space-y-4">
                      <div><p className="text-sm text-gray-400">Full Name</p><p className="font-semibold text-white">{selectedUser.fullName}</p></div>
                      <div><p className="text-sm text-gray-400">Email</p><p className="text-white">{selectedUser.email}</p></div>
                      <div><p className="text-sm text-gray-400">Role</p><p className="text-white">{selectedUser.role}</p></div>
                      <div><p className="text-sm text-gray-400">Organizer Status</p><p className="text-white">{selectedUser.organizerStatus || 'none'}</p></div>
                      <div><p className="text-sm text-gray-400">Organizer Access</p><p className="text-white">{selectedUser.organizerAccessStatus || 'active'}</p></div>
                      <div><p className="text-sm text-gray-400">Account Status</p><p className="text-white">{selectedUser.accountStatus}</p></div>
                      <div><p className="text-sm text-gray-400">Created At</p><p className="text-white">{formatDateTime(selectedUser.createdAt)}</p></div>
                      {selectedUser.blockedReason && (
                        <div><p className="text-sm text-gray-400">Blocked Reason</p><p className="text-white">{selectedUser.blockedReason}</p></div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">Choose a user from the list to view details and manage access.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">Event Moderation</h1>
                <p className="text-gray-400">Review submitted events, approve or reject them, and inspect details.</p>
              </div>

              <div className="inline-flex rounded-2xl border border-purple-500/20 bg-gray-900/70 p-1">
                <button onClick={() => setModerationView('pending')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${moderationView === 'pending' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Pending</button>
                <button onClick={() => setModerationView('archive')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${moderationView === 'archive' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Archive</button>
              </div>

              <div className="grid gap-6">
                <div className="space-y-4">
                  {displayedEvents.length === 0 ? (
                    <div className="rounded-2xl border border-purple-500/20 bg-gray-900 p-8 text-gray-400">
                      {moderationView === 'pending' ? 'No pending events right now.' : 'Archive is empty right now.'}
                    </div>
                  ) : displayedEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-purple-500/20 bg-gray-900 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{event.title}</p>
                          <p className="text-gray-400">{event.city} • {event.category} • {event.date}</p>
                          <p className="mt-2 text-sm text-gray-500">Submitted by: {event.submittedBy}</p>
                        </div>
                        <span className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-300">{event.status}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button onClick={() => onViewEvent(event)} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"><Eye className="h-4 w-4" />View Details</button>
                        <button onClick={() => onApproveEvent(event.id)} className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"><CheckCircle2 className="h-4 w-4" />Approve</button>
                        {moderationView !== 'archive' && (
                          <button onClick={() => onRejectEvent(event.id)} className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 text-red-300 transition-colors hover:bg-red-600/25"><XCircle className="h-4 w-4" />Reject</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {blockTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-red-900/20">
            <h3 className="text-2xl font-bold text-white">Block User</h3>
            <p className="mt-2 text-gray-400">Choose the reason for blocking <span className="text-white">{blockTarget.fullName}</span>.</p>

            <div className="mt-5 space-y-3">
              {(['Fraud', 'Spam', 'Fake event', 'Abuse'] as BlockReason[]).map((reason) => (
                <button
                  key={reason}
                  onClick={() => setBlockReason(reason)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    blockReason === reason
                      ? 'border-red-500/30 bg-red-500/15 text-white'
                      : 'border-gray-700 bg-gray-900/70 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBlockTarget(null)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => onBlockUser(blockTarget.id, blockReason).then((data) => {
                  syncSelectedUser(data.user);
                  setBlockTarget(null);
                }).catch(() => {})}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-500"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
