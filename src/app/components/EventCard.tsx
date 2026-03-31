import React from 'react';
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
  return (
    <div className="group bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-purple-500/10 hover:shadow-2xl transition-all border border-white/5">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-black/60 backdrop-blur-md text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-400/30">
            {category}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500/90 border-rose-300/70 text-white shadow-lg shadow-rose-900/30'
              : 'bg-black/55 border-white/10 text-white/85 hover:bg-rose-500/85 hover:border-rose-300/60 hover:text-white'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="w-4 h-4" />
            {date}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            {location}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <span className="text-sm text-gray-500">Tickets from</span>
            <div className="text-xl font-bold text-purple-400">{price}</div>
            {soldOut ? (
              <div className="mt-1 text-sm font-semibold text-red-400">Sold out</div>
            ) : remainingTickets !== null && remainingTickets <= 15 ? (
              <div className="mt-1 text-sm font-medium text-emerald-400">{remainingTickets} tickets left</div>
            ) : null}
          </div>
          <button 
            onClick={onBuyTicket}
            className="bg-gray-800 hover:bg-purple-600 hover:text-white text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {soldOut ? 'View Details' : 'Buy Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};
