import React from 'react';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../i18n';

interface OrganizerEvent {
  id: string;
  title?: string;
  name?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  status: string;
  soldTickets?: number;
}

interface OrganizerDashboardProps {
  onCreateEvent: () => void;
  events?: OrganizerEvent[];
  canCreateEvent?: boolean;
}

const formatEventDate = (dateString: string | undefined, locale: string, fallback: string) => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};

const parseEventTime = (event: OrganizerEvent) => {
  if (!event.date) return Number.POSITIVE_INFINITY;
  const date = new Date(`${event.date}T${event.time || '23:59:59'}`);
  if (!Number.isNaN(date.getTime())) return date.getTime();
  const fallback = new Date(event.date);
  return Number.isNaN(fallback.getTime()) ? Number.POSITIVE_INFINITY : fallback.getTime();
};

const getEventTitle = (event: OrganizerEvent, fallback: string) => event.title || event.name || fallback;

const formatStatus = (status: string) =>
  status
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  onCreateEvent,
  events = [],
  canCreateEvent = true,
}) => {
  const { language } = useI18n();
  const locale = language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';
  const tr = (en: string, ru: string, kk: string) => (language === 'ru' ? ru : language === 'kk' ? kk : en);

  const copy = {
    title: tr('Organizer Dashboard', 'Панель организатора', 'Ұйымдастырушы панелі'),
    eyebrow: tr('Control center', 'Центр управления', 'Басқару орталығы'),
    subtitle: tr(
      'A clear overview of what is live, what needs review, and where to continue work.',
      'Короткий обзор: что опубликовано, что ждёт проверки и где продолжить работу.',
      'Не жарияланғанын, не тексеруде екенін және қай жерде жалғастыру керегін көрсетеді.'
    ),
    createEvent: tr('Create Event', 'Создать событие', 'Іс-шара құру'),
    accessDisabled: tr(
      'Organizer access is deactivated. Creating new events and sending new requests for moderation are disabled.',
      'Доступ организатора деактивирован. Создание новых событий и отправка на модерацию отключены.',
      'Ұйымдастырушы рұқсаты өшірілген. Жаңа іс-шара құру және модерацияға жіберу бұғатталған.'
    ),
    dateNotSet: tr('Date not set', 'Дата не указана', 'Күні көрсетілмеген'),
    untitledEvent: tr('Untitled event', 'Событие без названия', 'Атаусыз іс-шара'),
    locationNotSet: tr('Location not set', 'Локация не указана', 'Орын көрсетілмеген'),
    totalEvents: tr('Total Events', 'Всего событий', 'Барлық іс-шара'),
    pendingReview: tr('Pending Review', 'На проверке', 'Қаралуда'),
    published: tr('Published', 'Опубликовано', 'Жарияланған'),
    drafts: tr('Drafts', 'Черновики', 'Черновиктер'),
    ticketsSold: tr('Tickets Sold', 'Билетов продано', 'Сатылған билеттер'),
    eventsList: tr('Events list', 'Список событий', 'Іс-шаралар тізімі'),
    noEventsYet: tr('No events yet', 'Событий пока нет', 'Әзірге іс-шара жоқ'),
    noEventsDesc: tr(
      'Create your first event to see it here with its current status.',
      'Создайте первое событие, и оно появится здесь со своим статусом.',
      'Алғашқы іс-шараны құрсаңыз, оның статусы осы жерде көрінеді.'
    ),
    createFirstEvent: tr('Create first event', 'Создать первое событие', 'Алғашқы іс-шараны құру'),
    focusTitle: tr('What needs attention', 'Что требует внимания', 'Неге назар аудару керек'),
    reviewStatus: tr('Review status', 'Статус проверки', 'Тексеру статусы'),
    noModeration: tr('Nothing is waiting for moderation.', 'Ничего не ждёт модерации.', 'Модерация күтіп тұрған ештеңе жоқ.'),
    upcomingEvents: tr('Upcoming events', 'Предстоящие события', 'Алдағы іс-шаралар'),
    noUpcoming: tr('No published upcoming events yet.', 'Пока нет опубликованных предстоящих событий.', 'Әзірге жарияланған алдағы іс-шара жоқ.'),
    draftEvents: tr('Draft events', 'Черновики событий', 'Іс-шара черновиктері'),
    noDrafts: tr('No drafts saved right now.', 'Сейчас нет сохранённых черновиков.', 'Қазір сақталған черновик жоқ.'),
    quickStart: tr('Quick start', 'Быстрый старт', 'Жылдам бастау'),
    launchChecklist: tr('Launch checklist', 'Чеклист запуска', 'Іске қосу чеклисті'),
    checklist: [
      tr('Create an event draft', 'Создайте черновик события', 'Іс-шара черновигін жасаңыз'),
      tr('Add date, venue, poster, and tickets', 'Добавьте дату, место, постер и билеты', 'Күнін, орнын, постерін және билеттерін қосыңыз'),
      tr('Send it to moderation', 'Отправьте на модерацию', 'Модерацияға жіберіңіз'),
      tr('Track sales in Orders and Analytics', 'Следите за продажами в заказах и аналитике', 'Сатылымды тапсырыстар мен аналитикадан бақылаңыз'),
    ],
    startNewEvent: tr('Start a new event', 'Начать новое событие', 'Жаңа іс-шара бастау'),
    navigation: tr('Navigation', 'Навигация', 'Навигация'),
    whereToWork: tr('Where to work', 'Где что делать', 'Қай жерде жұмыс істеу керек'),
    eventsTab: tr('Events', 'События', 'Іс-шаралар'),
    eventsTabDesc: tr(
      'Open the full event list to view, edit, delete, or move events back to draft.',
      'Откройте полный список, чтобы смотреть, редактировать, удалять или возвращать события в черновик.',
      'Толық тізімнен көру, өңдеу, жою немесе черновикке қайтару мүмкін.'
    ),
    createTabDesc: tr(
      'Use this tab when you are ready to create a new event or submit it for review.',
      'Используйте эту вкладку, когда готовы создать событие или отправить его на проверку.',
      'Жаңа іс-шара құру немесе тексеруге жіберу үшін осы вкладканы пайдаланыңыз.'
    ),
    ordersAnalytics: tr('Orders & Analytics', 'Заказы и аналитика', 'Тапсырыстар және аналитика'),
    ordersAnalyticsDesc: tr(
      'Check sales, reservations, ticket counts, and performance after publishing.',
      'Проверяйте продажи, брони, билеты и результаты после публикации.',
      'Жарияланғаннан кейін сатылым, бронь, билет саны және нәтижелерді тексеріңіз.'
    ),
  };

  const publishedCount = events.filter((event) => event.status === 'published').length;
  const pendingCount = events.filter((event) => event.status === 'pending' || event.status === 'pending-update-review').length;
  const draftCount = events.filter((event) => event.status === 'draft').length;
  const totalSold = events.reduce((sum, event) => sum + (Number(event.soldTickets) || 0), 0);
  const upcomingEvents = events
    .filter((event) => event.status === 'published' && parseEventTime(event) >= Date.now())
    .sort((a, b) => parseEventTime(a) - parseEventTime(b));
  const draftEvents = events.filter((event) => event.status === 'draft');
  const reviewEvents = events.filter((event) => event.status === 'pending' || event.status === 'pending-update-review');
  const recentEvents = [...events].reverse().slice(0, 5);
  const nextUpcomingEvent = upcomingEvents[0];
  const nextDraftEvent = draftEvents[0];

  const metrics = [
    {
      title: copy.totalEvents,
      value: events.length,
      description: tr('All created events', 'Все созданные события', 'Барлық құрылған іс-шаралар'),
      icon: CalendarDays,
      tone: 'blue',
    },
    {
      title: copy.pendingReview,
      value: pendingCount,
      description: pendingCount
        ? tr('Admin review required', 'Требуется проверка администратора', 'Әкімші тексеруі қажет')
        : tr('No blocked launches', 'Нет заблокированных запусков', 'Бұғатталған іске қосулар жоқ'),
      icon: Clock3,
      tone: 'amber',
    },
    {
      title: copy.published,
      value: publishedCount,
      description: tr('Visible to attendees', 'Видно участникам', 'Қатысушыларға көрінеді'),
      icon: CheckCircle2,
      tone: 'green',
    },
    {
      title: copy.drafts,
      value: draftCount,
      description: tr('Saved but not submitted', 'Сохранены без отправки', 'Жіберілмей сақталған'),
      icon: FileText,
      tone: 'violet',
    },
    {
      title: copy.ticketsSold,
      value: totalSold,
      description: tr('Across organizer events', 'По событиям организатора', 'Ұйымдастырушы іс-шаралары бойынша'),
      icon: Activity,
      tone: 'cyan',
    },
  ];

  return (
    <div className="organizer-dashboard">
      <section className="organizer-hero">
        <div>
          <div className="organizer-eyebrow">
            <Sparkles aria-hidden="true" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onCreateEvent}
          disabled={!canCreateEvent}
          className="organizer-primary-button"
        >
          <Plus aria-hidden="true" />
          <span>{copy.createEvent}</span>
        </button>
      </section>

      {!canCreateEvent && <div className="organizer-alert">{copy.accessDisabled}</div>}

      <section className="organizer-metrics-grid" aria-label="Organizer metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.title} className={`organizer-metric-card tone-${metric.tone}`}>
              <div className="organizer-metric-top">
                <span>{metric.title}</span>
                <Icon aria-hidden="true" />
              </div>
              <strong>{metric.value}</strong>
              <p>{metric.description}</p>
            </article>
          );
        })}
      </section>

      <section className="organizer-content-grid">
        <article className="organizer-panel organizer-panel-large">
          <div className="organizer-panel-header">
            <div>
              <span className="organizer-section-label">Status</span>
              <h2>{copy.eventsList}</h2>
            </div>
            <span className="organizer-chip">{events.length} {copy.totalEvents.toLowerCase()}</span>
          </div>

          {recentEvents.length ? (
            <div className="organizer-event-table">
              {recentEvents.map((event) => (
                <div key={event.id} className="organizer-event-table-row">
                  <div>
                    <strong>{getEventTitle(event, copy.untitledEvent)}</strong>
                    <span>{[event.city, event.venue].filter(Boolean).join(' · ') || copy.locationNotSet}</span>
                  </div>
                  <span className={`organizer-status status-${event.status}`}>{formatStatus(event.status)}</span>
                  <span>{formatEventDate(event.date, locale, copy.dateNotSet)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="organizer-empty-state">
              <CalendarDays aria-hidden="true" />
              <h3>{copy.noEventsYet}</h3>
              <p>{copy.noEventsDesc}</p>
              <button type="button" onClick={onCreateEvent} disabled={!canCreateEvent} className="organizer-secondary-button">
                {copy.createFirstEvent}
              </button>
            </div>
          )}
        </article>

        <aside className="organizer-side-stack">
          <article className="organizer-panel organizer-operations-panel">
            <div className="organizer-panel-header">
              <div>
                <span className="organizer-section-label">Focus</span>
                <h2>{copy.focusTitle}</h2>
              </div>
            </div>
            <div className="organizer-task-list">
              <div className="organizer-task-row">
                <div>
                  <strong>{copy.reviewStatus}</strong>
                  <span>{reviewEvents.length ? tr('Open Events to review pending items.', 'Откройте события, чтобы проверить ожидающие элементы.', 'Күтудегі элементтерді көру үшін Іс-шараларды ашыңыз.') : copy.noModeration}</span>
                </div>
                <span>{pendingCount}</span>
              </div>
              <div className="organizer-task-row">
                <div>
                  <strong>{copy.upcomingEvents}</strong>
                  <span>{nextUpcomingEvent ? `${getEventTitle(nextUpcomingEvent, copy.untitledEvent)} · ${formatEventDate(nextUpcomingEvent.date, locale, copy.dateNotSet)}` : copy.noUpcoming}</span>
                </div>
                <span>{upcomingEvents.length}</span>
              </div>
              <div className="organizer-task-row">
                <div>
                  <strong>{copy.draftEvents}</strong>
                  <span>{nextDraftEvent ? `${getEventTitle(nextDraftEvent, copy.untitledEvent)} · ${formatEventDate(nextDraftEvent.date, locale, copy.dateNotSet)}` : copy.noDrafts}</span>
                </div>
                <span>{draftCount}</span>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section className="organizer-lower-grid">
        <article className="organizer-panel organizer-onboarding">
          <div className="organizer-panel-header">
            <div>
              <span className="organizer-section-label">{copy.quickStart}</span>
              <h2>{copy.launchChecklist}</h2>
            </div>
          </div>
          <div className="organizer-checklist">
            {copy.checklist.map((step, index) => (
              <div key={step} className="organizer-check-row">
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={onCreateEvent} disabled={!canCreateEvent} className="organizer-primary-button organizer-wide-button">
            <span>{copy.startNewEvent}</span>
            <ArrowRight aria-hidden="true" />
          </button>
        </article>

        <article className="organizer-panel organizer-guide-panel">
          <div className="organizer-panel-header">
            <div>
              <span className="organizer-section-label">{copy.navigation}</span>
              <h2>{copy.whereToWork}</h2>
            </div>
          </div>
          <div className="organizer-guide-list">
            <div>
              <strong>{copy.eventsTab}</strong>
              <span>{copy.eventsTabDesc}</span>
            </div>
            <div>
              <strong>{copy.createEvent}</strong>
              <span>{copy.createTabDesc}</span>
            </div>
            <div>
              <strong>{copy.ordersAnalytics}</strong>
              <span>{copy.ordersAnalyticsDesc}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};
