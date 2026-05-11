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
      <div className="2xl:flex">
        <aside className="sticky top-20 z-30 border-b border-purple-500/20 bg-gray-900/95 shadow-[0_12px_28px_rgba(61,41,110,0.14)] backdrop-blur-xl md:flex md:items-center md:gap-4 md:px-6 md:py-2 2xl:fixed 2xl:left-0 2xl:top-20 2xl:flex 2xl:h-[calc(100vh-5rem)] 2xl:w-60 2xl:flex-col 2xl:items-stretch 2xl:gap-0 2xl:overflow-y-auto 2xl:border-b-0 2xl:border-r 2xl:px-0 2xl:py-0">
          <div className="flex items-center gap-3 border-b border-purple-500/20 px-4 py-3 md:border-b-0 md:px-0 md:py-0 2xl:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-md shadow-purple-600/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <p className="min-w-0 truncate text-sm font-semibold uppercase tracking-[0.18em] text-purple-100">{copy.portal}</p>
          </div>

          <div className="hidden border-b border-purple-500/20 p-5 2xl:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-600/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-200">{copy.portal}</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:p-0 2xl:flex-1 2xl:flex-col 2xl:space-y-2 2xl:overflow-visible 2xl:p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex min-w-max items-center gap-2 border-b-2 px-1.5 py-3 text-sm transition-colors duration-200 2xl:w-full 2xl:border-b-0 2xl:border-l-2 2xl:gap-3 2xl:px-4 2xl:py-3 2xl:text-base ${
                    isActive
                      ? 'border-purple-400 bg-white/5 text-white'
                      : 'border-transparent text-gray-400 hover:border-purple-400/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="whitespace-nowrap font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-screen min-w-0 flex-1 bg-black pb-16 2xl:ml-60">{children}</main>
      </div>
    </div>
  );
};
