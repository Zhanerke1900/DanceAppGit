import React, { useMemo, useState } from 'react';
import { EventCard } from './EventCard';
import { motion, AnimatePresence } from 'motion/react';
import { MapPinOff } from 'lucide-react';
import { useI18n } from '../i18n';
import {
  getLocalizedEventSearchValues,
  localizeCityName,
  localizeEventForDisplay,
  normalizeCity as normalizeCityKey,
} from '../utils/localization';

interface FeaturedEventsProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  onBookTicket: (event: any) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (event: any) => void;
  dynamicEvents?: any[];
  expandedMode?: boolean;
  onExploreMore?: () => void;
  showExploreMoreButton?: boolean;
  searchQuery?: string;
  hideWhenEmptyDuringSearch?: boolean;
}

// Категории событий
const categories = ['All', 'Hip Hop', 'Contemporary', 'Ballet', 'Latin', 'Ballroom'];


const normalizeCity = (value: string) => {
  const normalized = String(value || '').trim().toLowerCase();
  const aliases: Record<string, string> = {
    'astana': 'astana',
    'nur-sultan': 'astana',
    'nursultan': 'astana',
    'астана': 'astana',
    'нур-султан': 'astana',
    'нурсултан': 'astana',
    'almaty': 'almaty',
    'алматы': 'almaty',
    'shymkent': 'shymkent',
    'шымкент': 'shymkent',
    'чимкент': 'shymkent',
    'karaganda': 'karaganda',
    'караганда': 'karaganda',
    'қарағанды': 'karaganda',
    'pavlodar': 'pavlodar',
    'павлодар': 'pavlodar',
    'aktobe': 'aktobe',
    'ақтөбе': 'aktobe',
    'актобе': 'aktobe',
    'atyrau': 'atyrau',
    'атырау': 'atyrau',
    'taraz': 'taraz',
    'тараз': 'taraz',
  };
  return aliases[normalized] || normalized;
};

const getEventId = (event: any) =>
  String(event?.id || event?._id || `${event?.title || ''}-${event?.date || ''}-${event?.location || ''}`).trim();

const dedupeEvents = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((event) => {
    const id = getEventId(event);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const FeaturedEvents = ({
  selectedCity,
  onCityChange,
  onBookTicket,
  favoriteIds = [],
  onToggleFavorite,
  dynamicEvents = [],
  expandedMode = false,
  onExploreMore,
  showExploreMoreButton = true,
  searchQuery = '',
  hideWhenEmptyDuringSearch = false,
}: FeaturedEventsProps) => {
  // Активная категория
  const [activeCategory, setActiveCategory] = useState('All');
  const { t, language } = useI18n();
  const categoryLabels: Record<string, string> = {
    All: t('featuredEvents.all'),
    'Hip Hop': t('featuredEvents.hipHop'),
    Contemporary: t('featuredEvents.contemporary'),
    Ballet: t('featuredEvents.ballet'),
    Latin: t('featuredEvents.latin'),
    Ballroom: t('featuredEvents.ballroom'),
  };

  const displayEvents = useMemo(() => dedupeEvents(dynamicEvents), [dynamicEvents]);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const isSearching = Boolean(normalizedSearchQuery);
  const currentCity = normalizeCityKey(selectedCity);
  const selectedCityLabel = localizeCityName(selectedCity, language);

  const cityEvents = useMemo(
    () =>
      displayEvents.filter((event) => {
        const eventCity = normalizeCityKey(event.city);
        return !eventCity || eventCity === currentCity;
      }),
    [currentCity, displayEvents]
  );

  const searchScopeEvents = isSearching ? displayEvents : cityEvents;
  // Фильтр событий
  const filteredEvents = searchScopeEvents.filter((event) => {
    const matchesCategory =
      isSearching ||
      activeCategory === 'All' ||
      String(event.category || '').trim().toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !normalizedSearchQuery || getLocalizedEventSearchValues(event, language)
      .some((value) => String(value || '').toLowerCase().includes(normalizedSearchQuery));

    return matchesCategory && matchesSearch;
  });
  // Видимые события
  const visibleEvents = expandedMode || isSearching ? filteredEvents : filteredEvents.slice(0, 10);

  const shouldShowExploreMoreButton =
    showExploreMoreButton && !isSearching && cityEvents.length >= 11;

  const handleExploreOtherCities = () => {
    const hub = normalizeCityKey(selectedCity) === 'almaty' ? 'Astana' : 'Almaty';
    onCityChange(hub);
  };

  if (isSearching && hideWhenEmptyDuringSearch && visibleEvents.length === 0) {
    return null;
  }

  return (
    <section id="events" className={`bg-background ${isSearching ? 'py-8 sm:py-10' : 'py-14 sm:py-20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-7 sm:mb-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.72fr)] lg:items-start lg:gap-12">
          <div>
            <div className="mb-3 h-px w-16 bg-purple-500" />
            <h2 className="font-display mb-4 text-4xl font-bold leading-[0.95] text-foreground sm:text-5xl">
              {t('featuredEvents.title', { city: selectedCityLabel })}
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('featuredEvents.description', { city: selectedCityLabel })}
            </p>
          </div>
          <div className="w-full space-y-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative cursor-pointer border-b-2 px-0 py-2 text-sm font-bold transition-colors ${
                    activeCategory === category
                      ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                      : 'border-transparent text-muted-foreground hover:border-purple-400/50 hover:text-foreground'
                  }`}
                >
                  {categoryLabels[category] || category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {visibleEvents.length > 0 ? (
              <motion.div
                key={`${selectedCity}-${activeCategory}-${normalizedSearchQuery}-${language}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="event-catalog-grid grid auto-rows-fr grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 xl:grid-cols-5"
              >
                {visibleEvents.map((event) => {
                  const eventWithImage = {
                    ...event,
                    image: String(event.image || '').trim(),
                  };
                  const localizedEvent = localizeEventForDisplay(eventWithImage, language);
                  const eventId = getEventId(event);

                  return (
                    // Карточка события
                    <EventCard
                      key={eventId}
                      id={eventId}
                      image={eventWithImage.image}
                      category={localizedEvent.category}
                      title={localizedEvent.title}
                      date={localizedEvent.date}
                      location={localizedEvent.location}
                      price={event.price}
                      remainingTickets={event.remainingTickets ?? null}
                      soldOut={Boolean(event.soldOut)}
                      onBuyTicket={() => onBookTicket(eventWithImage)}
                      isFavorite={favoriteIds.includes(eventId)}
                      onToggleFavorite={() => onToggleFavorite?.({
                        id: eventId,
                        title: event.title,
                        date: event.date,
                        location: event.location,
                        city: event.city,
                        image: eventWithImage.image,
                        category: event.category,
                        price: event.price,
                        eventData: eventWithImage,
                      })}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-24 h-24 bg-purple-600/10 rounded-3xl flex items-center justify-center mb-8 rotate-3">
                  <MapPinOff className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {searchQuery.trim()
                    ? t('featuredEvents.searchEmptyTitle')
                    : t('featuredEvents.emptyTitle', {
                      category: activeCategory !== 'All' ? categoryLabels[activeCategory] || activeCategory : '',
                    })}
                </h3>
                <p className="text-muted-foreground max-w-sm mb-10 leading-relaxed">
                  {searchQuery.trim()
                    ? t('featuredEvents.searchEmptyDescription')
                    : t('featuredEvents.emptyDescription', { city: selectedCityLabel })}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleExploreOtherCities}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                  >
                    {t('featuredEvents.exploreOtherCities')}
                  </button>
                  <button
                    onClick={() => setActiveCategory('All')}
                    className="px-8 py-3 bg-card hover:bg-accent text-foreground rounded-xl border border-border font-bold transition-all active:scale-95"
                  >
                    {t('featuredEvents.viewAllStyles', { city: selectedCityLabel })}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {shouldShowExploreMoreButton && (
          <div className="mt-20 text-center">
            <button onClick={onExploreMore ?? handleExploreOtherCities} className="group inline-flex items-center gap-2 border-b-2 border-purple-500 px-1 py-3 font-bold text-foreground transition-colors hover:text-purple-700">
              {t('common.exploreAllEvents')}
              <span className="text-xl transition-transform group-hover:translate-x-1">-&gt;</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
