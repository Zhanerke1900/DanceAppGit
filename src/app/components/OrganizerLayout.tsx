import React from 'react';
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
    { id: 'dashboard', label: language === 'ru' ? 'Панель' : language === 'kk' ? 'Басқару панелі' : 'Dashboard' },
    { id: 'events', label: language === 'ru' ? 'События' : language === 'kk' ? 'Іс-шаралар' : 'Events' },
    { id: 'create-event', label: language === 'ru' ? 'Создать событие' : language === 'kk' ? 'Іс-шара құру' : 'Create Event' },
    { id: 'validators', label: language === 'ru' ? 'Валидаторы' : language === 'kk' ? 'Валидаторлар' : 'Validators' },
    { id: 'orders', label: language === 'ru' ? 'Заказы' : language === 'kk' ? 'Тапсырыстар' : 'Orders' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : language === 'kk' ? 'Аналитика' : 'Analytics' },
  ] as const;

  return (
    <div className="role-view flex min-h-screen bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Calibri", sans-serif' }}>
      {/* Left Sidebar Navigation */}
      <aside className="fixed left-0 top-20 z-30 h-[calc(100vh-5rem)] w-56 border-r border-gray-200 bg-white shadow-sm overflow-y-auto">
        {/* Logo/Brand */}
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{language === 'ru' ? 'Портал организатора' : language === 'kk' ? 'Ұйымдастырушы порталы' : 'Organizer Portal'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 px-2 py-4">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const isDisabled = item.id === 'create-event' && !canCreateEvent;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isDisabled) return;
                  onNavigate(item.id);
                }}
                disabled={isDisabled}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pl-56">
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
};
