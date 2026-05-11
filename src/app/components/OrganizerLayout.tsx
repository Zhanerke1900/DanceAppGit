import React from 'react';
import { LayoutDashboard, Calendar, ShoppingCart, BarChart3, PlusSquare, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';

interface OrganizerLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'events' | 'create-event' | 'validators' | 'orders' | 'analytics';
  onNavigate: (tab: 'dashboard' | 'events' | 'create-event' | 'validators' | 'orders' | 'analytics') => void;
  canCreateEvent?: boolean;
}

export const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({ 
  children, 
  activeTab, 
  onNavigate,
  canCreateEvent = true,
}) => {
  const { language } = useI18n();
  const menuItems = [
    { id: 'dashboard', label: language === 'ru' ? 'Панель' : language === 'kk' ? 'Басқару панелі' : 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: language === 'ru' ? 'События' : language === 'kk' ? 'Іс-шаралар' : 'Events', icon: Calendar },
    { id: 'create-event', label: language === 'ru' ? 'Создать событие' : language === 'kk' ? 'Іс-шара құру' : 'Create Event', icon: PlusSquare },
    { id: 'validators', label: language === 'ru' ? 'Валидаторы' : language === 'kk' ? 'Валидаторлар' : 'Validators', icon: ShieldCheck },
    { id: 'orders', label: language === 'ru' ? 'Заказы' : language === 'kk' ? 'Тапсырыстар' : 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : language === 'kk' ? 'Аналитика' : 'Analytics', icon: BarChart3 },
  ] as const;

  return (
    <div className="role-view min-h-screen bg-[#f6f4fb] pt-20 dark:bg-[#090a10]">
      <div className="2xl:flex">
        {/* Sidebar Navigation */}
        <aside className="sticky top-20 z-30 border-b border-[#d9d2e8] bg-white/92 shadow-[0_10px_24px_rgba(63,54,92,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#11121a]/95 md:flex md:items-center md:gap-4 md:px-5 md:py-2 2xl:fixed 2xl:left-0 2xl:top-20 2xl:flex 2xl:h-[calc(100vh-5rem)] 2xl:w-56 2xl:flex-col 2xl:items-stretch 2xl:gap-0 2xl:overflow-y-auto 2xl:border-b-0 2xl:border-r 2xl:px-0 2xl:py-0">
          <div className="flex items-center gap-3 border-b border-[#d9d2e8] px-4 py-2.5 dark:border-white/10 md:border-b-0 md:px-0 md:py-0 2xl:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-md shadow-purple-600/20">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <p className="min-w-0 truncate text-sm font-semibold uppercase tracking-[0.16em] text-[#332b4e] dark:text-purple-100">Organizer Portal</p>
          </div>
          {/* Logo/Brand */}
          <div className="hidden border-b border-[#d9d2e8] p-4 dark:border-white/10 2xl:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/30">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm font-semibold uppercase tracking-[0.22em]">{language === 'ru' ? 'Портал организатора' : language === 'kk' ? 'Ұйымдастырушы порталы' : 'Organizer Portal'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex gap-2 overflow-x-auto p-2.5 md:flex-1 md:p-0 2xl:flex-1 2xl:flex-col 2xl:space-y-1.5 2xl:overflow-visible 2xl:p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'create-event' && !canCreateEvent) return;
                    onNavigate(item.id);
                  }}
                  className={`relative flex min-w-max items-center gap-2 border-b-2 px-1.5 py-2.5 text-sm transition-colors duration-200 2xl:w-full 2xl:border-b-0 2xl:border-l-2 2xl:gap-2.5 2xl:px-3.5 2xl:py-2.5 2xl:text-sm ${
                    isActive
                      ? 'border-purple-500 bg-purple-600/10 text-purple-700 dark:border-purple-400 dark:bg-white/5 dark:text-white'
                      : 'border-transparent text-[#5b526d] hover:border-purple-400/50 hover:bg-purple-600/5 hover:text-[#201a35] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  } ${item.id === 'create-event' && !canCreateEvent ? 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gray-400' : ''}`}
                  disabled={item.id === 'create-event' && !canCreateEvent}
                >
                  <Icon className="h-5 w-5" />
                  <span className="whitespace-nowrap font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 pb-16 2xl:ml-56">
          <div className="min-h-screen bg-[#f6f4fb] dark:bg-[#090a10]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
