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
        <aside className="sticky top-20 z-30 border-b border-purple-500/20 bg-gradient-to-b from-gray-900 via-gray-900 to-black shadow-2xl shadow-purple-900/10 2xl:fixed 2xl:left-0 2xl:top-20 2xl:flex 2xl:h-[calc(100vh-5rem)] 2xl:w-60 2xl:flex-col 2xl:overflow-y-auto 2xl:border-b-0 2xl:border-r">
          <div className="flex items-center gap-3 border-b border-purple-500/20 px-4 py-3 2xl:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-600/20">
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
          <nav className="flex gap-2 overflow-x-auto p-3 2xl:flex-1 2xl:flex-col 2xl:space-y-2 2xl:overflow-visible 2xl:p-4">
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
                  className={`relative flex min-w-max items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 group 2xl:w-full 2xl:gap-3 2xl:px-4 2xl:py-3 2xl:text-base ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  } ${item.id === 'create-event' && !canCreateEvent ? 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gray-400' : ''}`}
                  disabled={item.id === 'create-event' && !canCreateEvent}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-purple-600 rounded-xl blur-xl opacity-20 -z-10" />
                  )}
                  
                  {/* Hover glow effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-purple-600 rounded-xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10" />
                  )}
                  
                  <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''}`} />
                  <span className="whitespace-nowrap font-medium">{item.label}</span>
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg shadow-white/50 2xl:block" />
                  )}
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
