import React from 'react';
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Plus,
  ShieldCheck,
} from 'lucide-react';
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
  const copy = {
    en: {
      portal: 'Organizer Portal',
      dashboard: 'Dashboard',
      events: 'Events',
      createEvent: 'Create Event',
      validators: 'Validators',
      orders: 'Orders',
      analytics: 'Analytics',
    },
    ru: {
      portal: 'Портал организатора',
      dashboard: 'Панель',
      events: 'События',
      createEvent: 'Создать событие',
      validators: 'Валидаторы',
      orders: 'Заказы',
      analytics: 'Аналитика',
    },
    kk: {
      portal: 'Ұйымдастырушы порталы',
      dashboard: 'Басқару панелі',
      events: 'Іс-шаралар',
      createEvent: 'Іс-шара құру',
      validators: 'Валидаторлар',
      orders: 'Тапсырыстар',
      analytics: 'Аналитика',
    },
  }[language];
  const menuItems = [
    { id: 'dashboard', label: copy.dashboard, icon: LayoutDashboard },
    { id: 'events', label: copy.events, icon: CalendarDays },
    { id: 'create-event', label: copy.createEvent, icon: Plus },
    { id: 'validators', label: copy.validators, icon: ShieldCheck },
    { id: 'orders', label: copy.orders, icon: ClipboardList },
    { id: 'analytics', label: copy.analytics, icon: BarChart3 },
  ] as const;

  return (
    <div className="role-view organizer-portal min-h-screen">
      <div className="organizer-shell">
        <aside className="organizer-tabs-bar">
          <div className="organizer-tabs-heading">
            <span className="organizer-status-dot" />
            <span>{copy.portal}</span>
          </div>

          <nav className="organizer-tabs" aria-label="Organizer portal sections">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const isDisabled = item.id === 'create-event' && !canCreateEvent;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isDisabled) return;
                    onNavigate(item.id);
                  }}
                  disabled={isDisabled}
                  className={`organizer-tab ${isActive ? 'is-active' : ''} ${isDisabled ? 'is-disabled' : ''}`}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="organizer-main">{children}</main>
      </div>
    </div>
  );
};
