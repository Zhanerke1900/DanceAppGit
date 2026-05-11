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
      <div className="lg:flex">
        <aside className="sticky top-20 z-30 border-b border-purple-500/20 bg-gradient-to-b from-gray-900 via-gray-900 to-black shadow-2xl shadow-purple-900/10 lg:fixed lg:left-0 lg:top-20 lg:flex lg:h-[calc(100vh-5rem)] lg:w-64 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="hidden border-b border-purple-500/20 p-6 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-600/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-200">{copy.portal}</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:space-y-2 lg:overflow-visible lg:p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex min-w-max items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 lg:w-full lg:gap-3 lg:px-4 lg:py-3 lg:text-base ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/40'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="whitespace-nowrap font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-screen min-w-0 flex-1 bg-black pb-16 lg:ml-64">{children}</main>
      </div>
    </div>
  );
};
