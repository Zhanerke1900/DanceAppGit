import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedEvents } from './components/FeaturedEvents';
import { SpecialPrograms } from './components/SpecialPrograms';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PurchaseGateModal } from './components/PurchaseGateModal';
import { TicketSelection } from './components/TicketSelection';
import { PurchaseSuccess } from './components/PurchaseSuccess';
import { MyTickets } from './components/MyTickets';
import { BecomeOrganizer } from './components/BecomeOrganizer';
import { ProfileLayout } from './components/ProfileLayout';
import { Favorites } from './components/Favorites';
import { PurchaseHistory } from './components/PurchaseHistory';
import { AccountSettings } from './components/AccountSettings';
import { OrganizerLayout } from './components/OrganizerLayout';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { CreateEvent } from './components/CreateEvent';
import { OrganizerEvents } from './components/OrganizerEvents';
import { OrganizerOrders } from './components/OrganizerOrders';
import { OrganizerAnalytics } from './components/OrganizerAnalytics';
import { OrganizerValidators } from './components/OrganizerValidators';
import { ValidatorLayout } from './components/ValidatorLayout';
import { ValidatorAssignedEvents } from './components/ValidatorAssignedEvents';
import { ValidatorScanTicket } from './components/ValidatorScanTicket';
import { AdminPanel } from './components/AdminPanel';
import * as authApi from './api/auth';
import * as ticketsApi from './api/tickets';
import * as validatorApi from './api/validator';
import { getAuthToken } from './api/http';
import type { ReservationRecord, TicketRecord } from './api/tickets';
import { VerifyEmailPage } from './components/VerifyEmailPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { I18nProvider, useI18n } from './i18n';
import { ArrowLeft, Loader2, Search, X } from 'lucide-react';
import blazeLogo from './assets/partners/blaze.svg';
import hipLogo from './assets/partners/hip-logo.png';
import nomadLogo from './assets/partners/nomad.png';
import soulSideLogo from './assets/partners/soul-side.png';

type ViewState = 'home' | 'all-events' | 'all-special-programs' | 'ticket-selection' | 'purchase-success' | 'profile' | 'become-organizer' | 'organizer-dashboard' | 'validator-dashboard' | 'admin-panel' | 'verify-email'
  | 'reset-password';
type ProfileTab = 'my-tickets' | 'favorites' | 'purchase-history' | 'account-settings';
type OrganizerTab = 'dashboard' | 'events' | 'create-event' | 'validators' | 'orders' | 'analytics';
type ValidatorTab = 'events' | 'scan';
type AdminTab = 'dashboard' | 'requests' | 'users' | 'moderation';

const APP_STATE_STORAGE = {
  selectedCity: 'danceapp:selected-city',
  currentView: 'danceapp:current-view',
  pendingEvent: 'danceapp:pending-event',
  profileTab: 'danceapp:profile-tab',
  organizerTab: 'danceapp:organizer-tab',
  validatorTab: 'danceapp:validator-tab',
  adminTab: 'danceapp:admin-tab',
};

const VIEW_STATES: ViewState[] = [
  'home',
  'all-events',
  'all-special-programs',
  'ticket-selection',
  'purchase-success',
  'profile',
  'become-organizer',
  'organizer-dashboard',
  'validator-dashboard',
  'admin-panel',
  'verify-email',
  'reset-password',
];
const PROFILE_TABS: ProfileTab[] = ['my-tickets', 'favorites', 'purchase-history', 'account-settings'];
const ORGANIZER_TABS: OrganizerTab[] = ['dashboard', 'events', 'create-event', 'validators', 'orders', 'analytics'];
const VALIDATOR_TABS: ValidatorTab[] = ['events', 'scan'];
const ADMIN_TABS: AdminTab[] = ['dashboard', 'requests', 'users', 'moderation'];
const PARTNER_LOGOS = [
  { src: blazeLogo, alt: 'Blaze' },
  { src: nomadLogo, alt: 'Nomad' },
  { src: hipLogo, alt: 'Hip Dance' },
  { src: soulSideLogo, alt: 'Soul Side' },
];

const readStoredText = (key: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  return value && value.trim() ? value : fallback;
};

const readStoredOption = <T extends string>(key: string, allowed: T[], fallback: T) => {
  const value = readStoredText(key, '');
  return allowed.includes(value as T) ? (value as T) : fallback;
};

const readStoredJson = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
};

const writeStoredJson = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  if (value === null || value === undefined) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getInitialView = (): ViewState => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname;
  if (path.startsWith('/verify-email')) return 'verify-email';
  if (path.startsWith('/reset-password')) return 'reset-password';

  const storedView = readStoredOption(APP_STATE_STORAGE.currentView, VIEW_STATES, 'home');
  if (storedView === 'purchase-success') return 'profile';
  if (storedView === 'ticket-selection' && !readStoredJson(APP_STATE_STORAGE.pendingEvent)) {
    return 'all-events';
  }
  return storedView;
};

const redirectToPaymentProvider = (paymentUrl: string) => {
  window.location.href = paymentUrl;
  window.setTimeout(() => {
    window.location.assign(paymentUrl);
  }, 150);
};

type FavoriteItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  city?: string;
  image: string;
  category: string;
  price?: string;
  eventData?: any;
};

interface MarketplaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  elevated?: boolean;
}

const MarketplaceSearch = ({ value, onChange, elevated = false }: MarketplaceSearchProps) => {
  const { t } = useI18n();

  return (
    <section className={`${elevated ? 'pt-24' : 'pt-9'} bg-background px-4 pb-4 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <div className="relative mx-auto h-11 w-full max-w-[640px] rounded-full bg-[#f1f2f4] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:bg-white/10">
          <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f7782] dark:text-white/60" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t('common.searchMarketplace')}
            className="h-full w-full rounded-full border-0 bg-transparent pl-14 pr-12 text-[16px] font-medium text-foreground outline-none placeholder:text-[#a1a8b3] dark:placeholder:text-white/45"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label={t('common.clearSearch')}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#6f7782] transition-colors hover:bg-black/5 hover:text-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

const MarketplaceEventsLoading = () => {
  const { t } = useI18n();

  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[420px] max-w-7xl flex-col items-center justify-center text-center">
        <Loader2 className="mb-5 h-10 w-10 animate-spin text-purple-600" />
        <h2 className="text-2xl font-bold text-foreground">{t('common.loadingEvents')}</h2>
        <p className="mt-3 max-w-md text-muted-foreground">{t('common.loadingEventsDescription')}</p>
      </div>
    </section>
  );
};

const MarketplaceBackButton = ({ label, onBack }: { label: string; onBack: () => void }) => (
  <section className="bg-background px-4 pt-24 pb-2 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-7xl justify-start">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </button>
    </div>
  </section>
);

function AppContent() {
  const [selectedCity, setSelectedCity] = useState(() => readStoredText(APP_STATE_STORAGE.selectedCity, "Astana"));
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
  const [pendingHomeSection, setPendingHomeSection] = useState<'top' | 'events' | 'about' | 'organizers' | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [myTickets, setMyTickets] = useState<TicketRecord[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<TicketRecord[]>([]);
  const [myReservations, setMyReservations] = useState<ReservationRecord[]>([]);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login');
  
  // Purchase Flow State
  const [isPurchaseGateOpen, setIsPurchaseGateOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<any>(() => readStoredJson(APP_STATE_STORAGE.pendingEvent));
  const [currentView, setCurrentView] = useState<ViewState>(() => getInitialView());
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [recentPurchaseTickets, setRecentPurchaseTickets] = useState<TicketRecord[]>([]);
  const [ticketSelectionReadOnly, setTicketSelectionReadOnly] = useState(false);
  
  // Profile State
  const [profileTab, setProfileTab] = useState<ProfileTab>(() => readStoredOption(APP_STATE_STORAGE.profileTab, PROFILE_TABS, 'my-tickets'));
  
  // Organizer State
  const [organizerTab, setOrganizerTab] = useState<OrganizerTab>(() => readStoredOption(APP_STATE_STORAGE.organizerTab, ORGANIZER_TABS, 'dashboard'));
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [organizerOrders, setOrganizerOrders] = useState<any[]>([]);
  const [organizerAnalytics, setOrganizerAnalytics] = useState<any>(null);
  const [organizerValidators, setOrganizerValidators] = useState<any[]>([]);
  const [editingOrganizerEvent, setEditingOrganizerEvent] = useState<any>(null);
  const [validatorTab, setValidatorTab] = useState<ValidatorTab>(() => readStoredOption(APP_STATE_STORAGE.validatorTab, VALIDATOR_TABS, 'events'));
  const [validatorEvents, setValidatorEvents] = useState<any[]>([]);
  const [validatorRecentScans, setValidatorRecentScans] = useState<any[]>([]);
  const [selectedValidatorEventId, setSelectedValidatorEventId] = useState('');
  const [adminTab, setAdminTab] = useState<AdminTab>(() => readStoredOption(APP_STATE_STORAGE.adminTab, ADMIN_TABS, 'dashboard'));
  const [adminOverview, setAdminOverview] = useState<any>(null);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [adminArchivedRequests, setAdminArchivedRequests] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminEvents, setAdminEvents] = useState<any[]>([]);
  const [adminArchivedEvents, setAdminArchivedEvents] = useState<any[]>([]);
  const [publishedMarketplaceEvents, setPublishedMarketplaceEvents] = useState<any[]>([]);
  const [isMarketplaceEventsLoading, setIsMarketplaceEventsLoading] = useState(true);
  const isOrganizer = Boolean(user?.isOrganizer || user?.organizerStatus === 'approved');
  const isOrganizerActive = !isOrganizer || user?.organizerAccessStatus !== 'deactivated';
  const isAdmin = Boolean(user?.isAdmin);
  const isValidator = Boolean(user?.role === 'validator' || user?.isValidator);
  const userStorageKey = user?._id || user?.id || user?.email || null;
  const isOrganizerAccountSettingsView =
    currentView === 'profile' && profileTab === 'account-settings' && isOrganizer && !isAdmin;
  const isValidatorAccountSettingsView =
    currentView === 'profile' && profileTab === 'account-settings' && isValidator;
  const { t, language, isLanguageReady } = useI18n();

  useEffect(() => {
    window.localStorage.setItem(APP_STATE_STORAGE.selectedCity, selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (currentView === 'verify-email' || currentView === 'reset-password') return;
    const storedView = currentView === 'purchase-success' ? 'profile' : currentView;
    window.localStorage.setItem(APP_STATE_STORAGE.currentView, storedView);
  }, [currentView]);

  useEffect(() => {
    writeStoredJson(APP_STATE_STORAGE.pendingEvent, pendingEvent);
  }, [pendingEvent]);

  useEffect(() => {
    window.localStorage.setItem(APP_STATE_STORAGE.profileTab, profileTab);
  }, [profileTab]);

  useEffect(() => {
    window.localStorage.setItem(APP_STATE_STORAGE.organizerTab, organizerTab);
  }, [organizerTab]);

  useEffect(() => {
    window.localStorage.setItem(APP_STATE_STORAGE.validatorTab, validatorTab);
  }, [validatorTab]);

  useEffect(() => {
    window.localStorage.setItem(APP_STATE_STORAGE.adminTab, adminTab);
  }, [adminTab]);

  useEffect(() => {
    if (!getAuthToken()) {
      setUser(null);
      return;
    }

    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLanguageReady || !user) return;
    if (user.language === language) return;

    const fullName = String(user.fullName || user.name || '').trim();
    if (fullName.length < 2) return;

    let cancelled = false;
    authApi.updateMe({
      fullName,
      language,
      emailNotifications: user.emailNotifications ?? true,
      eventReminders: user.eventReminders ?? true,
    })
      .then(({ user: updatedUser }) => {
        if (!cancelled && updatedUser) setUser(updatedUser);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    isLanguageReady,
    language,
    user?._id,
    user?.id,
    user?.language,
    user?.fullName,
    user?.name,
    user?.emailNotifications,
    user?.eventReminders,
  ]);

  useEffect(() => {
    const handleBlocked = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail;
      authApi.logout().catch(() => {});
      setUser(null);
      setFavorites([]);
      setMyTickets([]);
      setMyReservations([]);
      setOrganizerEvents([]);
      setOrganizerOrders([]);
      setOrganizerAnalytics(null);
      setOrganizerValidators([]);
      setAdminRequests([]);
      setAdminArchivedRequests([]);
      setAdminUsers([]);
      setAdminEvents([]);
      setAdminArchivedEvents([]);
      setCurrentView('home');
      setPendingEvent(null);
      setPurchaseDetails(null);
      setRecentPurchaseTickets([]);
      window.alert(detail?.message || 'Your account has been blocked. Please contact support.');
    };

    window.addEventListener('auth:blocked', handleBlocked as EventListener);
    return () => window.removeEventListener('auth:blocked', handleBlocked as EventListener);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;

    const loadPublishedEvents = () => {
      setIsMarketplaceEventsLoading(true);
      authApi.publishedEvents()
        .then((data) => {
          if (cancelled) return;
          setPublishedMarketplaceEvents(data.events || []);
          setIsMarketplaceEventsLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          retryTimer = window.setTimeout(loadPublishedEvents, 2500);
        });
    };

    loadPublishedEvents();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verify-email')) setCurrentView('verify-email');
    if (path.startsWith('/reset-password')) setCurrentView('reset-password');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (!paymentStatus) return;

    params.delete('payment');
    params.delete('orderId');
    params.delete('paymentId');
    const nextQuery = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`);

    setPendingEvent(null);
    setPurchaseDetails(null);
    setRecentPurchaseTickets([]);

    if (paymentStatus === 'success') {
      setCurrentView('profile');
      setProfileTab('my-tickets');
      Promise.all([
        ticketsApi.myTickets(),
        ticketsApi.purchaseHistory(),
      ])
        .then(([ticketsData, historyData]) => {
          setMyTickets(ticketsData.tickets || []);
          setMyReservations(ticketsData.reservations || []);
          setPurchaseHistory(historyData.tickets || []);
        })
        .catch(() => {});
      window.alert('Payment accepted. Your profile has been updated.');
      return;
    }

    window.alert('Payment was not completed. Please try again.');
    setCurrentView('home');
  }, []);

  useEffect(() => {
    if (isValidator) {
      if (currentView === 'verify-email' || currentView === 'reset-password') return;
      if (currentView === 'home') {
        setCurrentView('validator-dashboard');
        setValidatorTab('events');
      }
      return;
    }
    if (!isOrganizer || isAdmin) return;
    if (currentView === 'verify-email' || currentView === 'reset-password') return;
    if (currentView === 'home') {
      setCurrentView('organizer-dashboard');
      setOrganizerTab('dashboard');
    }
  }, [isOrganizer, isAdmin, isValidator, currentView]);

  useEffect(() => {
    if (!userStorageKey) {
      setFavorites([]);
      setMyTickets([]);
      setMyReservations([]);
      return;
    }

    try {
      const storedFavorites = window.localStorage.getItem(`danceapp:favorites:${userStorageKey}`);
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
    } catch {
      setFavorites([]);
    }
  }, [userStorageKey]);

  useEffect(() => {
    if (!userStorageKey) return;
    window.localStorage.setItem(`danceapp:favorites:${userStorageKey}`, JSON.stringify(favorites));
  }, [favorites, userStorageKey]);

  useEffect(() => {
    if (currentView !== 'home' || !pendingHomeSection) return;

    const idMap = {
      top: null,
      events: 'events',
      about: 'about',
      organizers: 'cta',
    } as const;

    const targetId = idMap[pendingHomeSection];

    const timer = window.setTimeout(() => {
      if (!targetId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const section = document.getElementById(targetId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setPendingHomeSection(null);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [currentView, pendingHomeSection]);

  useEffect(() => {
    if (!isAdmin) return;

    authApi.adminOverview().then(setAdminOverview).catch(() => {});
    authApi.adminRequests("pending").then((data) => setAdminRequests(data.requests || [])).catch(() => {});
    authApi.adminRequests("rejected").then((data) => setAdminArchivedRequests(data.requests || [])).catch(() => {});
    authApi.adminUsers().then((data) => setAdminUsers(data.users || [])).catch(() => {});
    authApi.adminEvents("pending").then((data) => setAdminEvents(data.events || [])).catch(() => {});
    authApi.adminEvents("archived").then((data) => setAdminArchivedEvents(data.events || [])).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!isOrganizer || isAdmin) {
      setOrganizerEvents([]);
      setOrganizerOrders([]);
      setOrganizerAnalytics(null);
      setOrganizerValidators([]);
      return;
    }

    authApi.organizerEvents().then((data) => setOrganizerEvents(data.events || [])).catch(() => setOrganizerEvents([]));
    authApi.organizerOrders().then((data) => setOrganizerOrders(data.orders || [])).catch(() => setOrganizerOrders([]));
    authApi.organizerAnalytics().then(setOrganizerAnalytics).catch(() => setOrganizerAnalytics(null));
    authApi.organizerValidators().then((data) => setOrganizerValidators(data.validators || [])).catch(() => setOrganizerValidators([]));
  }, [isOrganizer, isAdmin, user?._id, user?.email]);

  useEffect(() => {
    if (currentView === 'organizer-dashboard' && organizerTab === 'create-event' && !isOrganizerActive) {
      setOrganizerTab('dashboard');
    }
  }, [currentView, organizerTab, isOrganizerActive]);

  useEffect(() => {
    if (!isValidator) {
      setValidatorEvents([]);
      setValidatorRecentScans([]);
      setSelectedValidatorEventId('');
      return;
    }

    validatorApi.validatorEvents().then((data) => {
      setValidatorEvents(data.events || []);
      if (data.events?.[0]?.id) {
        setSelectedValidatorEventId(data.events[0].id);
      }
    }).catch(() => setValidatorEvents([]));
    validatorApi.validatorRecentScans().then((data) => setValidatorRecentScans(data.logs || [])).catch(() => setValidatorRecentScans([]));
  }, [isValidator, user?._id]);

  useEffect(() => {
    if (!user?._id && !user?.id) {
      setMyTickets([]);
      setPurchaseHistory([]);
      setMyReservations([]);
      return;
    }

    Promise.all([
      ticketsApi.myTickets(),
      ticketsApi.purchaseHistory(),
    ])
      .then(([ticketsData, historyData]) => {
        setMyTickets(ticketsData.tickets || []);
        setPurchaseHistory(historyData.tickets || []);
        setMyReservations(ticketsData.reservations || []);
      })
      .catch(() => {
        setMyTickets([]);
        setPurchaseHistory([]);
        setMyReservations([]);
      });
  }, [user?._id, user?.id, user?.email]);

  const refreshAdminRequests = () => {
    authApi.adminRequests("pending").then((data) => setAdminRequests(data.requests || [])).catch(() => {});
    authApi.adminRequests("rejected").then((data) => setAdminArchivedRequests(data.requests || [])).catch(() => {});
    authApi.adminOverview().then(setAdminOverview).catch(() => {});
    authApi.adminUsers().then((data) => setAdminUsers(data.users || [])).catch(() => {});
  };

  const refreshOrganizerEvents = () => {
    authApi.organizerEvents()
      .then((data) => setOrganizerEvents(data.events || []))
      .catch(() => {});
  };

  const refreshOrganizerValidators = () => {
    authApi.organizerValidators()
      .then((data) => setOrganizerValidators(data.validators || []))
      .catch(() => {});
  };

  const refreshPublishedMarketplaceEvents = () => {
    authApi.publishedEvents()
      .then((data) => setPublishedMarketplaceEvents(data.events || []))
      .catch(() => {});
  };

  const refreshMyTickets = () => {
    ticketsApi.myTickets()
      .then((data) => {
        setMyTickets(data.tickets || []);
        setMyReservations(data.reservations || []);
      })
      .catch(() => {});
  };

  const refreshOrganizerCommerce = () => {
    if (!isOrganizer) return;
    authApi.organizerEvents().then((data) => setOrganizerEvents(data.events || [])).catch(() => setOrganizerEvents([]));
    authApi.organizerOrders().then((data) => setOrganizerOrders(data.orders || [])).catch(() => setOrganizerOrders([]));
    authApi.organizerAnalytics().then((data) => setOrganizerAnalytics(data)).catch(() => setOrganizerAnalytics(null));
    refreshPublishedMarketplaceEvents();
  };

  const refreshValidatorData = () => {
    validatorApi.validatorEvents().then((data) => setValidatorEvents(data.events || [])).catch(() => {});
    validatorApi.validatorRecentScans().then((data) => setValidatorRecentScans(data.logs || [])).catch(() => {});
  };

  const handleNavigateHomeSection = (section: 'top' | 'events' | 'about' | 'organizers') => {
    setCurrentView('home');
    setPendingHomeSection(section);
  };

  const handleOpenAdminPanel = () => {
    setCurrentView('admin-panel');
    setAdminTab('dashboard');
    window.scrollTo(0, 0);
  };

  const handleOpenAdminRequests = () => {
    setCurrentView('admin-panel');
    setAdminTab('requests');
    window.scrollTo(0, 0);
  };

  const handleOpenAdminUsers = () => {
    setCurrentView('admin-panel');
    setAdminTab('users');
    window.scrollTo(0, 0);
  };

  const handleOpenAdminModeration = () => {
    setCurrentView('admin-panel');
    setAdminTab('moderation');
    window.scrollTo(0, 0);
  };

  const handleAdminUserSearch = (query: string) => {
    authApi.adminUsers(query).then((data) => setAdminUsers(data.users || [])).catch(() => {});
  };

  const handleAdminDeactivateOrganizer = (id: string) => {
    return authApi.adminDeactivateOrganizer(id).then((data) => {
      setAdminUsers((prev) => prev.map((item) => item.id === id ? data.user : item));
      authApi.adminOverview().then(setAdminOverview).catch(() => {});
      return data;
    });
  };

  const handleAdminActivateOrganizer = (id: string) => {
    return authApi.adminActivateOrganizer(id).then((data) => {
      setAdminUsers((prev) => prev.map((item) => item.id === id ? data.user : item));
      authApi.adminOverview().then(setAdminOverview).catch(() => {});
      return data;
    });
  };

  const handleAdminBlockUser = (id: string, reason: 'Fraud' | 'Spam' | 'Fake event' | 'Abuse') => {
    return authApi.blockUser(id, reason).then((data) => {
      setAdminUsers((prev) => prev.map((item) => item.id === id ? data.user : item));
      return data;
    });
  };

  const handleAdminUnblockUser = (id: string) => {
    return authApi.unblockUser(id).then((data) => {
      setAdminUsers((prev) => prev.map((item) => item.id === id ? data.user : item));
      return data;
    });
  };

  const handleApproveAdminEvent = (id: string) => {
    authApi.approveAdminEvent(id)
      .then((data) => {
        setAdminEvents((prev) => prev.filter((event) => event.id !== id));
        setAdminArchivedEvents((prev) => prev.filter((event) => event.id !== id));
        authApi.adminOverview().then(setAdminOverview).catch(() => {});
        refreshPublishedMarketplaceEvents();
      })
      .catch(() => {});
  };

  const handleRejectAdminEvent = (id: string) => {
    authApi.rejectAdminEvent(id)
      .then((data) => {
        setAdminEvents((prev) => prev.filter((event) => event.id !== id));
        setAdminArchivedEvents((prev) => [data.event, ...prev.filter((event) => event.id !== id)]);
        authApi.adminOverview().then(setAdminOverview).catch(() => {});
        refreshPublishedMarketplaceEvents();
      })
      .catch(() => {});
  };

  const handleApproveOrganizerRequest = (id: string) => {
    authApi.approveOrganizerRequest(id)
      .then(() => {
        refreshAdminRequests();
      })
      .catch(() => {});
  };

  const handleRejectOrganizerRequest = (id: string) => {
    authApi.rejectOrganizerRequest(id)
      .then(() => {
        refreshAdminRequests();
      })
      .catch(() => {});
  };

  const handleToggleFavorite = (item: FavoriteItem) => {
    setFavorites(prev =>
      prev.some(fav => fav.id === item.id)
        ? prev.filter(fav => fav.id !== item.id)
        : [item, ...prev]
    );
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenFavorite = (item: FavoriteItem) => {
    setTicketSelectionReadOnly(false);
    setPendingEvent(item.eventData || item);
    setCurrentView('ticket-selection');
    window.scrollTo(0, 0);
  };

  const handleOpenTicket = (ticket: TicketRecord) => {
    setTicketSelectionReadOnly(false);
    setPendingEvent({
      ...ticket.event,
      location: ticket.event.location,
      image: ticket.event.image,
    });
    setCurrentView('ticket-selection');
    window.scrollTo(0, 0);
  };

  const handleOpenReservation = (reservation: ReservationRecord) => {
    setTicketSelectionReadOnly(false);
    setPendingEvent({
      ...reservation.event,
      location: reservation.event.location,
      image: reservation.event.image,
    });
    setCurrentView('ticket-selection');
    window.scrollTo(0, 0);
  };

  const handleRefundTicket = async (ticket: TicketRecord) => {
    const result = await ticketsApi.refundTicket(ticket.id);
    setMyTickets((prev) =>
      prev.filter((item) => String(item.id) !== String(ticket.id) && item.ticketCode !== ticket.ticketCode)
    );
    refreshMyTickets();
    refreshOrganizerCommerce();
    return result;
  };

  const handlePayReservation = async (reservation: ReservationRecord) => {
    const response = await ticketsApi.payReservationBalance(reservation.id);
    if (response.paymentUrl) {
      redirectToPaymentProvider(response.paymentUrl);
      return;
    }

    const tickets = response.tickets || [];
    if (tickets.length > 0) {
      setMyReservations((prev) => prev.filter((item) => String(item.id) !== String(reservation.id)));
      setMyTickets((prev) => [...tickets, ...prev]);
      refreshMyTickets();
      refreshPublishedMarketplaceEvents();
      window.alert('Полная оплата принята. Билет создан и доступен в Моих билетах.');
      return;
    }

    refreshMyTickets();
  };

  const handleCancelReservation = async (reservation: ReservationRecord) => {
    const result = await ticketsApi.cancelReservation(reservation.id);
    setMyReservations((prev) => prev.filter((item) => String(item.id) !== String(reservation.id)));
    refreshPublishedMarketplaceEvents();
    window.alert(result.message || 'Бронь отменена.');
  };

  const handleBookTicket = (event: any) => {
    if (isValidator) {
      setCurrentView('validator-dashboard');
      setValidatorTab('events');
      window.scrollTo(0, 0);
      return;
    }
    // Always go to ticket selection, authentication will happen at checkout
    setTicketSelectionReadOnly(Boolean(event?.soldOut));
    setPendingEvent(event);
    setCurrentView('ticket-selection');
    window.scrollTo(0, 0);
  };

  const handleExploreMoreEvents = () => {
    setCurrentView('all-events');
    window.scrollTo(0, 0);
  };

  const handleExploreMoreSpecialPrograms = () => {
    setCurrentView('all-special-programs');
    window.scrollTo(0, 0);
  };

  const completeTicketPurchase = async (event: any, ticketDetails: any) => {
    const response = await ticketsApi.purchaseTickets({
      eventId: event?.isManagedEvent ? event?.id : undefined,
      eventData: event,
      ticketDetails,
    });
    if (response.paymentUrl) {
      redirectToPaymentProvider(response.paymentUrl);
      return;
    }

    if (response.reservation) {
      setMyReservations((prev) => [response.reservation!, ...prev]);
      refreshMyTickets();
      refreshPublishedMarketplaceEvents();
      setCurrentView('profile');
      setProfileTab('my-tickets');
      window.alert('Бронь создана. Билет появится после полной оплаты остатка.');
      window.scrollTo(0, 0);
      return;
    }

    const tickets = response.tickets || [];
    if (tickets.length === 0) {
      throw new Error('Payment was not initialized');
    }

    setRecentPurchaseTickets(tickets);
    setMyTickets((prev) => [...tickets, ...prev]);
    refreshMyTickets();
    refreshPublishedMarketplaceEvents();
    setCurrentView('purchase-success');
    window.scrollTo(0, 0);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    
    // If we were trying to buy a ticket
    if (pendingEvent) {
      setIsPurchaseGateOpen(false);
      // If we have purchase details waiting, go to success, otherwise back to selection
      if (purchaseDetails) {
        completeTicketPurchase(pendingEvent, purchaseDetails).catch((error) => {
          console.error('Failed to complete ticket purchase', error);
          window.alert(error?.message || 'Failed to complete ticket purchase');
        });
      } else {
        setCurrentView('ticket-selection');
      }
      window.scrollTo(0, 0);
    }
  };

  const openAuthModal = (view: 'login' | 'register') => {
    setAuthInitialView(view);
    setIsAuthModalOpen(true);
  };

  const handlePurchaseGateLogin = () => {
    setIsPurchaseGateOpen(false);
    openAuthModal('login');
  };

  const handlePurchaseGateRegister = () => {
    setIsPurchaseGateOpen(false);
    openAuthModal('register');
  };

  const handlePurchaseGateClose = () => {
    setIsPurchaseGateOpen(false);
    setPurchaseDetails(null);
    // Don't clear pendingEvent so user stays on the event page
  };

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
    setFavorites([]);
    setMyTickets([]);
    setMyReservations([]);
    setOrganizerEvents([]);
    setOrganizerOrders([]);
    setOrganizerAnalytics(null);
    setOrganizerValidators([]);
    setAdminRequests([]);
    setAdminArchivedRequests([]);
    setAdminUsers([]);
    setAdminEvents([]);
    setAdminArchivedEvents([]);
    setCurrentView('home');
    setPendingEvent(null);
    setPurchaseDetails(null);
    setRecentPurchaseTickets([]);
  };

  const handleDismissOrganizerApproval = () => {
    authApi.acknowledgeOrganizerApproval()
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        setUser((prev: any) => prev ? { ...prev, organizerApprovalNoticePending: false } : prev);
      });
  };

  const handleBackToEvents = () => {
    if (isValidator) {
      setCurrentView('validator-dashboard');
      setValidatorTab('events');
      setPendingEvent(null);
      setTicketSelectionReadOnly(false);
      window.scrollTo(0, 0);
      return;
    }
    if (isOrganizer && !isAdmin) {
      setCurrentView('organizer-dashboard');
      setOrganizerTab('events');
      setPendingEvent(null);
      setTicketSelectionReadOnly(false);
      window.scrollTo(0, 0);
      return;
    }
    if (isAdmin && ticketSelectionReadOnly) {
      setCurrentView('admin-panel');
      setAdminTab('moderation');
      setPendingEvent(null);
      setTicketSelectionReadOnly(false);
      window.scrollTo(0, 0);
      return;
    }
    setCurrentView('home');
    setPendingEvent(null);
    setTicketSelectionReadOnly(false);
    window.scrollTo(0, 0);
  };

  const handlePurchaseComplete = async (ticketDetails: any) => {
    setPurchaseDetails(ticketDetails);
    
    if (user) {
      return completeTicketPurchase(pendingEvent, ticketDetails).catch((error) => {
        console.error('Failed to complete ticket purchase', error);
        window.alert(error?.message || 'Failed to complete ticket purchase');
        throw error;
      });
    } else {
      setIsPurchaseGateOpen(true);
    }
  };

  const handleViewMyTickets = () => {
    if (isValidator) return;
    setCurrentView('profile');
    setProfileTab('my-tickets');
    window.scrollTo(0, 0);
  };

  const handleNavigateToFavorites = () => {
    if (isValidator) return;
    setCurrentView('profile');
    setProfileTab('favorites');
    window.scrollTo(0, 0);
  };

  const handleNavigateToPurchaseHistory = () => {
    if (isValidator) return;
    setCurrentView('profile');
    setProfileTab('purchase-history');
    window.scrollTo(0, 0);
  };

  const handleNavigateToAccountSettings = () => {
    setCurrentView('profile');
    setProfileTab('account-settings');
    window.scrollTo(0, 0);
  };

  const handleBecomeOrganizer = () => {
    if (isValidator) return;
    setCurrentView('become-organizer');
    window.scrollTo(0, 0);
  };

  const handleOrganizerDashboard = () => {
    if (isValidator) return;
    setCurrentView('organizer-dashboard');
    setOrganizerTab('dashboard');
    window.scrollTo(0, 0);
  };

  const handleOrganizerEvents = () => {
    if (isValidator) return;
    setCurrentView('organizer-dashboard');
    setOrganizerTab('events');
    window.scrollTo(0, 0);
  };

  const handleOrganizerCreateEvent = () => {
    if (isValidator) return;
    if (!isOrganizerActive) {
      window.alert('Organizer access is deactivated. Creating new events is disabled.');
      return;
    }
    setEditingOrganizerEvent(null);
    setCurrentView('organizer-dashboard');
    setOrganizerTab('create-event');
    window.scrollTo(0, 0);
  };

  const handleOrganizerOrders = () => {
    if (isValidator) return;
    setCurrentView('organizer-dashboard');
    setOrganizerTab('orders');
    window.scrollTo(0, 0);
  };

  const handleOrganizerAnalytics = () => {
    if (isValidator) return;
    setCurrentView('organizer-dashboard');
    setOrganizerTab('analytics');
    window.scrollTo(0, 0);
  };

  const handleValidatorEvents = () => {
    setCurrentView('validator-dashboard');
    setValidatorTab('events');
    window.scrollTo(0, 0);
  };

  const handleValidatorScan = () => {
    setCurrentView('validator-dashboard');
    setValidatorTab('scan');
    window.scrollTo(0, 0);
  };

  const handleValidatorSelectEvent = (eventId: string) => {
    setSelectedValidatorEventId(eventId);
  };

  const handleValidatorScanSubmit = async (qrToken: string, eventId: string) => {
    try {
      const result = await validatorApi.validatorScan({ qrToken, eventId });
      refreshValidatorData();
      refreshMyTickets();
      return result;
    } catch (error) {
      refreshValidatorData();
      refreshMyTickets();
      throw error;
    }
  };

  const handleCreateEventSave = async (eventData: any, isDraft: boolean) => {
    try {
      const payload = {
        ...eventData,
        status: isDraft ? 'draft' : 'pending',
      };
      const response = editingOrganizerEvent
        ? await authApi.updateOrganizerEvent(editingOrganizerEvent.id, payload)
        : await authApi.createOrganizerEvent(payload);
      refreshOrganizerEvents();
      refreshPublishedMarketplaceEvents();
      authApi.organizerAnalytics().then(setOrganizerAnalytics).catch(() => {});
      setEditingOrganizerEvent(null);
      setOrganizerTab('events');
      window.scrollTo(0, 0);
      return response;
    } catch (error) {
      console.error('Failed to save organizer event', error);
      throw error;
    }
  };

  const handleCreateEventBack = () => {
    setEditingOrganizerEvent(null);
    setOrganizerTab('events');
    window.scrollTo(0, 0);
  };

  const handleViewOrganizerEvent = (event: any) => {
    setPendingEvent(event);
    setTicketSelectionReadOnly(event?.status !== 'published' || Boolean(event?.soldOut));
    setCurrentView('ticket-selection');
    window.scrollTo(0, 0);
  };

  const handleViewAdminEvent = (event: any) => {
    setPendingEvent(event);
    setTicketSelectionReadOnly(true);
    setCurrentView('ticket-selection');
    window.scrollTo(0, 0);
  };

  const handleEditOrganizerEvent = (event: any) => {
    setEditingOrganizerEvent(event);
    setCurrentView('organizer-dashboard');
    setOrganizerTab('create-event');
    window.scrollTo(0, 0);
  };

  const handleMoveOrganizerEventToDraft = (event: any) => {
    return authApi.moveOrganizerEventToDraft(event.id)
      .then(() => {
        refreshOrganizerEvents();
        authApi.adminEvents("pending").then((data) => setAdminEvents(data.events || [])).catch(() => {});
      })
      .catch((error) => {
        window.alert(error?.message || 'Failed to move event to draft');
      });
  };

  const handleDeleteOrganizerEvent = (event: any) => {
    const isActivePublishedEvent = event.status === 'published';
    const confirmed = window.confirm(
      isActivePublishedEvent
        ? `Cancel "${event.title}"? The event will be removed from public sale, all paid tickets and reservations will be refunded through Freedom Pay, and buyers will receive cancellation emails.`
        : `Delete "${event.title}"? This action cannot be undone.`
    );
    if (!confirmed) return Promise.resolve();

    return authApi.deleteOrganizerEvent(event.id)
      .then((data) => {
        if (isActivePublishedEvent) {
          refreshOrganizerCommerce();
        } else {
          refreshOrganizerEvents();
        }
        refreshPublishedMarketplaceEvents();
        authApi.adminEvents("pending").then((data) => setAdminEvents(data.events || [])).catch(() => {});
        if (isActivePublishedEvent) {
          const summary = data?.refundSummary;
          window.alert(
            summary
              ? `Event cancelled. Refunded orders: ${summary.orders}. Cancelled tickets: ${summary.ticketsCancelled}. Emails sent: ${summary.emailsSent}.`
              : 'Event cancelled and refunds requested.'
          );
        }
      })
      .catch((error) => {
        const summary = error?.refundSummary;
        window.alert(
          summary
            ? `${error?.message || 'Failed to cancel event'}\nRefunded before error: ${summary.processedOrders || 0}/${summary.orders}. Failed order: ${summary.failedOrders?.[0]?.buyerEmail || 'unknown'}`
            : error?.message || 'Failed to delete event'
        );
      });
  };

  const handleCreateOrganizerValidator = (payload: { fullName: string; email: string; password: string }) => {
    return authApi.createOrganizerValidator(payload).then(() => {
      refreshOrganizerValidators();
    });
  };

  const handleAssignOrganizerValidator = (eventId: string, validatorId: string) => {
    return authApi.assignOrganizerValidatorToEvent(eventId, validatorId).then(() => {
      refreshOrganizerValidators();
      refreshOrganizerEvents();
    });
  };

  const handleUnassignOrganizerValidator = (eventId: string, validatorId: string) => {
    return authApi.unassignOrganizerValidatorFromEvent(eventId, validatorId).then(() => {
      refreshOrganizerValidators();
      refreshOrganizerEvents();
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-purple-900 selection:text-purple-100 dark:bg-black dark:text-gray-100">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.4);
        }
      `}} />
      
      {currentView !== 'organizer-dashboard' ? (
        <Navbar 
          selectedCity={selectedCity} 
          onCityChange={setSelectedCity}
          user={user}
          onLogout={handleLogout}
          onOpenAuth={openAuthModal}
          onNavigateToMyTickets={user ? handleViewMyTickets : undefined}
          onNavigateToFavorites={user ? handleNavigateToFavorites : undefined}
          onNavigateToPurchaseHistory={user ? handleNavigateToPurchaseHistory : undefined}
          onNavigateToAccountSettings={user ? handleNavigateToAccountSettings : undefined}
          onBecomeOrganizer={handleBecomeOrganizer}
          onOrganizerDashboard={isOrganizer ? handleOrganizerDashboard : undefined}
          onOrganizerEvents={isOrganizer ? handleOrganizerEvents : undefined}
          onOrganizerOrders={isOrganizer ? handleOrganizerOrders : undefined}
          onOrganizerAnalytics={isOrganizer ? handleOrganizerAnalytics : undefined}
          onValidatorEvents={isValidator ? handleValidatorEvents : undefined}
          onValidatorScan={isValidator ? handleValidatorScan : undefined}
          onAdminPanel={isAdmin ? handleOpenAdminPanel : undefined}
          onAdminRequests={isAdmin ? handleOpenAdminRequests : undefined}
          onAdminUsers={isAdmin ? handleOpenAdminUsers : undefined}
          onAdminModeration={isAdmin ? handleOpenAdminModeration : undefined}
          isOrganizer={isOrganizer}
          isAdmin={isAdmin}
          isValidator={isValidator}
          onNavigateHomeSection={handleNavigateHomeSection}
          showHomeLink={(currentView === 'profile' || currentView === 'admin-panel' || currentView === 'all-events' || currentView === 'all-special-programs') && !isValidator}
          showOrganizerDashboardLink={currentView !== 'organizer-dashboard'}
          showAdminPanelLink={currentView !== 'admin-panel'}
          hideCitySelector={isValidator || currentView === 'admin-panel'}
          showValidatorNavLinks={isValidatorAccountSettingsView}
          organizerCompactMode={
            (currentView === 'organizer-dashboard' && isOrganizer && !isAdmin) ||
            isOrganizerAccountSettingsView
          }
          showOrganizerDashboardShortcut={isOrganizerAccountSettingsView}
        />
      ) : (
        <Navbar 
          selectedCity={selectedCity} 
          onCityChange={setSelectedCity}
          user={user}
          onLogout={handleLogout}
          onOpenAuth={openAuthModal}
          onNavigateToMyTickets={user ? handleViewMyTickets : undefined}
          onNavigateToFavorites={user ? handleNavigateToFavorites : undefined}
          onNavigateToPurchaseHistory={user ? handleNavigateToPurchaseHistory : undefined}
          onNavigateToAccountSettings={user ? handleNavigateToAccountSettings : undefined}
          onBecomeOrganizer={handleBecomeOrganizer}
          onOrganizerDashboard={isOrganizer ? handleOrganizerDashboard : undefined}
          onOrganizerEvents={isOrganizer ? handleOrganizerEvents : undefined}
          onOrganizerOrders={isOrganizer ? handleOrganizerOrders : undefined}
          onOrganizerAnalytics={isOrganizer ? handleOrganizerAnalytics : undefined}
          onValidatorEvents={isValidator ? handleValidatorEvents : undefined}
          onValidatorScan={isValidator ? handleValidatorScan : undefined}
          onAdminPanel={isAdmin ? handleOpenAdminPanel : undefined}
          onAdminRequests={isAdmin ? handleOpenAdminRequests : undefined}
          onAdminUsers={isAdmin ? handleOpenAdminUsers : undefined}
          onAdminModeration={isAdmin ? handleOpenAdminModeration : undefined}
          isOrganizer={isOrganizer}
          isAdmin={isAdmin}
          isValidator={isValidator}
          onNavigateHomeSection={handleNavigateHomeSection}
          showHomeLink={!isValidator || currentView === 'all-events' || currentView === 'all-special-programs'}
          showOrganizerDashboardLink={false}
          showAdminPanelLink={currentView !== 'admin-panel'}
          hideCitySelector={isValidator || currentView === 'admin-panel'}
          showValidatorNavLinks={isValidatorAccountSettingsView}
          organizerCompactMode
          showOrganizerDashboardShortcut={false}
        />
      )}
      
      <main>
        {user?.organizerApprovalNoticePending && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl shadow-purple-900/30">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">Organizer Approved</p>
              <h2 className="mt-3 text-3xl font-bold text-white">Congratulations!</h2>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Your organizer request has been approved. You can now access organizer features and start managing events on DanceTime.
              </p>
              <button
                onClick={handleDismissOrganizerApproval}
                className="mt-6 w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-purple-500"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {currentView === 'home' ? (
          <>
            <Hero />
            
            <section className="py-12 border-b border-border bg-[rgba(238,231,249,0.85)] dark:border-white/5 dark:bg-black">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8 dark:text-gray-500">
                  {t('home.partners')}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-7 md:gap-10">
                  {PARTNER_LOGOS.map((logo) => (
                    <div
                      key={logo.alt}
                      className="flex h-20 w-36 items-center justify-center p-2 sm:h-24 sm:w-44"
                    >
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <MarketplaceSearch
              value={marketplaceSearchQuery}
              onChange={setMarketplaceSearchQuery}
            />

            {isMarketplaceEventsLoading ? (
              <MarketplaceEventsLoading />
            ) : (
              <>
                <FeaturedEvents
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  onBookTicket={handleBookTicket}
                  favoriteIds={favorites.map(item => item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  dynamicEvents={publishedMarketplaceEvents.filter((event) => event.eventType !== 'special-program')}
                  onExploreMore={handleExploreMoreEvents}
                  searchQuery={marketplaceSearchQuery}
                  hideWhenEmptyDuringSearch
                />

                <SpecialPrograms
                  onBookTicket={handleBookTicket}
                  selectedCity={selectedCity}
                  favoriteIds={favorites.map(item => item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onExploreMore={handleExploreMoreSpecialPrograms}
                  searchQuery={marketplaceSearchQuery}
                  dynamicPrograms={publishedMarketplaceEvents
                    .filter((event) => event.eventType === 'special-program')
                    .map((event) => ({
                      ...event,
                      time: event.time ? `${event.date} - ${event.time}` : event.date,
                    }))}
                />
              </>
            )}

            <Features />
            
            <section className="py-20 bg-purple-600">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">500+</div>
                    <div className="text-purple-100 font-medium">{t('home.statsSold')}</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">70+</div>
                    <div className="text-purple-100 font-medium">{t('home.statsOrganizers')}</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">3</div>
                    <div className="text-purple-100 font-medium">{t('home.statsCities')}</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</div>
                    <div className="text-purple-100 font-medium">{t('home.statsSupport')}</div>
                  </div>
                </div>
              </div>
            </section>

            <Testimonials />
              <CTA
                onBecomeOrganizer={handleBecomeOrganizer}
              />
          </>
        ) : currentView === 'all-events' ? (
          <>
            <MarketplaceBackButton
              label={t('common.back')}
              onBack={() => handleNavigateHomeSection('top')}
            />
            <MarketplaceSearch
              value={marketplaceSearchQuery}
              onChange={setMarketplaceSearchQuery}
            />
            {isMarketplaceEventsLoading ? (
              <MarketplaceEventsLoading />
            ) : (
              <FeaturedEvents
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                onBookTicket={handleBookTicket}
                favoriteIds={favorites.map(item => item.id)}
                onToggleFavorite={handleToggleFavorite}
                dynamicEvents={publishedMarketplaceEvents.filter((event) => event.eventType !== 'special-program')}
                expandedMode
                showExploreMoreButton={false}
                searchQuery={marketplaceSearchQuery}
              />
            )}
          </>
        ) : currentView === 'all-special-programs' ? (
          <>
            <MarketplaceBackButton
              label={t('common.back')}
              onBack={() => handleNavigateHomeSection('top')}
            />
            <MarketplaceSearch
              value={marketplaceSearchQuery}
              onChange={setMarketplaceSearchQuery}
            />
            {isMarketplaceEventsLoading ? (
              <MarketplaceEventsLoading />
            ) : (
              <SpecialPrograms
                onBookTicket={handleBookTicket}
                selectedCity={selectedCity}
                favoriteIds={favorites.map(item => item.id)}
                onToggleFavorite={handleToggleFavorite}
                searchQuery={marketplaceSearchQuery}
                dynamicPrograms={publishedMarketplaceEvents
                  .filter((event) => event.eventType === 'special-program')
                  .map((event) => ({
                    ...event,
                    time: event.time ? `${event.date} - ${event.time}` : event.date,
                  }))}
                expandedMode
                showExploreMoreButton={false}
              />
            )}
          </>
        ) : currentView === 'ticket-selection' ? (
          pendingEvent && (
            <TicketSelection 
              event={pendingEvent} 
              onBack={handleBackToEvents}
              onPurchaseComplete={handlePurchaseComplete}
              readOnly={ticketSelectionReadOnly}
            />
          )
        ) : currentView === 'purchase-success' ? (
          pendingEvent && purchaseDetails && recentPurchaseTickets.length > 0 && (
            <PurchaseSuccess 
              event={pendingEvent}
              ticketDetails={purchaseDetails}
              tickets={recentPurchaseTickets}
              onViewMyTickets={handleViewMyTickets}
              onBackToHome={handleBackToEvents}
            />
          )
        ) : currentView === 'profile' ? (
          <ProfileLayout 
            activeTab={profileTab}
            onNavigate={setProfileTab}
            isAdmin={isAdmin}
            isOrganizer={isOrganizer}
            isValidator={isValidator}
          >
            {!isAdmin && !isOrganizer && !isValidator && profileTab === 'my-tickets' && (
              <MyTickets
                onBack={handleBackToEvents}
                tickets={myTickets}
                reservations={myReservations}
                onOpenTicket={handleOpenTicket}
                onOpenReservation={handleOpenReservation}
                onRefundTicket={handleRefundTicket}
                onPayReservation={handlePayReservation}
                onCancelReservation={handleCancelReservation}
              />
            )}
            {!isAdmin && !isOrganizer && !isValidator && profileTab === 'favorites' && (
              <Favorites
                favorites={favorites}
                onRemoveFavorite={handleRemoveFavorite}
                onOpenFavorite={handleOpenFavorite}
              />
            )}
            {!isAdmin && !isOrganizer && !isValidator && profileTab === 'purchase-history' && (
              <PurchaseHistory
                purchases={purchaseHistory.map((ticket) => ({
                  id: ticket.ticketCode,
                  event: ticket.event.title,
                  date: ticket.event.date,
                  venue: ticket.event.location,
                  city: ticket.event.city,
                  tickets: 1,
                  ticketType: ticket.ticketType,
                  total: ticket.price,
                  purchaseDate: ticket.purchasedAt,
                  status: ticket.status,
                  image: ticket.event.image,
                  qrCodeDataUrl: ticket.qrCodeDataUrl,
                  barcodeDataUrl: ticket.barcodeDataUrl,
                }))}
              />
            )}
            {profileTab === 'account-settings' && <AccountSettings user={user} onUserUpdate={setUser} />}
          </ProfileLayout>
        ) : currentView === 'become-organizer' ? (
          <BecomeOrganizer
            onBack={handleBackToEvents}
            user={user}
            onUserUpdate={setUser}
            onOpenAuth={openAuthModal}
          />
        ) : currentView === 'organizer-dashboard' ? (
          <OrganizerLayout 
            activeTab={organizerTab}
            onNavigate={setOrganizerTab}
            canCreateEvent={isOrganizerActive}
          >
            {organizerTab === 'dashboard' && (
              <OrganizerDashboard
                onCreateEvent={handleOrganizerCreateEvent}
                events={organizerEvents}
                canCreateEvent={isOrganizerActive}
              />
            )}
            {organizerTab === 'events' && (
              <OrganizerEvents
                events={organizerEvents}
                onCreateEvent={handleOrganizerCreateEvent}
                onViewEvent={handleViewOrganizerEvent}
                onEditEvent={handleEditOrganizerEvent}
                onMoveToDraft={handleMoveOrganizerEventToDraft}
                onDeleteEvent={handleDeleteOrganizerEvent}
                canCreateEvent={isOrganizerActive}
              />
            )}
            {organizerTab === 'create-event' && isOrganizerActive && (
              <CreateEvent
                onSave={handleCreateEventSave}
                onBack={handleCreateEventBack}
                initialEvent={editingOrganizerEvent}
                mode={editingOrganizerEvent ? 'edit' : 'create'}
              />
            )}
            {organizerTab === 'validators' && (
              <OrganizerValidators
                events={organizerEvents}
                validators={organizerValidators}
                onCreateValidator={handleCreateOrganizerValidator}
                onAssignValidator={handleAssignOrganizerValidator}
                onUnassignValidator={handleUnassignOrganizerValidator}
              />
            )}
            {organizerTab === 'orders' && <OrganizerOrders orders={organizerOrders} />}
            {organizerTab === 'analytics' && <OrganizerAnalytics analytics={organizerAnalytics} />}
          </OrganizerLayout>
        ) : currentView === 'validator-dashboard' ? (
          <ValidatorLayout activeTab={validatorTab} onNavigate={setValidatorTab}>
            {validatorTab === 'events' && (
              <ValidatorAssignedEvents
                events={validatorEvents}
                onStartScan={(event) => {
                  setSelectedValidatorEventId(event.id);
                  setValidatorTab('scan');
                }}
              />
            )}
            {validatorTab === 'scan' && (
              <ValidatorScanTicket
                events={validatorEvents}
                selectedEvent={validatorEvents.find((event) => event.id === selectedValidatorEventId) || null}
                onSelectEvent={handleValidatorSelectEvent}
                onScan={handleValidatorScanSubmit}
                recentScans={validatorRecentScans}
              />
            )}
          </ValidatorLayout>
        ) : currentView === 'admin-panel' ? (
          <AdminPanel
            activeTab={adminTab}
            onNavigate={setAdminTab}
            overview={adminOverview}
            requests={adminRequests}
            archivedRequests={adminArchivedRequests}
            users={adminUsers}
            events={adminEvents}
            archivedEvents={adminArchivedEvents}
            onSearchUsers={handleAdminUserSearch}
            onDeactivateOrganizer={handleAdminDeactivateOrganizer}
            onActivateOrganizer={handleAdminActivateOrganizer}
            onBlockUser={handleAdminBlockUser}
            onUnblockUser={handleAdminUnblockUser}
            onApproveRequest={handleApproveOrganizerRequest}
            onRejectRequest={handleRejectOrganizerRequest}
            onApproveEvent={handleApproveAdminEvent}
            onRejectEvent={handleRejectAdminEvent}
            onViewEvent={handleViewAdminEvent}
          />
        ) : currentView === 'verify-email' ? (
          <VerifyEmailPage
            onGoHome={handleBackToEvents}
            onOpenLogin={() => openAuthModal('login')}
          />
        ) : currentView === 'reset-password' ? (
          <ResetPasswordPage
            onGoHome={handleBackToEvents}
            onOpenLogin={() => openAuthModal('login')}
          />
        ) : null}
      </main>

      {currentView !== 'organizer-dashboard' && currentView !== 'validator-dashboard' && currentView !== 'admin-panel' && !isOrganizerAccountSettingsView && !isValidatorAccountSettingsView && (
        <Footer onBecomeOrganizer={handleBecomeOrganizer} />
      )}

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialView={authInitialView}
      />

      <PurchaseGateModal 
        isOpen={isPurchaseGateOpen}
        onClose={handlePurchaseGateClose}
        onLogin={handlePurchaseGateLogin}
        onRegister={handlePurchaseGateRegister}
      />
    </div>
  );
}

export default function App() {
  const [appUserLanguage, setAppUserLanguage] = useState<'en' | 'ru' | 'kk' | null>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      setAppUserLanguage('en');
      return;
    }

    authApi.me()
      .then(({ user }) => setAppUserLanguage(user?.language || 'en'))
      .catch(() => setAppUserLanguage('en'));
  }, []);

  return (
    <I18nProvider userLanguage={appUserLanguage}>
      <AppContent />
    </I18nProvider>
  );
}
