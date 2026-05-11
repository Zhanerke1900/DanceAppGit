import React from 'react';
import { ArrowRight, Calendar, Heart, MapPin, Ticket } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useI18n } from '../i18n';

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
  const { t } = useI18n();
  const actionLabel = soldOut ? t('common.viewDetails') : t('common.buyTicket');
  const ActionIcon = soldOut ? ArrowRight : Ticket;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[rgba(98,78,156,0.28)] bg-[linear-gradient(180deg,rgba(224,214,244,0.98)_0%,rgba(211,197,237,0.99)_100%)] shadow-[0_18px_40px_rgba(61,41,110,0.14),inset_0_1px_0_rgba(255,255,255,0.26)] transition-colors hover:border-purple-500/35 dark:border-white/5 dark:bg-gray-900 dark:bg-none dark:shadow-none">
      <div className="relative h-40 overflow-hidden sm:h-56">
        <ImageWithFallback
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgba(36,26,58,0.54)] to-transparent dark:from-black/70" />
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border backdrop-blur-md transition-all sm:right-4 sm:top-4 sm:h-10 sm:w-10 ${
            isFavorite
              ? 'bg-rose-500/90 border-rose-300/70 text-white shadow-lg shadow-rose-900/30'
              : 'border-[rgba(98,78,156,0.2)] bg-[rgba(238,231,248,0.92)] text-[#4b4366] hover:bg-rose-500/85 hover:border-rose-300/60 hover:text-white dark:border-white/10 dark:bg-black/55 dark:text-white/85'
          }`}
          aria-label={isFavorite ? t('common.removeFromFavorites') : t('common.addToFavorites')}
        >
          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-[9px] font-extrabold uppercase leading-none tracking-[0.2em] text-purple-600 sm:text-[11px] dark:text-purple-300">
          <span className="h-px w-5 bg-purple-500/70" />
          <span className="truncate">{category}</span>
        </div>
        <h3 className="font-display mb-2 min-h-[2.35rem] line-clamp-2 text-[16px] font-bold leading-[0.98] text-foreground transition-colors group-hover:text-purple-600 sm:mb-4 sm:min-h-[3.9rem] sm:text-[2rem] sm:leading-[0.98] dark:group-hover:text-purple-300">
          {title}
        </h3>
        <div className="mb-3 space-y-1.5 sm:mb-5 sm:space-y-2">
          <div className="flex items-center gap-1 text-[9px] leading-tight text-muted-foreground sm:gap-2 sm:text-sm">
            <Calendar className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] leading-tight text-muted-foreground sm:gap-2 sm:text-sm">
            <MapPin className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{location}</span>
          </div>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border/70 pt-3 sm:items-center sm:gap-3 sm:pt-4">
          <div className="min-w-0">
            <span className="hidden text-sm text-muted-foreground sm:inline">{t('common.ticketsFrom')}</span>
            <div className="truncate text-[12px] font-extrabold leading-tight text-purple-700 sm:text-xl sm:leading-normal dark:text-purple-300">{price}</div>
            {soldOut ? (
              <div className="mt-0.5 truncate text-[9px] font-semibold text-red-400 sm:mt-1 sm:text-sm">{t('common.soldOut')}</div>
            ) : remainingTickets !== null && remainingTickets <= 15 ? (
              <div className="mt-0.5 truncate text-[9px] font-medium text-emerald-500 sm:mt-1 sm:text-sm">{t('common.ticketsLeft', { count: remainingTickets })}</div>
            ) : null}
          </div>
          <button 
            onClick={onBuyTicket}
            aria-label={actionLabel}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(98,78,156,0.14)] bg-[linear-gradient(180deg,rgba(234,226,247,0.96)_0%,rgba(217,204,240,0.96)_100%)] text-foreground transition-colors hover:bg-purple-600 hover:bg-none hover:text-white sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:text-sm sm:font-bold dark:bg-gray-800 dark:bg-none dark:text-gray-300"
          >
            <ActionIcon className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">{actionLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
