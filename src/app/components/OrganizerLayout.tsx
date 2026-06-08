import React from 'react';
import { useI18n } from '../i18n';

interface OrganizerLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'events' | 'create-event' | 'validators' | 'orders';
  onNavigate: (tab: 'dashboard' | 'events' | 'create-event' | 'validators' | 'orders') => void;
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
      orders: 'Analytics and Orders',
    },
    ru: {
      portal: 'Портал организатора',
      dashboard: 'Панель',
      events: 'События',
      createEvent: 'Создать событие',
      validators: 'Валидаторы',
      orders: 'Analytics and Orders',
    },
    kk: {
      portal: 'Ұйымдастырушы порталы',
      dashboard: 'Басқару панелі',
      events: 'Іс-шаралар',
      createEvent: 'Іс-шара құру',
      validators: 'Валидаторлар',
      orders: 'Analytics and Orders',
    },
  }[language];
  const menuItems = [
    { id: 'dashboard', label: copy.dashboard },
    { id: 'events', label: copy.events },
    { id: 'create-event', label: copy.createEvent },
    { id: 'validators', label: copy.validators },
    { id: 'orders', label: copy.orders },
  ] as const;

  return (
    <div className="role-view organizer-portal min-h-screen">
      <div className="organizer-shell">
        <aside className="organizer-tabs-bar">
          <div className="organizer-tabs-heading">
            <span>{copy.portal}</span>
          </div>

          <nav className="organizer-tabs" aria-label="Organizer portal sections">
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
                  className={`organizer-tab ${isActive ? 'is-active' : ''} ${isDisabled ? 'is-disabled' : ''}`}
                >
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
