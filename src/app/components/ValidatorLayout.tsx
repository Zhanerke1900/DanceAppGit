import React from 'react';
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
    { id: 'events', label: copy.events },
    { id: 'scan', label: copy.scan },
  ] as const;
  const renderNavButton = (item: (typeof menuItems)[number], layout: 'mobile' | 'desktop') => {
    const isActive = activeTab === item.id;
    const mobileClass = isActive
      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/20'
      : 'text-[#4c435f] hover:bg-purple-600/8 hover:text-[#201a35] dark:text-gray-300 dark:hover:bg-white/8 dark:hover:text-white';
    const desktopClass = isActive
      ? 'border-purple-500 bg-purple-600/10 text-purple-700 dark:border-purple-400 dark:bg-white/5 dark:text-white'
      : 'border-transparent text-[#5b526d] hover:bg-purple-600/5 hover:text-[#201a35] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white';

    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className={
          layout === 'mobile'
            ? `min-w-0 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${mobileClass}`
            : `relative flex w-full items-center gap-2.5 border-l-2 px-3.5 py-2.5 text-sm transition-colors duration-200 ${desktopClass}`
        }
      >
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="role-view min-h-screen bg-[#f6f4fb] pt-20 dark:bg-[#090a10]">
      <aside className="sticky top-20 z-30 border-b border-[#d9d2e8] bg-white/95 px-2 py-2 shadow-[0_8px_18px_rgba(63,54,92,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#11121a]/95 2xl:hidden">
        <nav className="grid grid-cols-2 gap-1 rounded-xl border border-[#d9d2e8] bg-[#f3effb] p-1 dark:border-white/10 dark:bg-black/30">
          {menuItems.map((item) => renderNavButton(item, 'mobile'))}
        </nav>
      </aside>

      <div className="2xl:flex">
        <aside className="hidden border-[#d9d2e8] bg-white/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#11121a]/95 2xl:fixed 2xl:left-0 2xl:top-20 2xl:flex 2xl:h-[calc(100vh-5rem)] 2xl:w-56 2xl:flex-col 2xl:items-stretch 2xl:overflow-y-auto 2xl:border-r">
          <div className="border-b border-[#d9d2e8] p-4 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#332b4e] dark:text-purple-200">{copy.portal}</p>
          </div>

          <nav className="flex flex-1 flex-col space-y-1.5 p-3">
            {menuItems.map((item) => renderNavButton(item, 'desktop'))}
          </nav>
        </aside>

        <main className="min-h-screen min-w-0 flex-1 bg-[#f6f4fb] pb-16 dark:bg-[#090a10] 2xl:ml-56">{children}</main>
      </div>
    </div>
  );
};
