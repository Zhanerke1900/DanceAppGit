import React, { useEffect, useState } from 'react';
import { Calendar, Heart, MapPin } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

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
      className={`group rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 ${
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
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span
            className={`backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
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
          className={`absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
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
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="p-6">
        <h3 className={`text-xl font-bold text-foreground mb-4 transition-colors ${isDark ? 'group-hover:text-purple-400' : 'group-hover:text-purple-600'}`}>
          {title}
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            {date}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            {location}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/70">
          <div>
            <span className="text-sm text-muted-foreground">Tickets from</span>
            <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>{price}</div>
            {soldOut ? (
              <div className="mt-1 text-sm font-semibold text-red-400">Sold out</div>
            ) : remainingTickets !== null && remainingTickets <= 15 ? (
              <div className="mt-1 text-sm font-medium text-emerald-500">{remainingTickets} tickets left</div>
            ) : null}
          </div>
          <button 
            onClick={onBuyTicket}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
            {soldOut ? 'View Details' : 'Buy Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};
