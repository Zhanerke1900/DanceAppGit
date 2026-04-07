import React from 'react';
import { Ticket, Heart, ShoppingBag, Settings } from 'lucide-react';
import { useI18n } from '../i18n';

interface ProfileLayoutProps {
  children: React.ReactNode;
  activeTab: 'my-tickets' | 'favorites' | 'purchase-history' | 'account-settings';
  onNavigate: (tab: 'my-tickets' | 'favorites' | 'purchase-history' | 'account-settings') => void;
  isAdmin?: boolean;
  isOrganizer?: boolean;
  isValidator?: boolean;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, activeTab, onNavigate, isAdmin = false, isOrganizer = false, isValidator = false }) => {
  const { t } = useI18n();
  const menuItems = isAdmin || isOrganizer || isValidator ? [
    { id: 'account-settings', label: t('common.accountSettings'), icon: Settings },
  ] : [
    { id: 'my-tickets', label: t('common.myTickets'), icon: Ticket },
    { id: 'favorites', label: t('common.favorites'), icon: Heart },
    { id: 'purchase-history', label: t('common.purchaseHistory'), icon: ShoppingBag },
    { id: 'account-settings', label: t('common.accountSettings'), icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background pt-16 dark:bg-black">
      <div className="max-w-7xl mx-auto px-3 py-5 sm:px-6 md:py-8 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="surface-panel sticky top-20 rounded-xl p-2 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 dark:border-purple-500/20 lg:top-24 lg:rounded-2xl lg:p-4">
              <nav className="grid grid-cols-2 gap-1 lg:block lg:space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-all duration-200 lg:gap-3 lg:rounded-xl lg:px-4 lg:py-3 lg:text-base ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/15 lg:shadow-lg lg:shadow-purple-600/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-[rgba(94,72,166,0.12)] dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
                      <span className="min-w-0 font-medium leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
