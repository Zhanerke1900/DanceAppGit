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
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 h-[calc(100vh-5rem)] bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-purple-500/20 fixed left-0 top-20 flex flex-col shadow-2xl shadow-purple-900/10 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-purple-500/20">
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
          <nav className="flex-1 p-4 space-y-2">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
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
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-white/50" />
                  )}
                </button>
              );
            })}
          </nav>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 pb-16">
          <div className="min-h-screen bg-black">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
