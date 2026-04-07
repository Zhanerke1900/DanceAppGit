import React, { useMemo, useState } from 'react';
import { Calendar, Eye, MapPin, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import { useI18n } from '../i18n';

interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
  status: string;
  price?: string;
  image?: string;
  ticketLimit?: number;
  soldTickets?: number;
  remainingTickets?: number | null;
  soldOut?: boolean;
}

interface OrganizerEventsProps {
  events?: OrganizerEvent[];
  onCreateEvent: () => void;
  onViewEvent: (event: OrganizerEvent) => void;
  onEditEvent: (event: OrganizerEvent) => void;
  onMoveToDraft: (event: OrganizerEvent) => void;
  onDeleteEvent: (event: OrganizerEvent) => void;
  canCreateEvent?: boolean;
}

type EventsTab = 'active' | 'pending' | 'passed' | 'draft';

const formatDate = (dateString: string, locale = 'en-US') => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};

const parseEventDate = (dateString: string) => {
  const rawDate = String(dateString || '').trim();
  if (!rawDate) return null;

  const isoDate = new Date(`${rawDate}T23:59:59`);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;

  const directDate = new Date(rawDate);
  if (!Number.isNaN(directDate.getTime())) {
    directDate.setHours(23, 59, 59, 999);
    return directDate;
  }

  const monthRangeMatch = rawDate.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*\d{1,2},\s*(\d{4})$/);
  if (monthRangeMatch) {
    const normalized = `${monthRangeMatch[1]} ${monthRangeMatch[2]}, ${monthRangeMatch[3]} 23:59:59`;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const splitRange = rawDate.split('-').map((part) => part.trim()).filter(Boolean);
  if (splitRange.length > 1) {
    const parsed = new Date(splitRange[0]);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(23, 59, 59, 999);
      return parsed;
    }
  }

  return null;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'border-green-500/30 bg-green-500/20 text-green-400';
    case 'draft':
      return 'border-gray-500/30 bg-gray-500/20 text-gray-400';
    case 'archived':
      return 'border-red-500/30 bg-red-500/20 text-red-400';
    case 'pending':
      return 'border-amber-500/30 bg-amber-500/20 text-amber-300';
    case 'pending-update-review':
      return 'border-orange-500/30 bg-orange-500/20 text-orange-300';
    default:
      return 'border-purple-500/30 bg-purple-500/20 text-purple-400';
  }
};

const isPastEvent = (dateString: string) => {
  const parsed = parseEventDate(dateString);
  if (!parsed || Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
};

export const OrganizerEvents: React.FC<OrganizerEventsProps> = ({
  events = [],
  onCreateEvent,
  onViewEvent,
  onEditEvent,
  onMoveToDraft,
  onDeleteEvent,
  canCreateEvent = true,
}) => {
  const { language } = useI18n();
  const locale = language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';
  const copy = {
    en: {
      title: 'Events',
      subtitle: 'Manage your events by current publication status.',
      createEvent: 'Create Event',
      tabs: { active: 'Active', pending: 'Pending', passed: 'Passed', draft: 'Draft' },
      status: {
        published: 'Published',
        draft: 'Draft',
        archived: 'Archived',
        pending: 'Pending',
        'pending-update-review': 'Pending Update Review',
      } as Record<string, string>,
      at: 'at',
      startingFrom: 'Starting from',
      sold: 'Sold',
      of: 'of',
      soldOut: 'Sold out',
      left: 'left',
      category: 'Category',
      statusLabel: 'Status',
      view: 'View',
      edit: 'Edit',
      changeToDraft: 'Change to Draft',
      delete: 'Delete',
      noEvents: (tab: string) => `No ${tab} events`,
      empty: 'Events in this status will appear here.',
    },
    ru: {
      title: 'События',
      subtitle: 'Управляйте событиями по текущему статусу публикации.',
      createEvent: 'Создать событие',
      tabs: { active: 'Активные', pending: 'На проверке', passed: 'Прошедшие', draft: 'Черновики' },
      status: {
        published: 'Опубликовано',
        draft: 'Черновик',
        archived: 'Архив',
        pending: 'На проверке',
        'pending-update-review': 'Проверка изменений',
      } as Record<string, string>,
      at: 'в',
      startingFrom: 'Цена от',
      sold: 'Продано',
      of: 'из',
      soldOut: 'Распродано',
      left: 'осталось',
      category: 'Категория',
      statusLabel: 'Статус',
      view: 'Просмотр',
      edit: 'Редактировать',
      changeToDraft: 'Вернуть в черновик',
      delete: 'Удалить',
      noEvents: (tab: string) => `Нет событий: ${tab.toLowerCase()}`,
      empty: 'События с этим статусом появятся здесь.',
    },
    kk: {
      title: 'Іс-шаралар',
      subtitle: 'Іс-шараларды жариялау статусы бойынша басқарыңыз.',
      createEvent: 'Іс-шара құру',
      tabs: { active: 'Белсенді', pending: 'Қаралуда', passed: 'Өткен', draft: 'Черновик' },
      status: {
        published: 'Жарияланды',
        draft: 'Черновик',
        archived: 'Архив',
        pending: 'Қаралуда',
        'pending-update-review': 'Өзгерістер қаралуда',
      } as Record<string, string>,
      at: 'сағат',
      startingFrom: 'Бағасы',
      sold: 'Сатылды',
      of: '/',
      soldOut: 'Сатылып кетті',
      left: 'қалды',
      category: 'Санат',
      statusLabel: 'Статус',
      view: 'Көру',
      edit: 'Өңдеу',
      changeToDraft: 'Черновикке қайтару',
      delete: 'Жою',
      noEvents: (tab: string) => `${tab} іс-шаралары жоқ`,
      empty: 'Бұл статустағы іс-шаралар осында пайда болады.',
    },
  }[language];
  const getStatusLabel = (status: string) => copy.status[status] || status;
  const [activeTab, setActiveTab] = useState<EventsTab>('active');

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (activeTab === 'active') {
        return event.status === 'published' && !isPastEvent(event.date);
      }
      if (activeTab === 'pending') {
        return event.status === 'pending' || event.status === 'pending-update-review';
      }
      if (activeTab === 'passed') {
        return event.status === 'archived' || (event.status === 'published' && isPastEvent(event.date));
      }
      return event.status === 'draft';
    });
  }, [activeTab, events]);

  const tabs: { id: EventsTab; label: string }[] = [
    { id: 'active', label: copy.tabs.active },
    { id: 'pending', label: copy.tabs.pending },
    { id: 'passed', label: copy.tabs.passed },
    { id: 'draft', label: copy.tabs.draft },
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">{copy.title}</h1>
            <p className="text-gray-400">{copy.subtitle}</p>
          </div>
          <button
            onClick={onCreateEvent}
            disabled={!canCreateEvent}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          >
            <Plus className="h-5 w-5" />
            {copy.createEvent}
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-purple-500/20 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 transition-all duration-300 hover:border-purple-500/30"
              >
                <div className="flex flex-col gap-4 xl:flex-row">
                  <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg xl:w-32">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-gray-900 text-purple-200">
                        <Calendar className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                        <div>
                          <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-purple-400">
                            {event.title}
                          </h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="h-4 w-4 text-purple-400" />
                              <span>{formatDate(event.date, locale)} {copy.at} {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <MapPin className="h-4 w-4 text-purple-400" />
                              <span>{event.venue}, {event.city}</span>
                            </div>
                            {event.price && (
                              <div className="pt-1 text-sm text-gray-400">
                                {copy.startingFrom} <span className="font-semibold text-white">{event.price}</span>
                              </div>
                            )}
                            {event.ticketLimit ? (
                              <div className="pt-1 text-sm text-gray-400">
                                {copy.sold} <span className="font-semibold text-white">{event.soldTickets || 0}</span> {copy.of}{' '}
                                <span className="font-semibold text-white">{event.ticketLimit}</span>
                                {event.remainingTickets !== null && event.remainingTickets !== undefined && (
                                  <span className={`ml-2 font-semibold ${event.soldOut ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {event.soldOut ? copy.soldOut : `${event.remainingTickets} ${copy.left}`}
                                  </span>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="mb-1 text-xs text-gray-500">{copy.category}</p>
                            <p className="font-semibold text-white">{event.category}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs text-gray-500">{copy.statusLabel}</p>
                            <p className="font-semibold text-white">{getStatusLabel(event.status)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                        <button
                          type="button"
                          onClick={() => onViewEvent(event)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                          {copy.view}
                        </button>
                        {((event.status === 'published' && !isPastEvent(event.date)) || event.status === 'draft' || event.status === 'pending' || event.status === 'pending-update-review') && (
                          <button
                            type="button"
                            onClick={() => onEditEvent(event)}
                            className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 px-4 py-2.5 text-sm font-semibold text-purple-200 transition-colors hover:bg-purple-600/20"
                          >
                            <Pencil className="h-4 w-4" />
                            {copy.edit}
                          </button>
                        )}
                        {event.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => onMoveToDraft(event)}
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
                          >
                            <Undo2 className="h-4 w-4" />
                            {copy.changeToDraft}
                          </button>
                        )}
                        {(event.status === 'pending' || event.status === 'draft') && (
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(event)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            {copy.delete}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/15">
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">{copy.noEvents(copy.tabs[activeTab])}</h2>
            <p className="text-gray-400">{copy.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
};
