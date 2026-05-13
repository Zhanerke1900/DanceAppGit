import React from 'react';
import { useI18n } from '../i18n';

interface OrganizerEvent {
  id: string;
  status: string;
}

interface OrganizerDashboardProps {
  onCreateEvent: () => void;
  events?: OrganizerEvent[];
  canCreateEvent?: boolean;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  onCreateEvent,
  events = [],
  canCreateEvent = true,
}) => {
  const { language } = useI18n();
  const publishedCount = events.filter((event) => event.status === 'published').length;
  const pendingCount = events.filter((event) => event.status === 'pending').length;
  const draftCount = events.filter((event) => event.status === 'draft').length;

  const stats = [
    {
      title: language === 'ru' ? 'Всего событий' : language === 'kk' ? 'Барлық іс-шара' : 'Total Events',
      value: String(events.length),
      change: language === 'ru' ? 'Все созданные события' : language === 'kk' ? 'Жасалған барлық іс-шаралар' : 'All created events',
      borderColor: 'border-blue-100',
    },
    {
      title: language === 'ru' ? 'На проверке' : language === 'kk' ? 'Қаралуда' : 'Pending Review',
      value: String(pendingCount),
      change: language === 'ru' ? 'Ожидают решения администратора' : language === 'kk' ? 'Әкімші шешімін күтуде' : 'Waiting for admin decision',
      borderColor: 'border-amber-100',
    },
    {
      title: language === 'ru' ? 'Опубликованные события' : language === 'kk' ? 'Жарияланған іс-шаралар' : 'Published Events',
      value: String(publishedCount),
      change: language === 'ru' ? `Черновиков: ${draftCount}` : language === 'kk' ? `Черновик саны: ${draftCount}` : `${draftCount} drafts saved`,
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Calibri", sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{language === 'ru' ? 'Панель' : language === 'kk' ? 'Басқару панелі' : 'Dashboard'}</h1>
          <p className="text-gray-600">{language === 'ru' ? 'Следите за активностью событий и быстро переходите к созданию новых.' : language === 'kk' ? 'Іс-шара белсенділігін бақылап, жаңасын жылдам жасаңыз.' : 'Track your event activity and jump into event creation from one place.'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`bg-white p-6 rounded-lg border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
            >
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-3">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Quick Start CTA */}
        <div className="bg-white rounded-lg border border-purple-100 p-8 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">{language === 'ru' ? 'Быстрый старт' : language === 'kk' ? 'Жылдам бастау' : 'Quick Start'}</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{language === 'ru' ? 'Готовы опубликовать следующее событие?' : language === 'kk' ? 'Келесі іс-шараны жариялауға дайынсыз ба?' : 'Ready to publish your next event?'}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            {language === 'ru' ? 'Используйте создание события, чтобы подготовить новое событие, сохранить его как черновик или отправить на модерацию. Списки событий и управление валидаторами находятся в отдельных вкладках.' : language === 'kk' ? 'Жаңа іс-шараны дайындап, черновик ретінде сақтап немесе модерацияға жіберу үшін құру ағынын пайдаланыңыз. Іс-шаралар мен валидаторлар бөлек бөлімдерде орналасқан.' : 'Use the create event flow to prepare a new event, save it as a draft, or send it for moderation. Your event lists and validator management now live in their own dedicated tabs for cleaner navigation.'}
          </p>
          {!canCreateEvent && (
            <p className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-4 py-3">
              {language === 'ru' ? 'Доступ организатора деактивирован. Создание новых событий и отправка на модерацию отключены.' : language === 'kk' ? 'Ұйымдастырушы рұқсаты өшірілген. Жаңа іс-шара құру және модерацияға жіберу бұғатталған.' : 'Organizer access is deactivated. Creating new events and sending new requests for moderation are disabled.'}
            </p>
          )}
          <button
            onClick={onCreateEvent}
            disabled={!canCreateEvent}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {language === 'ru' ? 'Создать событие' : language === 'kk' ? 'Іс-шара құру' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
