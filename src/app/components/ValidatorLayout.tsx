import React from 'react';
import { QrCode, CalendarDays, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';

interface ValidatorLayoutProps {
  children: React.ReactNode;
  activeTab: 'events' | 'scan';
  onNavigate: (tab: 'events' | 'scan') => void;
}

export const ValidatorLayout: React.FC<ValidatorLayoutProps> = ({ children, activeTab, onNavigate }) => {
  const { language } = useI18n();
  const copy = {
    en: { portal: 'Validator Portal', events: 'Assigned Events', scan: 'Scan Ticket' },
    ru: { portal: 'Портал валидатора', events: 'Назначенные события', scan: 'Сканировать билет' },
    kk: { portal: 'Валидатор порталы', events: 'Тағайындалған іс-шаралар', scan: 'Билетті сканерлеу' },
  }[language];
  const menuItems = [
    { id: 'events', label: copy.events, icon: CalendarDays },
    { id: 'scan', label: copy.scan, icon: QrCode },
  ] as const;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="flex">
        <aside className="fixed left-0 top-20 flex h-[calc(100vh-5rem)] w-64 flex-col overflow-y-auto border-r border-purple-500/20 bg-gradient-to-b from-gray-900 via-gray-900 to-black shadow-2xl shadow-purple-900/10">
          <div className="border-b border-purple-500/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-600/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-200">{copy.portal}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/40'
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

        <main className="ml-64 min-h-screen flex-1 bg-black pb-16">{children}</main>
      </div>
    </div>
  );
};
