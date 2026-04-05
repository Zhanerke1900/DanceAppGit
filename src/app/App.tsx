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
import type { TicketRecord } from './api/tickets';
import { VerifyEmailPage } from './components/VerifyEmailPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';

type ViewState = 'home' | 'all-events' | 'all-special-programs' | 'ticket-selection' | 'purchase-success' | 'profile' | 'become-organizer' | 'organizer-dashboard' | 'validator-dashboard' | 'admin-panel' | 'verify-email'
  | 'reset-password';
type ProfileTab = 'my-tickets' | 'favorites' | 'purchase-history' | 'account-settings';
type OrganizerTab = 'dashboard' | 'events' | 'create-event' | 'validators' | 'orders' | 'analytics';
type ValidatorTab = 'events' | 'scan';
type AdminTab = 'dashboard' | 'requests' | 'users' | 'moderation';
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

export default function App() {
  const [selectedCity, setSelectedCity] = useState("Astana");
  const [pendingHomeSection, setPendingHomeSection] = useState<'top' | 'events' | 'about' | 'organizers' | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [myTickets, setMyTickets] = useState<TicketRecord[]>([]);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login');
  
  // Purchase Flow State
  const [isPurchaseGateOpen, setIsPurchaseGateOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [recentPurchaseTickets, setRecentPurchaseTickets] = useState<TicketRecord[]>([]);
  const [ticketSelectionReadOnly, setTicketSelectionReadOnly] = useState(false);
  
  // Profile State
  const [profileTab, setProfileTab] = useState<ProfileTab>('my-tickets');
  
  // Organizer State
  const [organizerTab, setOrganizerTab] = useState<OrganizerTab>('dashboard');
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [organizerOrders, setOrganizerOrders] = useState<any[]>([]);
  const [organizerAnalytics, setOrganizerAnalytics] = useState<any>(null);
  const [organizerValidators, setOrganizerValidators] = useState<any[]>([]);
  const [editingOrganizerEvent, setEditingOrganizerEvent] = useState<any>(null);
  const [validatorTab, setValidatorTab] = useState<ValidatorTab>('events');
  const [validatorEvents, setValidatorEvents] = useState<any[]>([]);
  const [validatorRecentScans, setValidatorRecentScans] = useState<any[]>([]);
  const [selectedValidatorEventId, setSelectedValidatorEventId] = useState('');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [adminOverview, setAdminOverview] = useState<any>(null);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [adminArchivedRequests, setAdminArchivedRequests] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminEvents, setAdminEvents] = useState<any[]>([]);
  const [adminArchivedEvents, setAdminArchivedEvents] = useState<any[]>([]);
  const [publishedMarketplaceEvents, setPublishedMarketplaceEvents] = useState<any[]>([]);
  const isOrganizer = Boolean(user?.isOrganizer || user?.organizerStatus === 'approved');
  const isOrganizerActive = !isOrganizer || user?.organizerAccessStatus !== 'deactivated';
  const isAdmin = Boolean(user?.isAdmin);
  const isValidator = Boolean(user?.role === 'validator' || user?.isValidator);
  const userStorageKey = user?._id || user?.id || user?.email || null;
  const isOrganizerAccountSettingsView =
    currentView === 'profile' && profileTab === 'account-settings' && isOrganizer && !isAdmin;
  const isValidatorAccountSettingsView =
    currentView === 'profile' && profileTab === 'account-settings' && isValidator;

  useEffect(() => {
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleBlocked = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail;
      authApi.logout().catch(() => {});
      setUser(null);
      setFavorites([]);
      setMyTickets([]);
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
    authApi.publishedEvents()
      .then((data) => setPublishedMarketplaceEvents(data.events || []))
      .catch(() => setPublishedMarketplaceEvents([]));
  }, []);

useEffect(() => {
  const path = window.location.pathname;
  if (path.startsWith('/verify-email')) setCurrentView('verify-email');
  if (path.startsWith('/reset-password')) setCurrentView('reset-password');
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
      return;
    }

    ticketsApi.myTickets()
      .then((data) => setMyTickets(data.tickets || []))
      .catch(() => setMyTickets([]));
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
      .then((data) => setMyTickets(data.tickets || []))
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
    });
  };

  const handleAdminActivateOrganizer = (id: string) => {
    return authApi.adminActivateOrganizer(id).then((data) => {
      setAdminUsers((prev) => prev.map((item) => item.id === id ? data.user : item));
      authApi.adminOverview().then(setAdminOverview).catch(() => {});
    });
  };

  const handleAdminBlockUser = (id: string, reason: 'Fraud' | 'Spam' | 'Fake event' | 'Abuse') => {
    return authApi.blockUser(id, reason).then((data) => {
      setAdminUsers((prev) => prev.map((item) => item.id === id ? data.user : item));
    });
  };

  const handleAdminUnblockUser = (id: string) => {
    return authApi.unblockUser(id).then((data) => {
      setAdminUsers((prev) => prev.map((item) => item.id === id ? data.user : item));
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

  const handleRefundTicket = async (ticket: TicketRecord) => {
    const result = await ticketsApi.refundTicket(ticket.id);
    setMyTickets((prev) =>
      prev.filter((item) => String(item.id) !== String(ticket.id) && item.ticketCode !== ticket.ticketCode)
    );
    refreshMyTickets();
    refreshOrganizerCommerce();
    return result;
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
    setRecentPurchaseTickets(response.tickets || []);
    setMyTickets((prev) => [...(response.tickets || []), ...prev]);
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

  const handlePurchaseComplete = (ticketDetails: any) => {
    setPurchaseDetails(ticketDetails);
    
    if (user) {
      completeTicketPurchase(pendingEvent, ticketDetails).catch((error) => {
        console.error('Failed to complete ticket purchase', error);
        window.alert(error?.message || 'Failed to complete ticket purchase');
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
    setTicketSelectionReadOnly(true);
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
    const confirmed = window.confirm(`Delete "${event.title}"? This action cannot be undone.`);
    if (!confirmed) return Promise.resolve();

    return authApi.deleteOrganizerEvent(event.id)
      .then(() => {
        refreshOrganizerEvents();
        authApi.adminEvents("pending").then((data) => setAdminEvents(data.events || [])).catch(() => {});
      })
      .catch((error) => {
        window.alert(error?.message || 'Failed to delete event');
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
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
            
            <section className="py-12 border-b border-white/5 bg-black">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
                  Empowering events in Kazakhstan
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                  <span className="text-2xl font-black text-white italic">Astana Ballet</span>
                  <span className="text-2xl font-bold text-white">Tribal Pro</span>
                  <span className="text-2xl font-serif text-white">SDance</span>
                  <span className="text-2xl font-mono font-bold text-white tracking-tighter">Dream Way</span>
                  <span className="text-2xl font-bold text-white">Prima</span>
                </div>
              </div>
            </section>

            <FeaturedEvents 
              selectedCity={selectedCity} 
              onCityChange={setSelectedCity}
              onBookTicket={handleBookTicket}
              favoriteIds={favorites.map(item => item.id)}
              onToggleFavorite={handleToggleFavorite}
              dynamicEvents={publishedMarketplaceEvents.filter((event) => event.eventType === 'usual-event')}
              onExploreMore={handleExploreMoreEvents}
            />
            
            <SpecialPrograms
              onBookTicket={handleBookTicket}
              selectedCity={selectedCity}
              favoriteIds={favorites.map(item => item.id)}
              onToggleFavorite={handleToggleFavorite}
              onExploreMore={handleExploreMoreSpecialPrograms}
              dynamicPrograms={publishedMarketplaceEvents
                .filter((event) => event.eventType === 'special-program')
                .map((event) => ({
                  ...event,
                  time: event.time ? `${event.date} - ${event.time}` : event.date,
                }))}
            />

            <Features />
            
            <section className="py-20 bg-purple-600">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">500+</div>
                    <div className="text-purple-100 font-medium">Tickets Sold in KZ</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">70+</div>
                    <div className="text-purple-100 font-medium">Organizers</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">3</div>
                    <div className="text-purple-100 font-medium">Major Cities</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</div>
                    <div className="text-purple-100 font-medium">Local Support</div>
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
          <FeaturedEvents
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            onBookTicket={handleBookTicket}
            favoriteIds={favorites.map(item => item.id)}
            onToggleFavorite={handleToggleFavorite}
            dynamicEvents={publishedMarketplaceEvents.filter((event) => event.eventType === 'usual-event')}
            expandedMode
            showExploreMoreButton={false}
          />
        ) : currentView === 'all-special-programs' ? (
          <>
            <section className="bg-black px-4 pt-24 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-7xl justify-start">
                <button
                  onClick={() => handleNavigateHomeSection('top')}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Home
                </button>
              </div>
            </section>
            <SpecialPrograms
              onBookTicket={handleBookTicket}
              selectedCity={selectedCity}
              favoriteIds={favorites.map(item => item.id)}
              onToggleFavorite={handleToggleFavorite}
              dynamicPrograms={publishedMarketplaceEvents
                .filter((event) => event.eventType === 'special-program')
                .map((event) => ({
                  ...event,
                  time: event.time ? `${event.date} - ${event.time}` : event.date,
                }))}
              expandedMode
              showExploreMoreButton={false}
            />
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
                onOpenTicket={handleOpenTicket}
                onRefundTicket={handleRefundTicket}
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
                purchases={myTickets.map((ticket) => ({
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
