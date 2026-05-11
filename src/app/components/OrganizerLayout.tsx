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
    <div className="min-h-screen bg-black pt-20">
      <div className="2xl:flex">
        {/* Sidebar Navigation */}
        <aside className="sticky top-20 z-30 border-b border-purple-500/20 bg-gray-900/95 shadow-[0_12px_28px_rgba(61,41,110,0.14)] backdrop-blur-xl md:flex md:items-center md:gap-4 md:px-6 md:py-2 2xl:fixed 2xl:left-0 2xl:top-20 2xl:flex 2xl:h-[calc(100vh-5rem)] 2xl:w-60 2xl:flex-col 2xl:items-stretch 2xl:gap-0 2xl:overflow-y-auto 2xl:border-b-0 2xl:border-r 2xl:px-0 2xl:py-0">
          <div className="flex items-center gap-3 border-b border-purple-500/20 px-4 py-3 md:border-b-0 md:px-0 md:py-0 2xl:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-md shadow-purple-600/20">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <p className="min-w-0 truncate text-sm font-semibold uppercase tracking-[0.18em] text-purple-100">Organizer Portal</p>
          </div>
          {/* Logo/Brand */}
          <div className="hidden border-b border-purple-500/20 p-5 2xl:block">
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
          <nav className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:p-0 2xl:flex-1 2xl:flex-col 2xl:space-y-2 2xl:overflow-visible 2xl:p-4">
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
                  className={`relative flex min-w-max items-center gap-2 border-b-2 px-1.5 py-3 text-sm transition-colors duration-200 2xl:w-full 2xl:border-b-0 2xl:border-l-2 2xl:gap-3 2xl:px-4 2xl:py-3 2xl:text-base ${
                    isActive
                      ? 'border-purple-400 bg-white/5 text-white'
                      : 'border-transparent text-gray-400 hover:border-purple-400/50 hover:bg-white/5 hover:text-white'
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
        <main className="min-w-0 flex-1 pb-16 2xl:ml-60">
          <div className="min-h-screen bg-black">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
