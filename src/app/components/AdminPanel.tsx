import React, { useMemo, useState } from 'react';
import { Shield, Users, UserCheck, ClipboardList, Search, Mail, Calendar, Eye, CheckCircle2, XCircle, FileText, TrendingUp, Ban, RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n';

type AdminTab = 'dashboard' | 'requests' | 'users' | 'moderation';
type BlockReason = 'Fraud' | 'Spam' | 'Fake event' | 'Abuse';

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
    { id: 'dashboard', label: copy.adminPanel, icon: Shield },
    { id: 'requests', label: copy.requests, icon: ClipboardList },
    { id: 'users', label: copy.userManagement, icon: Users },
    { id: 'moderation', label: copy.eventModeration, icon: FileText },
  ] as const;

  const statCards = useMemo(() => [
    {
      label: copy.totalUsers,
      value: overview?.totalUsers ?? 0,
      change: copy.thisMonth(overview?.usersAddedThisMonth ?? 0),
      icon: Users,
    },
    {
      label: copy.totalOrganizers,
      value: overview?.totalOrganizers ?? 0,
      change: copy.thisMonth(overview?.organizersAddedThisMonth ?? 0),
      icon: UserCheck,
    },
    {
      label: copy.pendingOrganizerApplications,
      value: overview?.pendingOrganizerApplications ?? 0,
      change: copy.waitingForReview,
      icon: ClipboardList,
    },
    {
      label: copy.publishedPendingEvents,
      value: `${overview?.publishedEvents ?? 0} / ${overview?.pendingEvents ?? 0}`,
      change: copy.newThisMonth(overview?.eventsAddedThisMonth ?? 0),
      icon: Calendar,
    },
  ], [copy, overview]);

  const monthlyGrowth = overview?.monthlyGrowth || [];
  const maxChartValue = Math.max(1, ...monthlyGrowth.flatMap((item) => [item.users, item.organizers, item.events]));

  const buildLine = (values: number[]) => {
    if (!values.length) return '';
    return values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * 100;
        const y = 100 - (value / maxChartValue) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  };

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
    setSelectedUser((current: any) => current?.id === nextUser.id ? nextUser : current);
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="flex">
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 overflow-y-auto border-r border-purple-500/20 bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-8">
          <div className="border-b border-purple-500/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-600/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-purple-100">{copy.developerPanel}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="ml-72 flex-1 p-8 pb-16">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">{copy.adminPanel}</h1>
                <p className="text-gray-400">{copy.overview}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="rounded-xl bg-purple-600/15 p-3">
                          <Icon className="h-6 w-6 text-purple-400" />
                        </div>
                      </div>
                      <p className="mb-2 text-sm text-gray-400">{card.label}</p>
                      <p className="text-3xl font-bold text-white">{card.value}</p>
                      <p className="mt-2 text-sm text-gray-500">{card.change}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-purple-300">{copy.growth}</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">{copy.growthTitle}</h2>
                      <p className="mt-2 text-sm text-gray-400">{copy.growthDesc}</p>
                    </div>
                    <div className="rounded-2xl border border-purple-500/20 bg-purple-600/10 p-3">
                      <TrendingUp className="h-6 w-6 text-purple-300" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                    <div className="mb-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300"><span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400" />{copy.users}</div>
                      <div className="flex items-center gap-2 text-gray-300"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />{copy.organizers}</div>
                      <div className="flex items-center gap-2 text-gray-300"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />{copy.events}</div>
                    </div>
                    <div className="h-72">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                        {[20, 40, 60, 80].map((line) => (
                          <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 3" />
                        ))}
                        <polyline fill="none" stroke="#E879F9" strokeWidth="2.4" points={buildLine(monthlyGrowth.map((item) => item.users))} />
                        <polyline fill="none" stroke="#22D3EE" strokeWidth="2.4" points={buildLine(monthlyGrowth.map((item) => item.organizers))} />
                        <polyline fill="none" stroke="#FBBF24" strokeWidth="2.4" points={buildLine(monthlyGrowth.map((item) => item.events))} />
                      </svg>
                    </div>
                    <div className="mt-4 grid grid-cols-6 gap-2 text-center text-xs text-gray-500">
                      {monthlyGrowth.map((item) => (
                        <div key={item.label}>{item.label}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-gray-950 to-black p-6">
                    <p className="text-sm uppercase tracking-[0.25em] text-purple-300">{copy.thisMonthTitle}</p>
                    <h3 className="mt-3 text-2xl font-bold text-white">{copy.freshActivity}</h3>
                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-gray-400">{copy.newUsers}</p><p className="mt-1 text-3xl font-bold text-white">+{overview?.usersAddedThisMonth ?? 0}</p></div>
                      <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-gray-400">{copy.newOrganizers}</p><p className="mt-1 text-3xl font-bold text-white">+{overview?.organizersAddedThisMonth ?? 0}</p></div>
                      <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-gray-400">{copy.newEvents}</p><p className="mt-1 text-3xl font-bold text-white">+{overview?.eventsAddedThisMonth ?? 0}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">{copy.requests}</h1>
                <p className="text-gray-400">{copy.requestsDesc}</p>
              </div>

              <div className="inline-flex rounded-2xl border border-purple-500/20 bg-gray-900/70 p-1">
                <button onClick={() => setRequestView('pending')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${requestView === 'pending' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{copy.pending}</button>
                <button onClick={() => setRequestView('archive')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${requestView === 'archive' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{copy.archive}</button>
              </div>

              <div className="space-y-4">
                {displayedRequests.length === 0 ? (
                  <div className="rounded-2xl border border-purple-500/20 bg-gray-900 p-8 text-gray-400">
                    {requestView === 'pending' ? copy.noPendingRequests : copy.archiveEmpty}
                  </div>
                ) : displayedRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-purple-500/20 bg-gray-900 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{request.fullName}</p>
                        <p className="text-gray-400">{request.email}</p>
                        {request.organizationName && <p className="mt-2 text-purple-300">{request.organizationName}</p>}
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-sm font-medium ${request.organizerStatus === 'rejected' ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-yellow-500/20 bg-yellow-500/15 text-yellow-300'}`}>
                        {displayStatus(request.organizerStatus)}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                      <div className="rounded-xl bg-gray-800/40 p-4"><p className="mb-1 text-gray-500">{copy.contactEmail}</p><p className="break-all text-white">{request.contactEmail || request.email}</p></div>
                      <div className="rounded-xl bg-gray-800/40 p-4"><p className="mb-1 text-gray-500">{copy.phone}</p><p className="text-white">{request.phone || copy.notProvided}</p></div>
                    </div>

                    {request.description && (
                      <div className="mt-4 rounded-xl bg-gray-800/30 p-4">
                        <p className="mb-2 text-sm text-gray-500">{copy.description}</p>
                        <p className="leading-relaxed text-gray-300">{request.description}</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={() => onApproveRequest(request.id)} className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"><CheckCircle2 className="h-4 w-4" />{copy.approve}</button>
                      {request.organizerStatus !== 'rejected' && (
                        <button onClick={() => onRejectRequest(request.id)} className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 text-red-300 transition-colors hover:bg-red-600/25"><XCircle className="h-4 w-4" />{copy.reject}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">{copy.userManagement}</h1>
                <p className="text-gray-400">{copy.usersDesc}</p>
              </div>

              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    onSearchUsers(value);
                  }}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-10 pr-4 text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  {users.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-purple-500/20 bg-gray-900 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-white">{item.fullName}</p>
                          <p className="mt-1 flex items-center gap-2 text-gray-400"><Mail className="h-4 w-4" />{item.email}</p>
                          <p className="mt-2 text-sm text-gray-500">{copy.createdAt}: {formatDateTime(item.createdAt)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-purple-500/20 bg-purple-600/15 px-3 py-1 text-sm text-purple-300">{displayRole(item.role)}</span>
                          <span className={`rounded-full border px-3 py-1 text-sm ${item.accountStatus === 'blocked' ? 'border-red-500/20 bg-red-500/15 text-red-300' : 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300'}`}>
                            {displayStatus(item.accountStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedUser(item)}
                          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                          {copy.view}
                        </button>
                        {(item.role === 'organizer' || item.organizerStatus === 'approved') && item.organizerAccessStatus !== 'deactivated' && (
                          <button
                            onClick={() => onDeactivateOrganizer(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="flex items-center gap-2 rounded-xl bg-amber-600/15 px-4 py-2 text-amber-300 transition-colors hover:bg-amber-600/25"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {copy.deactivate}
                          </button>
                        )}
                        {(item.role === 'organizer' || item.organizerStatus === 'approved') && item.organizerAccessStatus === 'deactivated' && (
                          <button
                            onClick={() => onActivateOrganizer(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {copy.activate}
                          </button>
                        )}
                        {item.accountStatus === 'blocked' ? (
                          <button
                            onClick={() => onUnblockUser(item.id).then((data) => syncSelectedUser(data.user)).catch(() => {})}
                            className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {copy.unblock}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBlockTarget(item);
                              setBlockReason('Fraud');
                            }}
                            className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 text-red-300 transition-colors hover:bg-red-600/25"
                          >
                            <Ban className="h-4 w-4" />
                            {copy.block}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky top-8 h-fit rounded-2xl border border-purple-500/20 bg-gray-900 p-6">
                  <h2 className="mb-4 text-xl font-bold text-white">{copy.userDetails}</h2>
                  {selectedUser ? (
                    <div className="space-y-4">
                      <div><p className="text-sm text-gray-400">{copy.fullName}</p><p className="font-semibold text-white">{selectedUser.fullName}</p></div>
                      <div><p className="text-sm text-gray-400">{copy.email}</p><p className="text-white">{selectedUser.email}</p></div>
                      <div><p className="text-sm text-gray-400">{copy.role}</p><p className="text-white">{displayRole(selectedUser.role)}</p></div>
                      <div><p className="text-sm text-gray-400">{copy.organizerStatus}</p><p className="text-white">{displayStatus(selectedUser.organizerStatus)}</p></div>
                      <div><p className="text-sm text-gray-400">{copy.organizerAccess}</p><p className="text-white">{displayStatus(selectedUser.organizerAccessStatus || 'active')}</p></div>
                      <div><p className="text-sm text-gray-400">{copy.accountStatus}</p><p className="text-white">{displayStatus(selectedUser.accountStatus)}</p></div>
                      <div><p className="text-sm text-gray-400">{copy.createdAt}</p><p className="text-white">{formatDateTime(selectedUser.createdAt)}</p></div>
                      {selectedUser.blockedReason && (
                        <div><p className="text-sm text-gray-400">{copy.blockedReason}</p><p className="text-white">{selectedUser.blockedReason}</p></div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">{copy.chooseUser}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">{copy.eventModeration}</h1>
                <p className="text-gray-400">{copy.moderationDesc}</p>
              </div>

              <div className="inline-flex rounded-2xl border border-purple-500/20 bg-gray-900/70 p-1">
                <button onClick={() => setModerationView('pending')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${moderationView === 'pending' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{copy.pending}</button>
                <button onClick={() => setModerationView('archive')} className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${moderationView === 'archive' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{copy.archive}</button>
              </div>

              <div className="grid gap-6">
                <div className="space-y-4">
                  {displayedEvents.length === 0 ? (
                    <div className="rounded-2xl border border-purple-500/20 bg-gray-900 p-8 text-gray-400">
                      {moderationView === 'pending' ? copy.noPendingEvents : copy.archiveEmpty}
                    </div>
                  ) : displayedEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-purple-500/20 bg-gray-900 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{event.title}</p>
                          <p className="text-gray-400">{event.city} • {event.category} • {event.date}</p>
                          <p className="mt-2 text-sm text-gray-500">{copy.submittedBy}: {event.submittedBy}</p>
                        </div>
                        <span className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-300">{displayStatus(event.status)}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button onClick={() => onViewEvent(event)} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"><Eye className="h-4 w-4" />{copy.viewDetails}</button>
                        <button onClick={() => onApproveEvent(event.id)} className="flex items-center gap-2 rounded-xl bg-green-600/15 px-4 py-2 text-green-300 transition-colors hover:bg-green-600/25"><CheckCircle2 className="h-4 w-4" />{copy.approve}</button>
                        {moderationView !== 'archive' && (
                          <button onClick={() => onRejectEvent(event.id)} className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 text-red-300 transition-colors hover:bg-red-600/25"><XCircle className="h-4 w-4" />{copy.reject}</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {blockTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-red-900/20">
            <h3 className="text-2xl font-bold text-white">{copy.blockUser}</h3>
            <p className="mt-2 text-gray-400">{copy.blockReasonPrompt} <span className="text-white">{blockTarget.fullName}</span>.</p>

            <div className="mt-5 space-y-3">
              {(['Fraud', 'Spam', 'Fake event', 'Abuse'] as BlockReason[]).map((reason) => (
                <button
                  key={reason}
                  onClick={() => setBlockReason(reason)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    blockReason === reason
                      ? 'border-red-500/30 bg-red-500/15 text-white'
                      : 'border-gray-700 bg-gray-900/70 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {copy.reasons[reason]}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBlockTarget(null)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
              >
                {copy.cancel}
              </button>
              <button
                onClick={() => onBlockUser(blockTarget.id, blockReason).then((data) => {
                  syncSelectedUser(data.user);
                  setBlockTarget(null);
                }).catch(() => {})}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-500"
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
