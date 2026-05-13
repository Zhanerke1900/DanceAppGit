import React from 'react';
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
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
  ticketLimit?: number;
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
  const copy = {
    en: {
      title: 'Organizer Dashboard',
      eyebrow: 'Control center',
      subtitle: 'Monitor event status, continue drafts, and move your next launch through review without hunting through tabs.',
      createEvent: 'Create Event',
      accessDisabled: 'Organizer access is deactivated. Creating new events and sending new requests for moderation are disabled.',
      dateNotSet: 'Date not set',
      untitledEvent: 'Untitled event',
      locationNotSet: 'Location not set',
      totalEvents: 'Total Events',
      totalEventsDesc: 'Created across all statuses',
      pendingReview: 'Pending Review',
      pendingDesc: 'Awaiting admin decision',
      noBlockedLaunches: 'No blocked launches',
      published: 'Published',
      publishedDesc: 'Visible to attendees',
      drafts: 'Drafts',
      draftsDesc: 'Saved but not submitted',
      ticketsSold: 'Tickets Sold',
      ticketsSoldDesc: 'Across organizer events',
      pipeline: 'Pipeline',
      recentEvents: 'Recent events',
      total: 'total',
      noEventsYet: 'No events yet',
      noEventsDesc: 'Your created events, review state, and publishing progress will appear here.',
      createFirstEvent: 'Create first event',
      moderation: 'Moderation',
      reviewStatus: 'Review status',
      pending: 'pending',
      noModeration: 'No events waiting for moderation.',
      nextUp: 'Next up',
      upcomingEvents: 'Upcoming events',
      noUpcoming: 'Published upcoming events will appear here.',
      quickStart: 'Quick start',
      launchChecklist: 'Launch checklist',
      checklist: ['Create an event draft', 'Add venue, date, and ticket settings', 'Submit for moderation', 'Publish and track orders'],
      startNewEvent: 'Start a new event',
      workInProgress: 'Work in progress',
      draftEvents: 'Draft events',
      draftsLower: 'drafts',
      noDrafts: 'Drafts you save will stay ready here.',
      activity: 'Activity',
      feed: 'Feed',
      noActivity: 'No activity yet',
      noActivityDesc: 'Create your first event to start the timeline.',
    },
    ru: {
      title: 'Панель организатора',
      eyebrow: 'Центр управления',
      subtitle: 'Отслеживайте статусы событий, продолжайте черновики и проводите следующий запуск через модерацию без лишних переходов.',
      createEvent: 'Создать событие',
      accessDisabled: 'Доступ организатора деактивирован. Создание новых событий и отправка на модерацию отключены.',
      dateNotSet: 'Дата не указана',
      untitledEvent: 'Событие без названия',
      locationNotSet: 'Локация не указана',
      totalEvents: 'Всего событий',
      totalEventsDesc: 'Созданы во всех статусах',
      pendingReview: 'На проверке',
      pendingDesc: 'Ожидают решения администратора',
      noBlockedLaunches: 'Нет заблокированных запусков',
      published: 'Опубликовано',
      publishedDesc: 'Видно участникам',
      drafts: 'Черновики',
      draftsDesc: 'Сохранены без отправки',
      ticketsSold: 'Билетов продано',
      ticketsSoldDesc: 'По событиям организатора',
      pipeline: 'Воронка',
      recentEvents: 'Недавние события',
      total: 'всего',
      noEventsYet: 'Событий пока нет',
      noEventsDesc: 'Здесь появятся созданные события, статусы проверки и прогресс публикации.',
      createFirstEvent: 'Создать первое событие',
      moderation: 'Модерация',
      reviewStatus: 'Статус проверки',
      pending: 'ожидают',
      noModeration: 'Нет событий, ожидающих модерации.',
      nextUp: 'Ближайшее',
      upcomingEvents: 'Предстоящие события',
      noUpcoming: 'Опубликованные предстоящие события появятся здесь.',
      quickStart: 'Быстрый старт',
      launchChecklist: 'Чеклист запуска',
      checklist: ['Создайте черновик события', 'Добавьте место, дату и билеты', 'Отправьте на модерацию', 'Опубликуйте и отслеживайте заказы'],
      startNewEvent: 'Начать новое событие',
      workInProgress: 'В работе',
      draftEvents: 'Черновики событий',
      draftsLower: 'черновиков',
      noDrafts: 'Сохраненные черновики будут готовы здесь.',
      activity: 'Активность',
      feed: 'Лента',
      noActivity: 'Активности пока нет',
      noActivityDesc: 'Создайте первое событие, чтобы запустить ленту.',
    },
    kk: {
      title: 'Ұйымдастырушы панелі',
      eyebrow: 'Басқару орталығы',
      subtitle: 'Іс-шара күйлерін бақылаңыз, черновиктерді жалғастырыңыз және келесі іске қосуды модерациядан өткізіңіз.',
      createEvent: 'Іс-шара құру',
      accessDisabled: 'Ұйымдастырушы рұқсаты өшірілген. Жаңа іс-шара құру және модерацияға жіберу бұғатталған.',
      dateNotSet: 'Күні көрсетілмеген',
      untitledEvent: 'Атаусыз іс-шара',
      locationNotSet: 'Орын көрсетілмеген',
      totalEvents: 'Барлық іс-шара',
      totalEventsDesc: 'Барлық статустарда құрылған',
      pendingReview: 'Қаралуда',
      pendingDesc: 'Әкімші шешімін күтуде',
      noBlockedLaunches: 'Бұғатталған іске қосулар жоқ',
      published: 'Жарияланған',
      publishedDesc: 'Қатысушыларға көрінеді',
      drafts: 'Черновиктер',
      draftsDesc: 'Жіберілмей сақталған',
      ticketsSold: 'Сатылған билеттер',
      ticketsSoldDesc: 'Ұйымдастырушы іс-шаралары бойынша',
      pipeline: 'Ағын',
      recentEvents: 'Соңғы іс-шаралар',
      total: 'барлығы',
      noEventsYet: 'Әзірге іс-шара жоқ',
      noEventsDesc: 'Құрылған іс-шаралар, тексеру статусы және жариялау барысы осы жерде пайда болады.',
      createFirstEvent: 'Алғашқы іс-шараны құру',
      moderation: 'Модерация',
      reviewStatus: 'Тексеру статусы',
      pending: 'күтуде',
      noModeration: 'Модерация күтіп тұрған іс-шара жоқ.',
      nextUp: 'Келесі',
      upcomingEvents: 'Алдағы іс-шаралар',
      noUpcoming: 'Жарияланған алдағы іс-шаралар осы жерде пайда болады.',
      quickStart: 'Жылдам бастау',
      launchChecklist: 'Іске қосу чеклисті',
      checklist: ['Іс-шара черновигін жасаңыз', 'Орын, күн және билеттерді қосыңыз', 'Модерацияға жіберіңіз', 'Жариялап, тапсырыстарды бақылаңыз'],
      startNewEvent: 'Жаңа іс-шара бастау',
      workInProgress: 'Жұмыста',
      draftEvents: 'Іс-шара черновиктері',
      draftsLower: 'черновик',
      noDrafts: 'Сақталған черновиктер осы жерде дайын тұрады.',
      activity: 'Белсенділік',
      feed: 'Лента',
      noActivity: 'Әзірге белсенділік жоқ',
      noActivityDesc: 'Лентаны бастау үшін алғашқы іс-шараны құрыңыз.',
    },
  }[language];
  const publishedCount = events.filter((event) => event.status === 'published').length;
  const pendingCount = events.filter((event) => event.status === 'pending' || event.status === 'pending-update-review').length;
  const draftCount = events.filter((event) => event.status === 'draft').length;
  const totalSold = events.reduce((sum, event) => sum + (Number(event.soldTickets) || 0), 0);
  const upcomingEvents = events
    .filter((event) => event.status === 'published' && parseEventTime(event) >= Date.now())
    .sort((a, b) => parseEventTime(a) - parseEventTime(b))
    .slice(0, 4);
  const draftEvents = events.filter((event) => event.status === 'draft').slice(0, 3);
  const reviewEvents = events.filter((event) => event.status === 'pending' || event.status === 'pending-update-review').slice(0, 3);
  const recentEvents = [...events].reverse().slice(0, 4);

  const metrics = [
    {
      title: copy.totalEvents,
      value: events.length,
      description: copy.totalEventsDesc,
      icon: CalendarDays,
      tone: 'blue',
    },
    {
      title: copy.pendingReview,
      value: pendingCount,
      description: pendingCount ? copy.pendingDesc : copy.noBlockedLaunches,
      icon: Clock3,
      tone: 'amber',
    },
    {
      title: copy.published,
      value: publishedCount,
      description: copy.publishedDesc,
      icon: CheckCircle2,
      tone: 'green',
    },
    {
      title: copy.drafts,
      value: draftCount,
      description: copy.draftsDesc,
      icon: FileText,
      tone: 'violet',
    },
    {
      title: copy.ticketsSold,
      value: totalSold,
      description: copy.ticketsSoldDesc,
      icon: Activity,
      tone: 'cyan',
    },
  ];

  const activityRows = recentEvents.length
    ? recentEvents.map((event) => ({
        title: getEventTitle(event, copy.untitledEvent),
        meta: `${formatStatus(event.status)} · ${formatEventDate(event.date, locale, copy.dateNotSet)}`,
      }))
    : [
        { title: copy.noActivity, meta: copy.noActivityDesc },
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

      {!canCreateEvent && (
        <div className="organizer-alert">
          {copy.accessDisabled}
        </div>
      )}

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
              <span className="organizer-section-label">{copy.pipeline}</span>
              <h2>{copy.recentEvents}</h2>
            </div>
            <span className="organizer-chip">{events.length} {copy.total}</span>
          </div>

          {recentEvents.length ? (
            <div className="organizer-event-list">
              {recentEvents.map((event) => (
                <div key={event.id} className="organizer-event-row">
                  <div>
                    <strong>{getEventTitle(event, copy.untitledEvent)}</strong>
                    <span>{[event.city, event.venue].filter(Boolean).join(' · ') || copy.locationNotSet}</span>
                  </div>
                  <div className="organizer-row-meta">
                    <span className={`organizer-status status-${event.status}`}>{formatStatus(event.status)}</span>
                    <span>{formatEventDate(event.date, locale, copy.dateNotSet)}</span>
                  </div>
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
          <article className="organizer-panel">
            <div className="organizer-panel-header">
              <div>
                <span className="organizer-section-label">{copy.moderation}</span>
                <h2>{copy.reviewStatus}</h2>
              </div>
              <span className="organizer-chip">{pendingCount} {copy.pending}</span>
            </div>
            <div className="organizer-mini-list">
              {reviewEvents.length ? (
                reviewEvents.map((event) => (
                  <div key={event.id} className="organizer-mini-row">
                    <Clock3 aria-hidden="true" />
                    <div>
                      <strong>{getEventTitle(event, copy.untitledEvent)}</strong>
                      <span>{formatStatus(event.status)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="organizer-quiet-empty">{copy.noModeration}</div>
              )}
            </div>
          </article>

          <article className="organizer-panel">
            <div className="organizer-panel-header">
              <div>
                <span className="organizer-section-label">{copy.nextUp}</span>
                <h2>{copy.upcomingEvents}</h2>
              </div>
            </div>
            <div className="organizer-mini-list">
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="organizer-mini-row">
                    <CalendarClock aria-hidden="true" />
                    <div>
                      <strong>{getEventTitle(event, copy.untitledEvent)}</strong>
                      <span>{formatEventDate(event.date, locale, copy.dateNotSet)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="organizer-quiet-empty">{copy.noUpcoming}</div>
              )}
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

        <article className="organizer-panel">
          <div className="organizer-panel-header">
            <div>
              <span className="organizer-section-label">{copy.workInProgress}</span>
              <h2>{copy.draftEvents}</h2>
            </div>
            <span className="organizer-chip">{draftCount} {copy.draftsLower}</span>
          </div>
          <div className="organizer-mini-list">
            {draftEvents.length ? (
              draftEvents.map((event) => (
                <div key={event.id} className="organizer-mini-row">
                  <FileText aria-hidden="true" />
                  <div>
                    <strong>{getEventTitle(event, copy.untitledEvent)}</strong>
                    <span>{formatEventDate(event.date, locale, copy.dateNotSet)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="organizer-quiet-empty">{copy.noDrafts}</div>
            )}
          </div>
        </article>

        <article className="organizer-panel">
          <div className="organizer-panel-header">
            <div>
              <span className="organizer-section-label">{copy.activity}</span>
              <h2>{copy.feed}</h2>
            </div>
          </div>
          <div className="organizer-activity-feed">
            {activityRows.map((row) => (
              <div key={`${row.title}-${row.meta}`} className="organizer-activity-row">
                <ListChecks aria-hidden="true" />
                <div>
                  <strong>{row.title}</strong>
                  <span>{row.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
