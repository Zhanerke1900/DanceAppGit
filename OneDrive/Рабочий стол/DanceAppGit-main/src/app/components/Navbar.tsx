import React, { useState } from 'react';
import { Ticket, Menu, X, User } from 'lucide-react';
import { CitySelector } from './CitySelector';
import { ProfileDropdown } from './ProfileDropdown';

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
  const displayName = user?.fullName || user?.name || 'User';

  const navigateToSection = (section: 'top' | 'events' | 'about' | 'organizers') => {
    onNavigateHomeSection?.(section);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
                DanceTime
              </span>
            </div>

            {!organizerCompactMode && !hideCitySelector && <CitySelector selectedCity={selectedCity} onCityChange={onCityChange} />}
          </div>

          <div className={`${organizerCompactMode ? 'flex' : 'hidden md:flex'} items-center gap-8`}>
            {organizerCompactMode && showOrganizerDashboardShortcut && (
              <button
                onClick={onOrganizerDashboard}
                className="rounded-full border border-purple-500/30 px-4 py-2 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-600/15 hover:text-white"
              >
                Organizer Dashboard
              </button>
            )}
            {!organizerCompactMode && (
              <>
                {showHomeLink && (
                  <button onClick={() => navigateToSection('top')} className="text-gray-300 hover:text-purple-400 transition-colors">Home</button>
                )}
                {isValidator ? (
                  showValidatorNavLinks ? (
                  <>
                    <button onClick={onValidatorEvents} className="text-gray-300 hover:text-purple-400 transition-colors">My Events</button>
                    <button onClick={onValidatorScan} className="text-gray-300 hover:text-purple-400 transition-colors">Scan Ticket</button>
                  </>
                  ) : null
                ) : (
                  <>
                    <button onClick={() => navigateToSection('events')} className="text-gray-300 hover:text-purple-400 transition-colors">Events</button>
                    <button onClick={() => navigateToSection('about')} className="text-gray-300 hover:text-purple-400 transition-colors">About us</button>
                  </>
                )}
                {isValidator ? null : isAdmin && showAdminPanelLink ? (
                  <button onClick={onAdminPanel} className="text-gray-300 hover:text-purple-400 transition-colors">Admin Panel</button>
                ) : isOrganizer && showOrganizerDashboardLink ? (
                  <button onClick={onOrganizerDashboard} className="text-gray-300 hover:text-purple-400 transition-colors">Organizer Dashboard</button>
                ) : !isAdmin && !isOrganizer ? (
                  <button onClick={() => navigateToSection('organizers')} className="text-gray-300 hover:text-purple-400 transition-colors">For Organizers</button>
                ) : null}
              </>
            )}
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
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                >
                  Get Started
                </button>
              </>
              )
            )}
          </div>

          {!organizerCompactMode && (
            <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && !organizerCompactMode && (
        <div className="md:hidden bg-black border-b border-white/10 py-4 px-4 space-y-4">
          {showHomeLink && (
            <button onClick={() => navigateToSection('top')} className="block text-gray-300 hover:text-purple-400 w-full text-left">Home</button>
          )}
          {isValidator ? (
            showValidatorNavLinks ? (
            <>
              <button onClick={onValidatorEvents} className="block text-gray-300 hover:text-purple-400 w-full text-left">My Events</button>
              <button onClick={onValidatorScan} className="block text-gray-300 hover:text-purple-400 w-full text-left">Scan Ticket</button>
            </>
            ) : null
          ) : (
            <>
              <button onClick={() => navigateToSection('events')} className="block text-gray-300 hover:text-purple-400 w-full text-left">Events</button>
              <button onClick={() => navigateToSection('about')} className="block text-gray-300 hover:text-purple-400 w-full text-left">About us</button>
            </>
          )}
          {isValidator ? null : isAdmin && showAdminPanelLink ? (
            <button onClick={onAdminPanel} className="block text-gray-300 hover:text-purple-400 w-full text-left">Admin Panel</button>
          ) : isOrganizer && showOrganizerDashboardLink ? (
            <button onClick={onOrganizerDashboard} className="block text-gray-300 hover:text-purple-400 w-full text-left">Organizer Dashboard</button>
          ) : !isAdmin && !isOrganizer ? (
            <button onClick={() => navigateToSection('organizers')} className="block text-gray-300 hover:text-purple-400 w-full text-left">For Organizers</button>
          ) : null}
          <div className="pt-4 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-gray-300 text-center py-2">
                  Welcome, {displayName}
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full text-center py-2 text-gray-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="w-full text-center py-2 text-gray-300"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="w-full bg-purple-600 text-white py-2 rounded-full shadow-lg shadow-purple-600/20"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
