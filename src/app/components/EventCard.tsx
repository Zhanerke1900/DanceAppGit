import React, { useEffect, useState } from 'react';
import { Calendar, Heart, MapPin } from 'lucide-react';
import { useI18n } from '../i18n';
import { DEFAULT_EVENT_IMAGE, getDisplayEventImage } from '../utils/eventImages';
import { stripCityFromEventTitle } from '../utils/localization';

interface EventCardProps {
  id?: string;
  image: string;
  category: string;
  title: string;
  date: string;
  location: string;
  price: string;
  onBuyTicket?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  remainingTickets?: number | null;
  soldOut?: boolean;
}

const formatKzt = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + ' ₸';

const getNumericPrice = (value: string) => {
  const parsed = Number(String(value || '').replace(/[^\d]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const stripCityFromTitle = (value: string) => {
  const cityNames = 'Almaty|Astana|Shymkent|Karaganda|Pavlodar|Aktobe|Oskemen|Ust-Kamenogorsk|Алматы|Астане|Астана|Шымкенте|Шымкент|Караганде|Караганда|Павлодаре|Павлодар|Актобе|Оскемен';
  const withoutSuffix = String(value || '').replace(new RegExp(`\\s+(в|in)\\s+(${cityNames})\\b`, 'gi'), '');
  const withoutPrefix = withoutSuffix.replace(new RegExp(`^(${cityNames})\\s+`, 'i'), '');
  return withoutPrefix.trim() || value;
};

export const EventCard = ({
  image,
  category,
  title,
  date,
  location,
  price,
  onBuyTicket,
  isFavorite = false,
  onToggleFavorite,
  remainingTickets = null,
  soldOut = false,
}: EventCardProps) => {
  // Текст кнопки
  const { t, language } = useI18n();
  const actionLabel = soldOut ? t('common.viewDetails') : t('common.buyTicket');
  const displayImage = String(image || '').trim();
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? DEFAULT_EVENT_IMAGE : getDisplayEventImage(displayImage);
  const displayTitle = stripCityFromEventTitle(title);
  const numericPrice = getNumericPrice(price);
  const priceLabel = numericPrice
    ? language === 'kk'
      ? `${formatKzt(numericPrice)} бастап`
      : `${language === 'ru' ? 'от' : 'from'} ${formatKzt(numericPrice)}`
    : price;

  useEffect(() => {
    setImageFailed(false);
  }, [displayImage]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onBuyTicket?.();
    }
  };

  return (
    // Карточка события
    <article
      role="button"
      tabIndex={0}
      aria-label={actionLabel}
      onClick={onBuyTicket}
      onKeyDown={handleKeyDown}
      className="event-catalog-card group flex h-full min-w-0 cursor-pointer flex-col bg-transparent outline-none"
    >
      <div className="event-catalog-poster relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-200 shadow-[0_10px_24px_rgba(61,41,110,0.14)] transition-transform duration-300 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-purple-500 dark:bg-gray-900">
        <img
          src={imageSrc}
          alt={displayTitle}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          onError={() => {
            if (!imageFailed) setImageFailed(true);
          }}
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.();
          }}
          className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all sm:h-9 sm:w-9 ${
            isFavorite
              ? 'bg-rose-500/90 border-rose-300/70 text-white shadow-lg shadow-rose-900/30'
              : 'border-white/50 bg-white/80 text-[#4b4366] hover:bg-rose-500/85 hover:border-rose-300/60 hover:text-white dark:border-white/10 dark:bg-black/55 dark:text-white/85'
          }`}
          aria-label={isFavorite ? t('common.removeFromFavorites') : t('common.addToFavorites')}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="event-catalog-content flex flex-1 flex-col pt-3">
        <h3 className="event-catalog-title line-clamp-2 min-h-[2.55rem] text-[15px] font-extrabold leading-[1.18] text-foreground transition-colors group-hover:text-purple-700 sm:min-h-[3.35rem] sm:text-[20px] dark:text-white dark:group-hover:text-purple-300">
          {displayTitle}
        </h3>
        <div className="event-catalog-meta mt-3 space-y-2 text-muted-foreground">
          <div className="flex items-center gap-2 text-[12px] leading-tight sm:text-[17px]">
            <Calendar className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] leading-tight sm:text-[17px]">
            <MapPin className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <span className="truncate">{location}</span>
          </div>
        </div>
        <div className="event-catalog-footer mt-3 flex flex-col items-start gap-1.5">
          <span className="max-w-full truncate rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-extrabold leading-none text-gray-900 sm:text-[15px] dark:bg-white/10 dark:text-white">
            {priceLabel}
          </span>
          {soldOut ? (
            <span className="text-[11px] font-semibold text-red-500 sm:text-sm">{t('common.soldOut')}</span>
          ) : remainingTickets !== null && remainingTickets <= 15 ? (
            <span className="text-[11px] font-semibold text-emerald-500 sm:text-sm">{t('common.ticketsLeft', { count: remainingTickets })}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
};
