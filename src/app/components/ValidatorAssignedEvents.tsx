import React from 'react';
import { Calendar, MapPin, QrCode } from 'lucide-react';
import { useI18n } from '../i18n';

interface ValidatorAssignedEventsProps {
  events: any[];
  onStartScan: (event: any) => void;
}

export const ValidatorAssignedEvents: React.FC<ValidatorAssignedEventsProps> = ({ events, onStartScan }) => {
  const { language } = useI18n();
  const copy = {
    en: {
      title: 'Assigned Events',
      subtitle: 'Only the published events assigned to your validator account.',
      empty: 'No assigned events yet.',
      scan: 'Scan Ticket',
    },
    ru: {
      title: 'Назначенные события',
      subtitle: 'Только опубликованные события, назначенные на ваш аккаунт валидатора.',
      empty: 'Назначенных событий пока нет.',
      scan: 'Сканировать билет',
    },
    kk: {
      title: 'Тағайындалған іс-шаралар',
      subtitle: 'Валидатор аккаунтыңызға тағайындалған жарияланған іс-шаралар ғана.',
      empty: 'Әзірге тағайындалған іс-шара жоқ.',
      scan: 'Билетті сканерлеу',
    },
  }[language];
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">{copy.title}</h1>
          <p className="text-gray-400">{copy.subtitle}</p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-8 text-gray-400">
            {copy.empty}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">{event.category}</p>
                <h2 className="text-2xl font-bold text-white">{event.title}</h2>
                <div className="mt-4 space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span>{event.date}{event.time ? ` - ${event.time}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => onStartScan(event)}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition-all hover:bg-purple-700"
                >
                  <QrCode className="h-4 w-4" />
                  {copy.scan}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
