import React from 'react';
import { Heart, Calendar, MapPin, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';

type FavoriteItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  city?: string;
  image: string;
  category: string;
  price?: string;
  eventData?: any;
};

interface FavoritesProps {
  favorites: FavoriteItem[];
  onRemoveFavorite: (id: string) => void;
  onOpenFavorite: (event: FavoriteItem) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ favorites, onRemoveFavorite, onOpenFavorite }) => {
  const { language } = useI18n();
  const copy = {
    emptyTitle: language === 'ru' ? 'Пока нет избранного' : language === 'kk' ? 'Таңдаулылар әзірге жоқ' : 'No Favorites Yet',
    emptyText: language === 'ru' ? 'Добавляйте события в избранное, чтобы не потерять понравившиеся!' : language === 'kk' ? 'Ұнаған іс-шараларды жоғалтпау үшін таңдаулыларға қосыңыз!' : 'Start adding events to your favorites to keep track of the ones you love!',
    browse: language === 'ru' ? 'Смотреть события' : language === 'kk' ? 'Іс-шараларды көру' : 'Browse Events',
    title: language === 'ru' ? 'Избранное' : language === 'kk' ? 'Таңдаулылар' : 'Favorites',
    saved: language === 'ru' ? 'сохраненных событий' : language === 'kk' ? 'сақталған іс-шара' : 'saved events',
    viewDetails: language === 'ru' ? 'Подробнее' : language === 'kk' ? 'Толығырақ' : 'View Details',
  };

  if (favorites.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-[rgba(108,82,193,0.16)] dark:bg-purple-600/20">
          <Heart className="w-10 h-10 text-primary dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4 dark:text-white">{copy.emptyTitle}</h2>
        <p className="text-muted-foreground mb-8 dark:text-gray-400">
          {copy.emptyText}
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40">
          {copy.browse}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{copy.title}</h1>
          <p className="text-gray-400">{favorites.length} {copy.saved}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {favorites.map((event) => (
          <div
            key={event.id}
            onClick={() => onOpenFavorite(event)}
            className="surface-card rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer hover:border-purple-500/40"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 rounded-full px-3 py-1 backdrop-blur-sm bg-[rgba(238,231,249,0.88)] border border-[rgba(90,70,150,0.18)] dark:bg-black/60 dark:border-white/10">
                  <span className="text-primary text-sm font-medium dark:text-purple-400">{event.category}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-purple-400">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-primary dark:text-purple-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-primary dark:text-purple-400" />
                      <span>{event.location}{event.city ? `, ${event.city}` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFavorite(event);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
                  >
                    {copy.viewDetails}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(event.id);
                    }}
                    className="p-3 rounded-xl transition-all duration-300 group/btn bg-[rgba(94,72,166,0.12)] text-muted-foreground hover:bg-red-500/15 hover:text-red-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-600/20 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
