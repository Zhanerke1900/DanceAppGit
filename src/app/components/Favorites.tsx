import React from 'react';
import { Heart, Calendar, MapPin, Trash2 } from 'lucide-react';

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

  if (favorites.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-6">
          <Heart className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h2>
        <p className="text-gray-400 mb-8">
          Start adding events to your favorites to keep track of the ones you love!
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40">
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Favorites</h1>
          <p className="text-gray-400">{favorites.length} saved event{favorites.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {favorites.map((event) => (
          <div
            key={event.id}
            onClick={() => onOpenFavorite(event)}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-purple-400 text-sm font-medium">{event.category}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4 text-purple-400" />
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
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(event.id);
                    }}
                    className="p-3 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-xl transition-all duration-300 group/btn"
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
