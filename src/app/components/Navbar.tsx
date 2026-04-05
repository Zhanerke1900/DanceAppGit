import React, { useEffect, useState } from 'react';
import { Ticket, Menu, X, User } from 'lucide-react';
import { CitySelector } from './CitySelector';
import { ProfileDropdown } from './ProfileDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../i18n';

interface NavbarProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  user: any;
  onLogout: () => void;
  onOpenAuth: (view: 'login' | 'register') => void;
  onNavigateToMyTickets?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToPurchaseHistory?: () => void;
  onNavigateToAccountSettings?: () => void;
  onBecomeOrganizer?: () => void;
  onOrganizerDashboard?: () => void;
  onOrganizerEvents?: () => void;
  onOrganizerOrders?: () => void;
  onOrganizerAnalytics?: () => void;
  onValidatorEvents?: () => void;
  onValidatorScan?: () => void;
  showOrganizerDashboardLink?: boolean;
  onAdminPanel?: () => void;
  onAdminRequests?: () => void;
  onAdminUsers?: () => void;
  onAdminModeration?: () => void;
  isOrganizer?: boolean;
  isAdmin?: boolean;
  isValidator?: boolean;
  onNavigateHomeSection?: (section: 'top' | 'events' | 'about' | 'organizers') => void;
  showHomeLink?: boolean;
  showAdminPanelLink?: boolean;
  organizerCompactMode?: boolean;
  showOrganizerDashboardShortcut?: boolean;
  hideCitySelector?: boolean;
  showValidatorNavLinks?: boolean;
}

export const Navbar = ({ 
  selectedCity, 
  onCityChange, 
  user, 
  onLogout, 
  onOpenAuth, 
  onNavigateToMyTickets, 
  onNavigateToFavorites,
  onNavigateToPurchaseHistory,
  onNavigateToAccountSettings,
  onBecomeOrganizer,
  onOrganizerDashboard,
  onOrganizerEvents,
  onOrganizerOrders,
  onOrganizerAnalytics,
  onValidatorEvents,
  onValidatorScan,
  onAdminPanel,
  onAdminRequests,
  onAdminUsers,
  onAdminModeration,
  isOrganizer = false,
  isAdmin = false,
  isValidator = false,
  onNavigateHomeSection,
  showHomeLink = false,
  showOrganizerDashboardLink = true,
  showAdminPanelLink = true,
  organizerCompactMode = false,
  showOrganizerDashboardShortcut = false,
  hideCitySelector = false,
  showValidatorNavLinks = false,
}: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const displayName = user?.fullName || user?.name || 'User';
  const { t } = useI18n();

  useEffect(() => {
    const updateTheme = () => {
      if (typeof document === 'undefined') return;
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const navigateToSection = (section: 'top' | 'events' | 'about' | 'organizers') => {
    onNavigateHomeSection?.(section);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/90 bg-background/92 backdrop-blur-xl shadow-[0_14px_34px_rgba(50,38,92,0.09)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#3a235f] drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]'}`}>
                DanceTime
              </span>
            </div>

            {!organizerCompactMode && !hideCitySelector && <CitySelector selectedCity={selectedCity} onCityChange={onCityChange} />}
          </div>

          <div className={`${organizerCompactMode ? 'flex' : 'hidden md:flex'} items-center gap-8`}>
            {organizerCompactMode && showOrganizerDashboardShortcut && (
              <button
                onClick={onOrganizerDashboard}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isDark
                    ? 'border-purple-500/30 text-purple-300 hover:bg-purple-600/15 hover:text-white'
                    : 'border-purple-500/20 text-purple-700 hover:bg-purple-600/10 hover:text-purple-900'
                }`}
              >
                {t('navbar.organizerDashboard')}
              </button>
            )}
            {!organizerCompactMode && (
              <>
                {showHomeLink && (
                  <button onClick={() => navigateToSection('top')} className="text-muted-foreground hover:text-foreground transition-colors">{t('common.home')}</button>
                )}
                {isValidator ? (
                  showValidatorNavLinks ? (
                  <>
                    <button onClick={onValidatorEvents} className="text-muted-foreground hover:text-foreground transition-colors">{t('navbar.myEvents')}</button>
                    <button onClick={onValidatorScan} className="text-muted-foreground hover:text-foreground transition-colors">{t('navbar.scanTicket')}</button>
                  </>
                  ) : null
                ) : (
                  <>
                    <button onClick={() => navigateToSection('events')} className="text-muted-foreground hover:text-foreground transition-colors">{t('common.events')}</button>
                    <button onClick={() => navigateToSection('about')} className="text-muted-foreground hover:text-foreground transition-colors">{t('common.aboutUs')}</button>
                  </>
                )}
                {isValidator ? null : isAdmin && showAdminPanelLink ? (
                  <button onClick={onAdminPanel} className="text-muted-foreground hover:text-foreground transition-colors">{t('navbar.adminPanel')}</button>
                ) : isOrganizer && showOrganizerDashboardLink ? (
                  <button onClick={onOrganizerDashboard} className="text-muted-foreground hover:text-foreground transition-colors">{t('navbar.organizerDashboard')}</button>
                ) : !isAdmin && !isOrganizer ? (
                  <button onClick={() => navigateToSection('organizers')} className="text-muted-foreground hover:text-foreground transition-colors">{t('navbar.forOrganizers')}</button>
                ) : null}
              </>
            )}
            <LanguageSwitcher />
            {user ? (
              <ProfileDropdown 
                user={user}
                onLogout={onLogout}
                onNavigateToMyTickets={onNavigateToMyTickets}
                onNavigateToFavorites={onNavigateToFavorites}
                onNavigateToPurchaseHistory={onNavigateToPurchaseHistory}
                onNavigateToAccountSettings={onNavigateToAccountSettings}
                onBecomeOrganizer={onBecomeOrganizer}
                onOrganizerDashboard={onOrganizerDashboard}
                onOrganizerEvents={onOrganizerEvents}
                onOrganizerOrders={onOrganizerOrders}
                onOrganizerAnalytics={onOrganizerAnalytics}
                onAdminPanel={onAdminPanel}
                onAdminRequests={onAdminRequests}
                onAdminUsers={onAdminUsers}
                onAdminModeration={onAdminModeration}
                isOrganizer={isOrganizer}
                isAdmin={isAdmin}
                isValidator={isValidator}
                onValidatorEvents={onValidatorEvents}
                onValidatorScan={onValidatorScan}
                compactMode={organizerCompactMode}
              />
            ) : (
              !organizerCompactMode && !isValidator && (
              <>
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('common.signIn')}
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                >
                  {t('common.getStarted')}
                </button>
              </>
              )
            )}
          </div>

          {!organizerCompactMode && (
            <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground p-2 hover:text-foreground transition-colors">
              {isOpen ? <X /> : <Menu />}
            </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && !organizerCompactMode && (
        <div className="md:hidden bg-popover border-b border-border py-4 px-4 space-y-4 shadow-[0_18px_40px_rgba(35,31,54,0.08)]">
          {showHomeLink && (
            <button onClick={() => navigateToSection('top')} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('common.home')}</button>
          )}
          {isValidator ? (
            showValidatorNavLinks ? (
            <>
              <button onClick={onValidatorEvents} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('navbar.myEvents')}</button>
              <button onClick={onValidatorScan} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('navbar.scanTicket')}</button>
            </>
            ) : null
          ) : (
            <>
              <button onClick={() => navigateToSection('events')} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('common.events')}</button>
              <button onClick={() => navigateToSection('about')} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('common.aboutUs')}</button>
            </>
          )}
          {isValidator ? null : isAdmin && showAdminPanelLink ? (
            <button onClick={onAdminPanel} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('navbar.adminPanel')}</button>
          ) : isOrganizer && showOrganizerDashboardLink ? (
            <button onClick={onOrganizerDashboard} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('navbar.organizerDashboard')}</button>
          ) : !isAdmin && !isOrganizer ? (
            <button onClick={() => navigateToSection('organizers')} className="block text-muted-foreground hover:text-foreground w-full text-left">{t('navbar.forOrganizers')}</button>
          ) : null}
          <LanguageSwitcher mobile onSelect={() => setIsOpen(false)} />
          <div className="pt-4 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-muted-foreground text-center py-2">
                  {t('common.welcome')}, {displayName}
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full text-center py-2 text-muted-foreground"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="w-full text-center py-2 text-muted-foreground"
                >
                  {t('common.signIn')}
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="w-full bg-purple-600 text-white py-2 rounded-full shadow-lg shadow-purple-600/20"
                >
                  {t('common.getStarted')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
