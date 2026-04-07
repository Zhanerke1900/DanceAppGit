import React, { useEffect, useState } from 'react';
import { Calendar, Heart, MapPin } from 'lucide-react';
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
  const [isDark, setIsDark] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const updateTheme = () => {
      if (typeof document === 'undefined') return;
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`group overflow-hidden rounded-lg transition-all hover:-translate-y-0.5 sm:rounded-2xl ${
        isDark
          ? 'border border-white/5 bg-gray-900 hover:border-purple-500/25 hover:shadow-[0_22px_52px_rgba(91,78,224,0.16)]'
          : 'border border-[rgba(98,78,156,0.28)] hover:border-purple-500/30 hover:shadow-[0_22px_52px_rgba(91,78,224,0.18)]'
      }`}
      style={
        isDark
          ? undefined
          : {
              background:
                'linear-gradient(180deg, rgba(224,214,244,0.98) 0%, rgba(211,197,237,0.99) 100%)',
              boxShadow:
                '0 18px 40px rgba(61,41,110,0.14), inset 0 1px 0 rgba(255,255,255,0.26)',
            }
        }
    >
      <div className="relative h-20 overflow-hidden sm:h-48">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute left-1 top-1 max-w-[calc(100%-2rem)] sm:left-4 sm:top-4 sm:max-w-[calc(100%-4rem)]">
          <span
            className={`block truncate rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none shadow-sm backdrop-blur-md sm:px-3 sm:py-1 sm:text-xs sm:tracking-wider ${
              isDark
                ? 'bg-black/60 text-purple-400 border border-purple-400/30'
                : 'text-purple-800 border border-[rgba(98,78,156,0.22)]'
            }`}
            style={
              isDark
                ? undefined
                : { background: 'linear-gradient(180deg, rgba(238,231,248,0.96) 0%, rgba(224,214,244,0.96) 100%)' }
            }
          >
            {category}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-md transition-all sm:right-4 sm:top-4 sm:h-10 sm:w-10 ${
            isFavorite
              ? 'bg-rose-500/90 border-rose-300/70 text-white shadow-lg shadow-rose-900/30'
              : isDark
                ? 'bg-black/55 border-white/10 text-white/85 hover:bg-rose-500/85 hover:border-rose-300/60 hover:text-white'
                : 'text-[#4b4366] hover:bg-rose-500/85 hover:border-rose-300/60 hover:text-white'
          }`}
          style={
            isFavorite
              ? undefined
              : isDark
                ? undefined
              : {
                  background: 'linear-gradient(180deg, rgba(238,231,248,0.94) 0%, rgba(223,211,241,0.96) 100%)',
                  borderColor: 'rgba(98,78,156,0.2)',
                }
          }
          aria-label={isFavorite ? t('common.removeFromFavorites') : t('common.addToFavorites')}
        >
          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="p-2 sm:p-6">
        <h3 className={`mb-2 min-h-[2.2rem] line-clamp-2 text-[11px] font-bold leading-tight text-foreground transition-colors sm:mb-4 sm:min-h-0 sm:text-xl sm:leading-normal ${isDark ? 'group-hover:text-purple-400' : 'group-hover:text-purple-600'}`}>
          {title}
        </h3>
        <div className="mb-2 space-y-1 sm:mb-6 sm:space-y-2">
          <div className="flex items-center gap-1 text-[9px] leading-tight text-muted-foreground sm:gap-2 sm:text-sm">
            <Calendar className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{date}</span>
          </div>
          <div className="hidden items-center gap-2 text-muted-foreground text-sm sm:flex">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-1 border-t border-border/70 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-4">
          <div className="min-w-0">
            <span className="hidden text-sm text-muted-foreground sm:inline">{t('common.ticketsFrom')}</span>
            <div className={`truncate text-[11px] font-bold leading-tight sm:text-xl sm:leading-normal ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>{price}</div>
            {soldOut ? (
              <div className="mt-0.5 truncate text-[9px] font-semibold text-red-400 sm:mt-1 sm:text-sm">{t('common.soldOut')}</div>
            ) : remainingTickets !== null && remainingTickets <= 15 ? (
              <div className="mt-0.5 truncate text-[9px] font-medium text-emerald-500 sm:mt-1 sm:text-sm">{t('common.ticketsLeft', { count: remainingTickets })}</div>
            ) : null}
          </div>
          <button 
            onClick={onBuyTicket}
            className={`w-full rounded-md px-1.5 py-1.5 text-[10px] font-semibold leading-none transition-colors sm:w-auto sm:rounded-lg sm:px-4 sm:py-2 sm:text-base sm:font-medium sm:leading-normal ${
              isDark
                ? 'bg-gray-800 hover:bg-purple-600 hover:text-white text-gray-300'
                : 'hover:bg-purple-600 hover:text-white text-foreground border border-[rgba(98,78,156,0.14)]'
            }`}
            style={
              isDark
                ? undefined
                : { background: 'linear-gradient(180deg, rgba(234,226,247,0.96) 0%, rgba(217,204,240,0.96) 100%)' }
            }
          >
            {soldOut ? t('common.viewDetails') : t('common.buyTicket')}
          </button>
        </div>
      </div>
    </div>
  );
};
