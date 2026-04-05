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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="surface-panel sticky top-24 rounded-2xl p-4 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 dark:border-purple-500/20">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-[rgba(94,72,166,0.12)] dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
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
