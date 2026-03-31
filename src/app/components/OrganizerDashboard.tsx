import React from 'react';
import { Calendar, Clock3, Plus, Sparkles } from 'lucide-react';

interface OrganizerEvent {
  id: string;
  status: string;
}

interface OrganizerDashboardProps {
  onCreateEvent: () => void;
  events?: OrganizerEvent[];
  canCreateEvent?: boolean;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  onCreateEvent,
  events = [],
  canCreateEvent = true,
}) => {
  const publishedCount = events.filter((event) => event.status === 'published').length;
  const pendingCount = events.filter((event) => event.status === 'pending').length;
  const draftCount = events.filter((event) => event.status === 'draft').length;

  const stats = [
    {
      title: 'Total Events',
      value: String(events.length),
      change: 'All created events',
      icon: Calendar,
      iconClass: 'bg-purple-600/20 text-purple-400',
    },
    {
      title: 'Pending Review',
      value: String(pendingCount),
      change: 'Waiting for admin decision',
      icon: Clock3,
      iconClass: 'bg-amber-600/20 text-amber-400',
    },
    {
      title: 'Published Events',
      value: String(publishedCount),
      change: `${draftCount} drafts saved`,
      icon: Sparkles,
      iconClass: 'bg-emerald-600/20 text-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Track your event activity and jump into event creation from one place.</p>
          </div>
          <button
            onClick={onCreateEvent}
            disabled={!canCreateEvent}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          >
            <Plus className="h-5 w-5" />
            Create Event
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6 transition-all duration-300 hover:border-purple-500/40"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${stat.iconClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mb-1 text-sm text-gray-400">{stat.title}</p>
                <p className="mb-2 text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Quick Start</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Ready to publish your next event?</h2>
          <p className="mt-3 max-w-2xl text-gray-400">
            Use the create event flow to prepare a new event, save it as a draft, or send it for moderation. Your event lists and validator management now live in their own dedicated tabs for cleaner navigation.
          </p>
          {!canCreateEvent && (
            <p className="mt-3 max-w-2xl text-sm text-amber-300">
              Organizer access is deactivated. Creating new events and sending new requests for moderation are disabled.
            </p>
          )}
          <button
            onClick={onCreateEvent}
            disabled={!canCreateEvent}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          >
            <Plus className="h-5 w-5" />
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};
