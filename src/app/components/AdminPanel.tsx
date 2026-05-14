import React, { useMemo, useState } from 'react';
import {
  Activity,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '../i18n';

type AdminTab = 'dashboard' | 'requests' | 'users' | 'moderation';
type BlockReason = 'Fraud' | 'Spam' | 'Fake event' | 'Abuse';

type DashboardStat = {
  label: string;
  value: string | number;
  change: string;
  tone: 'violet' | 'cyan' | 'amber' | 'emerald' | 'rose' | 'slate';
};

const chartFrame = {
  width: 640,
  height: 300,
  top: 30,
  right: 28,
  bottom: 48,
  left: 58,
};

const chartPlotWidth = chartFrame.width - chartFrame.left - chartFrame.right;
const chartPlotHeight = chartFrame.height - chartFrame.top - chartFrame.bottom;

const compactUserDetailsCss = `
  .developer-admin-panel .admin-side-panel.admin-side-panel-compact {
    max-height: min(34rem, calc(100vh - 8rem)) !important;
    padding: 0.85rem !important;
  }

  .developer-admin-panel .admin-side-panel.admin-side-panel-compact h2 {
    font-size: clamp(1.05rem, 1.6vw, 1.3rem) !important;
  }

  .developer-admin-panel .admin-detail-list.admin-detail-list-compact {
    gap: 0.42rem !important;
    margin-top: 0.7rem !important;
  }

  .developer-admin-panel .admin-detail-list.admin-detail-list-compact > div {
    display: grid !important;
    grid-template-columns: minmax(7.5rem, 0.48fr) minmax(0, 1fr) !important;
    align-items: center !important;
    gap: 0.7rem !important;
    min-height: 0 !important;
    padding: 0.5rem 0.65rem !important;
    border-radius: 0.72rem !important;
  }

  .developer-admin-panel .admin-detail-list.admin-detail-list-compact span {
    font-size: 0.7rem !important;
    line-height: 1.2 !important;
  }

  .developer-admin-panel .admin-detail-list.admin-detail-list-compact strong {
    font-size: 0.86rem !important;
    line-height: 1.25 !important;
    text-align: right !important;
  }
`;

interface AdminPanelProps {
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  overview: {
    totalUsers: number;
    totalOrganizers: number;
    pendingOrganizerApplications: number;
    publishedEvents: number;
    pendingEvents: number;
    usersAddedThisMonth?: number;
    organizersAddedThisMonth?: number;
    eventsAddedThisMonth?: number;
    activeReservations?: number;
    collectedRevenue?: number;
    outstandingBalance?: number;
    monthlyGrowth?: Array<{
      label: string;
      users: number;
      organizers: number;
      events: number;
    }>;
  } | null;
  requests: Array<any>;
  archivedRequests: Array<any>;
  users: Array<any>;
  events: Array<any>;
  archivedEvents: Array<any>;
  onSearchUsers: (query: string) => void;
  onDeactivateOrganizer: (id: string) => Promise<any>;
  onActivateOrganizer: (id: string) => Promise<any>;
  onBlockUser: (id: string, reason: BlockReason) => Promise<any>;
  onUnblockUser: (id: string) => Promise<any>;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onApproveEvent: (id: string) => void;
  onRejectEvent: (id: string) => void;
  onViewEvent: (event: any) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  activeTab,
  onNavigate,
  overview,
  requests,
  archivedRequests,
  users,
  events,
  archivedEvents,
  onSearchUsers,
  onDeactivateOrganizer,
  onActivateOrganizer,
  onBlockUser,
  onUnblockUser,
  onApproveRequest,
  onRejectRequest,
  onApproveEvent,
  onRejectEvent,
  onViewEvent,
}) => {
  const { language } = useI18n();
  const copy = {
    en: {
      developerPanel: 'Developer Admin Panel',
      adminPanel: 'Admin Panel',
      requests: 'Requests',
      userManagement: 'User Management',
      eventModeration: 'Event Moderation',
      overview: 'Platform overview and moderation shortcuts.',
      totalUsers: 'Total Users',
      totalOrganizers: 'Total Organizers',
      pendingOrganizerApplications: 'Pending Organizer Applications',
      publishedPendingEvents: 'Published / Pending Events',
      activeReservations: 'Active Reservations',
      collectedRevenue: 'Collected Revenue',
      outstandingBalance: 'Outstanding Balance',
      thisMonth: (count: number) => `+${count} this month`,
      newThisMonth: (count: number) => `+${count} new this month`,
      waitingForReview: 'Waiting for review',
      growth: 'Growth',
      growthTitle: 'Platform Growth This Season',
      growthDesc: 'Users, organizers, and events added over the last 6 months.',
      users: 'Users',
      organizers: 'Organizers',
      events: 'Events',
      thisMonthTitle: 'This Month',
      freshActivity: 'Fresh activity across the platform',
      newUsers: 'New users',
      newOrganizers: 'New organizers',
      newEvents: 'New events',
      requestsDesc: 'Review organizer applications, archive them, or approve them later.',
      pending: 'Pending',
      archive: 'Archive',
      noPendingRequests: 'No pending organizer requests right now.',
      archiveEmpty: 'Archive is empty right now.',
      contactEmail: 'Contact Email',
      phone: 'Phone',
      notProvided: 'Not provided',
      description: 'Description',
      approve: 'Approve',
      reject: 'Reject',
      usersDesc: 'Search users, inspect account details, and manage access.',
      searchPlaceholder: 'Search by email or name',
      createdAt: 'Created At',
      view: 'View',
      deactivate: 'Deactivate',
      activate: 'Activate',
      unblock: 'Unblock',
      block: 'Block',
      userDetails: 'User Details',
      fullName: 'Full Name',
      email: 'Email',
      role: 'Role',
      organizerStatus: 'Organizer Status',
      organizerAccess: 'Organizer Access',
      accountStatus: 'Account Status',
      blockedReason: 'Blocked Reason',
      chooseUser: 'Choose a user from the list to view details and manage access.',
      moderationDesc: 'Review submitted events, approve or reject them, and inspect details.',
      noPendingEvents: 'No pending events right now.',
      submittedBy: 'Submitted by',
      viewDetails: 'View Details',
      blockUser: 'Block User',
      blockReasonPrompt: 'Choose the reason for blocking',
      cancel: 'Cancel',
      reasons: { Fraud: 'Fraud', Spam: 'Spam', 'Fake event': 'Fake event', Abuse: 'Abuse' },
      statuses: { pending: 'pending', approved: 'approved', rejected: 'rejected', active: 'active', blocked: 'blocked', deactivated: 'deactivated', published: 'published', draft: 'draft', archived: 'archived', 'pending-update-review': 'pending-update-review', none: 'none' } as Record<string, string>,
      roles: { user: 'user', organizer: 'organizer', admin: 'admin', validator: 'validator' } as Record<string, string>,
    },
    ru: {
      developerPanel: 'Панель администратора',
      adminPanel: 'Админ-панель',
      requests: 'Заявки',
      userManagement: 'Пользователи',
      eventModeration: 'Модерация событий',
      overview: 'Обзор платформы и быстрый доступ к модерации.',
      totalUsers: 'Всего пользователей',
      totalOrganizers: 'Всего организаторов',
      pendingOrganizerApplications: 'Заявки организаторов на проверке',
      publishedPendingEvents: 'Опубликовано / на проверке',
      activeReservations: 'Активные брони',
      collectedRevenue: 'Полученная выручка',
      outstandingBalance: 'Остаток к оплате',
      thisMonth: (count: number) => `+${count} за месяц`,
      newThisMonth: (count: number) => `+${count} новых за месяц`,
      waitingForReview: 'Ожидают проверки',
      growth: 'Рост',
      growthTitle: 'Рост платформы за сезон',
      growthDesc: 'Пользователи, организаторы и события за последние 6 месяцев.',
      users: 'Пользователи',
      organizers: 'Организаторы',
      events: 'События',
      thisMonthTitle: 'В этом месяце',
      freshActivity: 'Новая активность на платформе',
      newUsers: 'Новые пользователи',
      newOrganizers: 'Новые организаторы',
      newEvents: 'Новые события',
      requestsDesc: 'Проверяйте заявки организаторов, архивируйте их или одобряйте позже.',
      pending: 'На проверке',
      archive: 'Архив',
      noPendingRequests: 'Сейчас нет заявок организаторов на проверке.',
      archiveEmpty: 'Архив пока пуст.',
      contactEmail: 'Контактная почта',
      phone: 'Телефон',
      notProvided: 'Не указано',
      description: 'Описание',
      approve: 'Одобрить',
      reject: 'Отклонить',
      usersDesc: 'Ищите пользователей, просматривайте детали аккаунта и управляйте доступом.',
      searchPlaceholder: 'Поиск по email или имени',
      createdAt: 'Создан',
      view: 'Просмотр',
      deactivate: 'Деактивировать',
      activate: 'Активировать',
      unblock: 'Разблокировать',
      block: 'Заблокировать',
      userDetails: 'Данные пользователя',
      fullName: 'Полное имя',
      email: 'Почта',
      role: 'Роль',
      organizerStatus: 'Статус организатора',
      organizerAccess: 'Доступ организатора',
      accountStatus: 'Статус аккаунта',
      blockedReason: 'Причина блокировки',
      chooseUser: 'Выберите пользователя из списка, чтобы посмотреть детали и управлять доступом.',
      moderationDesc: 'Проверяйте отправленные события, одобряйте или отклоняйте их и смотрите детали.',
      noPendingEvents: 'Сейчас нет событий на проверке.',
      submittedBy: 'Отправил(а)',
      viewDetails: 'Подробнее',
      blockUser: 'Заблокировать пользователя',
      blockReasonPrompt: 'Выберите причину блокировки',
      cancel: 'Отмена',
      reasons: { Fraud: 'Мошенничество', Spam: 'Спам', 'Fake event': 'Фейковое событие', Abuse: 'Нарушение правил' },
      statuses: { pending: 'на проверке', approved: 'одобрено', rejected: 'отклонено', active: 'активен', blocked: 'заблокирован', deactivated: 'деактивирован', published: 'опубликовано', draft: 'черновик', archived: 'архив', 'pending-update-review': 'проверка изменений', none: 'нет' } as Record<string, string>,
      roles: { user: 'пользователь', organizer: 'организатор', admin: 'администратор', validator: 'валидатор' } as Record<string, string>,
    },
    kk: {
      developerPanel: 'Әкімші панелі',
      adminPanel: 'Әкімші панелі',
      requests: 'Өтінімдер',
      userManagement: 'Қолданушылар',
      eventModeration: 'Іс-шара модерациясы',
      overview: 'Платформа шолуы және модерацияға жылдам өту.',
      totalUsers: 'Барлық қолданушылар',
      totalOrganizers: 'Барлық ұйымдастырушылар',
      pendingOrganizerApplications: 'Қаралудағы ұйымдастырушы өтінімдері',
      publishedPendingEvents: 'Жарияланған / қаралуда',
      activeReservations: 'Белсенді броньдар',
      collectedRevenue: 'Алынған табыс',
      outstandingBalance: 'Төленетін қалдық',
      thisMonth: (count: number) => `+${count} осы айда`,
      newThisMonth: (count: number) => `+${count} жаңа осы айда`,
      waitingForReview: 'Тексеруді күтуде',
      growth: 'Өсу',
      growthTitle: 'Платформаның маусымдық өсуі',
      growthDesc: 'Соңғы 6 айдағы қолданушылар, ұйымдастырушылар және іс-шаралар.',
      users: 'Қолданушылар',
      organizers: 'Ұйымдастырушылар',
      events: 'Іс-шаралар',
      thisMonthTitle: 'Осы ай',
      freshActivity: 'Платформадағы жаңа белсенділік',
      newUsers: 'Жаңа қолданушылар',
      newOrganizers: 'Жаңа ұйымдастырушылар',
      newEvents: 'Жаңа іс-шаралар',
      requestsDesc: 'Ұйымдастырушы өтінімдерін қарап, архивтеңіз немесе кейін мақұлдаңыз.',
      pending: 'Қаралуда',
      archive: 'Архив',
      noPendingRequests: 'Қазір қаралудағы ұйымдастырушы өтінімдері жоқ.',
      archiveEmpty: 'Архив әзірге бос.',
      contactEmail: 'Байланыс поштасы',
      phone: 'Телефон',
      notProvided: 'Көрсетілмеген',
      description: 'Сипаттама',
      approve: 'Мақұлдау',
      reject: 'Қабылдамау',
      usersDesc: 'Қолданушыларды іздеп, аккаунт мәліметтерін қарап, қолжетімділікті басқарыңыз.',
      searchPlaceholder: 'Email немесе аты бойынша іздеу',
      createdAt: 'Құрылған уақыты',
      view: 'Көру',
      deactivate: 'Өшіру',
      activate: 'Қосу',
      unblock: 'Блоктан шығару',
      block: 'Блоктау',
      userDetails: 'Қолданушы мәліметтері',
      fullName: 'Толық аты-жөні',
      email: 'Пошта',
      role: 'Рөлі',
      organizerStatus: 'Ұйымдастырушы статусы',
      organizerAccess: 'Ұйымдастырушы қолжетімділігі',
      accountStatus: 'Аккаунт статусы',
      blockedReason: 'Блоктау себебі',
      chooseUser: 'Мәліметтерді көру және қолжетімділікті басқару үшін тізімнен қолданушыны таңдаңыз.',
      moderationDesc: 'Жіберілген іс-шараларды қарап, мақұлдаңыз немесе қабылдамаңыз.',
      noPendingEvents: 'Қазір қаралудағы іс-шаралар жоқ.',
      submittedBy: 'Жіберген',
      viewDetails: 'Толығырақ',
      blockUser: 'Қолданушыны блоктау',
      blockReasonPrompt: 'Блоктау себебін таңдаңыз',
      cancel: 'Болдырмау',
      reasons: { Fraud: 'Алаяқтық', Spam: 'Спам', 'Fake event': 'Жалған іс-шара', Abuse: 'Ереже бұзу' },
      statuses: { pending: 'қаралуда', approved: 'мақұлданды', rejected: 'қабылданбады', active: 'белсенді', blocked: 'блокталған', deactivated: 'өшірілген', published: 'жарияланды', draft: 'черновик', archived: 'архив', 'pending-update-review': 'өзгерістер қаралуда', none: 'жоқ' } as Record<string, string>,
      roles: { user: 'қолданушы', organizer: 'ұйымдастырушы', admin: 'әкімші', validator: 'валидатор' } as Record<string, string>,
    },
  }[language];
  const displayStatus = (value?: string) => copy.statuses[value || 'none'] || value || copy.statuses.none;
  const displayRole = (value?: string) => copy.roles[value || 'user'] || value || '';
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [requestView, setRequestView] = useState<'pending' | 'archive'>('pending');
  const [moderationView, setModerationView] = useState<'pending' | 'archive'>('pending');
  const [blockTarget, setBlockTarget] = useState<any>(null);
  const [blockReason, setBlockReason] = useState<BlockReason>('Fraud');

  const menuItems = [
    { id: 'dashboard', label: copy.adminPanel },
    { id: 'requests', label: copy.requests },
    { id: 'users', label: copy.userManagement },
    { id: 'moderation', label: copy.eventModeration },
  ] as const;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ru-KZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' ₸';

  const statCards = useMemo<DashboardStat[]>(() => [
    {
      label: copy.totalUsers,
      value: overview?.totalUsers ?? 0,
      change: copy.thisMonth(overview?.usersAddedThisMonth ?? 0),
      tone: 'violet',
    },
    {
      label: copy.totalOrganizers,
      value: overview?.totalOrganizers ?? 0,
      change: copy.thisMonth(overview?.organizersAddedThisMonth ?? 0),
      tone: 'cyan',
    },
    {
      label: copy.pendingOrganizerApplications,
      value: overview?.pendingOrganizerApplications ?? 0,
      change: copy.waitingForReview,
      tone: 'amber',
    },
    {
      label: copy.publishedPendingEvents,
      value: `${overview?.publishedEvents ?? 0} / ${overview?.pendingEvents ?? 0}`,
      change: copy.newThisMonth(overview?.eventsAddedThisMonth ?? 0),
      tone: 'emerald',
    },
    {
      label: copy.collectedRevenue,
      value: formatCurrency(overview?.collectedRevenue ?? 0),
      change: `${copy.outstandingBalance}: ${formatCurrency(overview?.outstandingBalance ?? 0)}`,
      tone: 'rose',
    },
  ], [copy, overview]);

  const monthlyGrowth = overview?.monthlyGrowth || [];
  const rawMaxChartValue = Math.max(1, ...monthlyGrowth.flatMap((item) => [item.users, item.organizers, item.events]));
  const chartMaxValue = Math.max(4, Math.ceil(rawMaxChartValue / 4) * 4);
  const chartTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(chartMaxValue * ratio));

  const getChartPoints = (values: number[]) => {
    return values.map((value, index) => {
      const x = values.length === 1
        ? chartFrame.left + chartPlotWidth / 2
        : chartFrame.left + (index / (values.length - 1)) * chartPlotWidth;
      const normalizedValue = Math.max(0, value) / chartMaxValue;
      const y = chartFrame.top + (1 - normalizedValue) * chartPlotHeight;
      return { x, y };
    });
  };

  const buildSmoothPath = (values: number[]) => {
    const points = getChartPoints(values);
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    return points.slice(1).reduce((path, point, index) => {
      const previous = points[index];
      const midpointX = (previous.x + point.x) / 2;
      return `${path} C ${midpointX} ${previous.y}, ${midpointX} ${point.y}, ${point.x} ${point.y}`;
    }, `M ${points[0].x} ${points[0].y}`);
  };

  const chartSeries = [
    {
      key: 'users',
      label: copy.users,
      values: monthlyGrowth.map((item) => item.users),
      lineClass: 'role-chart-primary',
      dotClass: 'admin-chart-dot-users',
    },
    {
      key: 'organizers',
      label: copy.organizers,
      values: monthlyGrowth.map((item) => item.organizers),
      lineClass: 'role-chart-secondary',
      dotClass: 'admin-chart-dot-organizers',
    },
    {
      key: 'events',
      label: copy.events,
      values: monthlyGrowth.map((item) => item.events),
      lineClass: 'role-chart-tertiary',
      dotClass: 'admin-chart-dot-events',
    },
  ];

  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);
  const activeChartItem = activeChartIndex !== null ? monthlyGrowth[activeChartIndex] : null;
  const activeChartPoint = activeChartIndex !== null
    ? getChartPoints(monthlyGrowth.map((item) => item.users))[activeChartIndex]
    : null;
  const activeTooltipLeft = activeChartPoint
    ? Math.min(88, Math.max(12, (activeChartPoint.x / chartFrame.width) * 100))
    : 50;

  const displayedRequests = requestView === 'pending' ? requests : archivedRequests;
  const displayedEvents = moderationView === 'pending' ? events : archivedEvents;

  const formatDateTime = (value?: string) => {
    if (!value) return language === 'ru' ? 'Неизвестно' : language === 'kk' ? 'Белгісіз' : 'Unknown';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const syncSelectedUser = (nextUser: any) => {
    if (!nextUser) return;
    setSelectedUser((current: any) => current?.id === nextUser.id ? nextUser : current);
  };

  return (
    <div className="developer-admin-panel role-view min-h-screen bg-[#090a10]">
      <style>{compactUserDetailsCss}</style>
      <div className="admin-dashboard-wrap">
        <header className="role-admin-nav admin-panel-header mx-auto max-w-7xl">
          <div className="admin-header-grid">
            <div className="admin-header-copy">
              <div className="admin-breadcrumb-row">
                <span>Admin Console</span>
                <span>Developer Admin</span>
              </div>
              <h1>Developer Admin Panel</h1>
              <p>{copy.overview}</p>
            </div>
            <div className="admin-header-actions">
              <span className="admin-status-pill admin-status-pill-primary">
                <ShieldCheck aria-hidden="true" />
                Developer Admin
              </span>
              <span className="admin-status-pill">
                <Clock aria-hidden="true" />
                {overview?.pendingOrganizerApplications ?? 0} {copy.pending}
              </span>
            </div>
          </div>

          <nav className="admin-tabs" aria-label="Admin panel sections">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`admin-tab ${isActive ? 'admin-tab-active' : 'admin-tab-muted'}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        <main className="admin-main mx-auto min-w-0 max-w-7xl">
          {activeTab === 'dashboard' && (
            <div className="admin-dashboard-stack">
              <section className="admin-kpi-grid" aria-label="Admin key metrics">
                {statCards.map((card) => (
                  <article key={card.label} className={`admin-stat-card admin-stat-${card.tone}`}>
                    <div className="admin-card-topline">
                      <span className="admin-stat-title">{card.label}</span>
                    </div>
                    <div className="admin-stat-value">{card.value}</div>
                    <div className="admin-stat-change">{card.change}</div>
                  </article>
                ))}
              </section>

              <section className="admin-dashboard-grid">
                <article className="admin-surface admin-chart-panel">
                  <div className="admin-section-heading">
                    <div>
                      <span className="admin-section-kicker">{copy.growth}</span>
                      <h2>{copy.growthTitle}</h2>
                      <p>{copy.growthDesc}</p>
                    </div>
                    <div className="admin-chart-legend">
                      {chartSeries.map((series) => (
                        <span key={series.key} className={`admin-legend admin-legend-${series.key}`}>
                          <span aria-hidden="true" />
                          {series.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="role-chart admin-chart">
                    <div className="admin-chart-canvas">
                      <svg
                        viewBox={`0 0 ${chartFrame.width} ${chartFrame.height}`}
                        className="admin-chart-svg"
                        role="img"
                        aria-label={copy.growthTitle}
                        onMouseLeave={() => setActiveChartIndex(null)}
                      >
                        <defs>
                          <linearGradient id="adminChartUsersGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#D8B4FE" stopOpacity="1" />
                          </linearGradient>
                          <linearGradient id="adminChartOrganizersGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.68" />
                            <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.95" />
                          </linearGradient>
                          <linearGradient id="adminChartEventsGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.68" />
                            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.95" />
                          </linearGradient>
                        </defs>

                        {chartTicks.map((tick) => {
                          const y = chartFrame.top + (1 - tick / chartMaxValue) * chartPlotHeight;
                          return (
                            <g key={tick}>
                              <line className="role-chart-grid" x1={chartFrame.left} y1={y} x2={chartFrame.width - chartFrame.right} y2={y} />
                              <text className="admin-chart-axis-label" x={chartFrame.left - 16} y={y + 4} textAnchor="end">
                                {tick}
                              </text>
                            </g>
                          );
                        })}

                        <line className="admin-chart-axis" x1={chartFrame.left} y1={chartFrame.top} x2={chartFrame.left} y2={chartFrame.height - chartFrame.bottom} />
                        <line className="admin-chart-axis" x1={chartFrame.left} y1={chartFrame.height - chartFrame.bottom} x2={chartFrame.width - chartFrame.right} y2={chartFrame.height - chartFrame.bottom} />

                        {chartSeries.map((series) => (
                          <path
                            key={series.key}
                            className={series.lineClass}
                            d={buildSmoothPath(series.values)}
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                          />
                        ))}

                        {chartSeries.map((series) => (
                          <g key={`${series.key}-points`}>
                            {getChartPoints(series.values).map((point, index) => (
                              <circle
                                key={`${series.key}-${monthlyGrowth[index]?.label || index}`}
                                className={`admin-chart-dot ${series.dotClass} ${activeChartIndex === index ? 'admin-chart-dot-active' : ''}`}
                                cx={point.x}
                                cy={point.y}
                                r={activeChartIndex === index ? 4 : 2.75}
                              />
                            ))}
                          </g>
                        ))}

                        {monthlyGrowth.map((item, index) => {
                          const point = getChartPoints(monthlyGrowth.map((entry) => entry.users))[index];
                          const band = monthlyGrowth.length <= 1 ? chartPlotWidth : chartPlotWidth / (monthlyGrowth.length - 1);
                          const x = Math.max(chartFrame.left, (point?.x ?? chartFrame.left) - band / 2);
                          const width = monthlyGrowth.length <= 1 ? chartPlotWidth : Math.min(band, chartFrame.width - chartFrame.right - x);
                          return (
                            <rect
                              key={`hover-${item.label}`}
                              className="admin-chart-hover-zone"
                              x={x}
                              y={chartFrame.top}
                              width={width}
                              height={chartPlotHeight}
                              onMouseEnter={() => setActiveChartIndex(index)}
                              onFocus={() => setActiveChartIndex(index)}
                              tabIndex={0}
                            />
                          );
                        })}

                        {monthlyGrowth.map((item, index) => {
                          const point = getChartPoints(monthlyGrowth.map((entry) => entry.users))[index];
                          return (
                            <text key={`label-${item.label}`} className="admin-chart-x-label" x={point?.x ?? chartFrame.left} y={chartFrame.height - 15} textAnchor="middle">
                              {item.label}
                            </text>
                          );
                        })}
                      </svg>

                      {activeChartItem && (
                        <div className="admin-chart-tooltip" style={{ left: `${activeTooltipLeft}%` }}>
                          <strong>{activeChartItem.label}</strong>
                          <span>{copy.users}: {activeChartItem.users}</span>
                          <span>{copy.organizers}: {activeChartItem.organizers}</span>
                          <span>{copy.events}: {activeChartItem.events}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>

                <aside className="admin-surface admin-insights-panel">
                  <div className="admin-section-heading admin-section-heading-compact">
                    <div>
                      <span className="admin-section-kicker">{copy.thisMonthTitle}</span>
                      <h2>{copy.freshActivity}</h2>
                    </div>
                    <Activity aria-hidden="true" />
                  </div>

                  <div className="admin-insight-list">
                    <div className="admin-metric-row">
                      <span>{copy.newUsers}</span>
                      <strong>+{overview?.usersAddedThisMonth ?? 0}</strong>
                    </div>
                    <div className="admin-metric-row">
                      <span>{copy.newOrganizers}</span>
                      <strong>+{overview?.organizersAddedThisMonth ?? 0}</strong>
                    </div>
                    <div className="admin-metric-row">
                      <span>{copy.newEvents}</span>
                      <strong>+{overview?.eventsAddedThisMonth ?? 0}</strong>
                    </div>
                    <div className="admin-metric-row">
                      <span>{copy.activeReservations}</span>
                      <strong>{overview?.activeReservations ?? 0}</strong>
                    </div>
                  </div>

                  <div className="admin-review-summary">
                    <div>
                      <span>{copy.pending}</span>
                      <strong>{(overview?.pendingOrganizerApplications ?? 0) + (overview?.pendingEvents ?? 0)}</strong>
                    </div>
                    <p>{copy.waitingForReview}</p>
                  </div>
                </aside>
              </section>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="admin-section-shell">
              <div className="admin-section-heading">
                <div>
                  <span className="admin-section-kicker">{copy.adminPanel}</span>
                  <h2>{copy.requests}</h2>
                  <p>{copy.requestsDesc}</p>
                </div>
                <div className="admin-segmented">
                  <button type="button" onClick={() => setRequestView('pending')} className={requestView === 'pending' ? 'admin-segment-active' : ''}>{copy.pending}</button>
                  <button type="button" onClick={() => setRequestView('archive')} className={requestView === 'archive' ? 'admin-segment-active' : ''}>{copy.archive}</button>
                </div>
              </div>

              <div className="admin-list-stack">
                {displayedRequests.length === 0 ? (
                  <div className="admin-empty-state">
                    {requestView === 'pending' ? copy.noPendingRequests : copy.archiveEmpty}
                  </div>
                ) : displayedRequests.map((request) => (
                  <article key={request.id} className="admin-list-row">
                    <div className="admin-row-header">
                      <div className="admin-row-title">
                        <h3>{request.fullName}</h3>
                        <p>{request.email}</p>
                        {request.organizationName && <span>{request.organizationName}</span>}
                      </div>
                      <span className={`admin-state-badge ${request.organizerStatus === 'rejected' ? 'admin-state-muted' : 'admin-state-warning'}`}>
                        {displayStatus(request.organizerStatus)}
                      </span>
                    </div>

                    <div className="admin-info-grid">
                      <div><span>{copy.contactEmail}</span><strong>{request.contactEmail || request.email}</strong></div>
                      <div><span>{copy.phone}</span><strong>{request.phone || copy.notProvided}</strong></div>
                    </div>

                    {request.description && (
                      <div className="admin-description-box">
                        <span>{copy.description}</span>
                        <p>{request.description}</p>
                      </div>
                    )}

                    <div className="admin-row-actions">
                      <button onClick={() => onApproveRequest(request.id)} className="role-action-success">{copy.approve}</button>
                      {request.organizerStatus !== 'rejected' && (
                        <button onClick={() => onRejectRequest(request.id)} className="role-action-danger">{copy.reject}</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-section-shell">
              <div className="admin-section-heading">
                <div>
                  <span className="admin-section-kicker">{copy.adminPanel}</span>
                  <h2>{copy.userManagement}</h2>
                  <p>{copy.usersDesc}</p>
                </div>
              </div>

              <div className="admin-search-wrap">
                <Search aria-hidden="true" />
                <input
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    onSearchUsers(value);
                  }}
                  placeholder={copy.searchPlaceholder}
                  className="admin-input"
                />
              </div>

              <div className="admin-users-grid">
                <div className="admin-list-stack">
                  {users.map((item) => (
                    <article key={item.id} className="admin-list-row">
                      <div className="admin-row-header">
                        <div className="admin-row-title">
                          <h3>{item.fullName}</h3>
                          <p>{item.email}</p>
                          <span>{copy.createdAt}: {formatDateTime(item.createdAt)}</span>
                        </div>
                        <div className="admin-badge-row">
                          <span className="admin-state-badge admin-state-purple">{displayRole(item.role)}</span>
                          <span className={`admin-state-badge ${item.accountStatus === 'blocked' ? 'admin-state-danger' : 'admin-state-success'}`}>
                            {displayStatus(item.accountStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="admin-row-actions">
                        <button
                          onClick={() => setSelectedUser(item)}
                          className="role-action-neutral"
                        >
                          {copy.view}
                        </button>
                        {(item.role === 'organizer' || item.organizerStatus === 'approved') && item.organizerAccessStatus !== 'deactivated' && (
                          <button
                            onClick={() => onDeactivateOrganizer(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="role-action-warning"
                          >
                            {copy.deactivate}
                          </button>
                        )}
                        {(item.role === 'organizer' || item.organizerStatus === 'approved') && item.organizerAccessStatus === 'deactivated' && (
                          <button
                            onClick={() => onActivateOrganizer(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="role-action-success"
                          >
                            {copy.activate}
                          </button>
                        )}
                        {item.accountStatus === 'blocked' ? (
                          <button
                            onClick={() => onUnblockUser(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="role-action-success"
                          >
                            {copy.unblock}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBlockTarget(item);
                              setBlockReason('Fraud');
                            }}
                            className="role-action-danger"
                          >
                            {copy.block}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                <aside className="admin-side-panel admin-side-panel-compact max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain custom-scrollbar">
                  <h2>{copy.userDetails}</h2>
                  {selectedUser ? (
                    <div className="admin-detail-list admin-detail-list-compact">
                      <div><span>{copy.fullName}</span><strong>{selectedUser.fullName}</strong></div>
                      <div><span>{copy.email}</span><strong>{selectedUser.email}</strong></div>
                      <div><span>{copy.role}</span><strong>{displayRole(selectedUser.role)}</strong></div>
                      <div><span>{copy.organizerStatus}</span><strong>{displayStatus(selectedUser.organizerStatus)}</strong></div>
                      <div><span>{copy.organizerAccess}</span><strong>{displayStatus(selectedUser.organizerAccessStatus || 'active')}</strong></div>
                      <div><span>{copy.accountStatus}</span><strong>{displayStatus(selectedUser.accountStatus)}</strong></div>
                      <div><span>{copy.createdAt}</span><strong>{formatDateTime(selectedUser.createdAt)}</strong></div>
                      {selectedUser.blockedReason && (
                        <div><span>{copy.blockedReason}</span><strong>{selectedUser.blockedReason}</strong></div>
                      )}
                    </div>
                  ) : (
                    <p>{copy.chooseUser}</p>
                  )}
                </aside>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="admin-section-shell">
              <div className="admin-section-heading">
                <div>
                  <span className="admin-section-kicker">{copy.adminPanel}</span>
                  <h2>{copy.eventModeration}</h2>
                  <p>{copy.moderationDesc}</p>
                </div>
                <div className="admin-segmented">
                  <button type="button" onClick={() => setModerationView('pending')} className={moderationView === 'pending' ? 'admin-segment-active' : ''}>{copy.pending}</button>
                  <button type="button" onClick={() => setModerationView('archive')} className={moderationView === 'archive' ? 'admin-segment-active' : ''}>{copy.archive}</button>
                </div>
              </div>

              <div className="admin-list-stack">
                  {displayedEvents.length === 0 ? (
                    <div className="admin-empty-state">
                      {moderationView === 'pending' ? copy.noPendingEvents : copy.archiveEmpty}
                    </div>
                  ) : displayedEvents.map((event) => (
                    <article key={event.id} className="admin-list-row role-moderation-item">
                      <div className="admin-row-header">
                        <div className="admin-row-title">
                          <h3>{event.title}</h3>
                          <p>{event.city} | {event.category} | {event.date}</p>
                          <span>{copy.submittedBy}: {event.submittedBy}</span>
                        </div>
                        <span className="admin-state-badge admin-state-muted">{displayStatus(event.status)}</span>
                      </div>

                      <div className="admin-row-actions">
                        <button onClick={() => onViewEvent(event)} className="role-action-neutral">{copy.viewDetails}</button>
                        <button onClick={() => onApproveEvent(event.id)} className="role-action-success">{copy.approve}</button>
                        {moderationView !== 'archive' && (
                          <button onClick={() => onRejectEvent(event.id)} className="role-action-danger">{copy.reject}</button>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {blockTarget && (
        <div className="admin-modal-backdrop fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="admin-modal">
            <h3>{copy.blockUser}</h3>
            <p>{copy.blockReasonPrompt} <span>{blockTarget.fullName}</span>.</p>

            <div className="admin-reason-list">
              {(['Fraud', 'Spam', 'Fake event', 'Abuse'] as BlockReason[]).map((reason) => (
                <button
                  key={reason}
                  onClick={() => setBlockReason(reason)}
                  className={`admin-reason-option ${
                    blockReason === reason
                      ? 'admin-reason-option-active'
                      : ''
                  }`}
                >
                  {copy.reasons[reason]}
                </button>
              ))}
            </div>

            <div className="admin-modal-actions">
              <button
                onClick={() => setBlockTarget(null)}
                className="role-action-neutral"
              >
                {copy.cancel}
              </button>
              <button
                onClick={() => onBlockUser(blockTarget.id, blockReason).then((data) => {
                  syncSelectedUser(data?.user);
                  setBlockTarget(null);
                }).catch((error) => {
                  console.error('Failed to block user', error);
                })}
                className="role-action-danger"
              >
                {copy.block}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
