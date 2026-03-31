import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, Ticket, Heart, ShoppingBag, Settings, LogOut, Building2, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  user: any;
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
  onAdminPanel?: () => void;
  onAdminRequests?: () => void;
  onAdminUsers?: () => void;
  onAdminModeration?: () => void;
  onLogout: () => void;
  isOrganizer?: boolean;
  isAdmin?: boolean;
  isValidator?: boolean;
  compactMode?: boolean;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
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
  onLogout,
  isOrganizer = false,
  isAdmin = false,
  isValidator = false,
  compactMode = false,
}) => {
  const displayName = user?.fullName || user?.name || 'User';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors outline-none group">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className={`${compactMode ? 'block' : 'hidden md:block'}`}>{displayName}</span>
          <ChevronDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[240px] bg-gray-900 border border-purple-500/20 rounded-xl shadow-2xl shadow-black/50 p-2 z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          align="end"
          sideOffset={8}
        >
          {/* User Info */}
          <div className="px-3 py-3 border-b border-gray-800 mb-2">
            <p className="text-white font-medium">{displayName}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          {!isAdmin && !isValidator && !isOrganizer && (
            <>
              <DropdownMenu.Item
                className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-lg cursor-pointer outline-none transition-colors"
                onSelect={onNavigateToMyTickets}
              >
                <Ticket className="w-4 h-4" />
                <span>My Tickets</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-lg cursor-pointer outline-none transition-colors"
                onSelect={onNavigateToFavorites}
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-lg cursor-pointer outline-none transition-colors"
                onSelect={onNavigateToPurchaseHistory}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Purchase History</span>
              </DropdownMenu.Item>
            </>
          )}

          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-lg cursor-pointer outline-none transition-colors"
            onSelect={onNavigateToAccountSettings}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </DropdownMenu.Item>

          {!isAdmin && !isOrganizer && !isValidator && (
            <>
              <DropdownMenu.Separator className="h-px bg-gray-800 my-2" />

              <DropdownMenu.Item
                className="flex items-center gap-3 px-3 py-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-600/20 rounded-lg cursor-pointer outline-none transition-colors"
                onSelect={onBecomeOrganizer}
              >
                <Building2 className="w-4 h-4" />
                <span>Become an Organizer</span>
              </DropdownMenu.Item>
            </>
          )}

          {/* Logout */}
          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg cursor-pointer outline-none transition-colors"
            onSelect={onLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
