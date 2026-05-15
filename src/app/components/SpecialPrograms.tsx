import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, GraduationCap, Tent, LayoutGrid, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n';
import { EventCard } from './EventCard';
import {
  getLocalizedEventSearchValues,
  localizeCityName,
  localizeEventForDisplay,
  normalizeCity,
} from '../utils/localization';

const programCategories = ['All', 'Festivals', 'Competitions', 'Masterclasses', 'Camps'];

export interface Activity {
  id: string;
  name: string;
  type: 'Masterclass' | 'Battle' | 'Contest' | 'Camp';
  time: string;
  description: string;
  instructor?: string;
  price: number;
  ticketLimit?: number;
  soldTickets?: number;
  remainingTickets?: number | null;
  soldOut?: boolean;
  organizer?: {
    name: string;
    role: 'Host' | 'Co-organizer';
    avatar?: string;
  };
  location?: string;
}

const hasDisplayImage = (program: any) => Boolean(String(program?.image || '').trim());

interface SpecialProgramsProps {
  onBookTicket: (event: any) => void;
  selectedCity: string;
  favoriteIds?: string[];
  onToggleFavorite?: (event: any) => void;
  dynamicPrograms?: any[];
  expandedMode?: boolean;
  onExploreMore?: () => void;
  showExploreMoreButton?: boolean;
  searchQuery?: string;
  hideWhenEmptyDuringSearch?: boolean;
}

export const SpecialPrograms = ({
  onBookTicket,
  selectedCity,
  favoriteIds = [],
  onToggleFavorite,
  dynamicPrograms = [],
  expandedMode = false,
  onExploreMore,
  showExploreMoreButton = true,
  searchQuery = '',
  hideWhenEmptyDuringSearch = false,
}: SpecialProgramsProps) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { t, language } = useI18n();
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const isSearching = Boolean(normalizedSearchQuery);
  const selectedCityLabel = localizeCityName(selectedCity, language);
  const selectedCityKey = normalizeCity(selectedCity);

  const mergedPrograms = dynamicPrograms.filter(hasDisplayImage);

  const filteredPrograms = mergedPrograms.filter(p => {
    const matchesCategory = isSearching || activeCategory === 'All' || p.category === activeCategory;
    const matchesCity = isSearching || normalizeCity(p.city) === selectedCityKey;
    const matchesSearch = !normalizedSearchQuery || getLocalizedEventSearchValues(p, language)
      .some((value) => String(value || '').toLowerCase().includes(normalizedSearchQuery));

    return matchesCategory && matchesCity && matchesSearch;
  });
  const visiblePrograms = expandedMode || isSearching ? filteredPrograms : filteredPrograms.slice(0, 10);
  const cityProgramsCount = mergedPrograms.filter((program) => normalizeCity(program.city) === selectedCityKey).length;
  const shouldShowExploreMoreButton = showExploreMoreButton && !isSearching && cityProgramsCount > 10 && Boolean(onExploreMore);

  const getIcon = (category: string) => {
    switch (category) {
      case 'All': return <LayoutGrid className="w-4 h-4" />;
      case 'Festivals': return <Star className="w-4 h-4" />;
      case 'Competitions': return <Trophy className="w-4 h-4" />;
      case 'Masterclasses': return <GraduationCap className="w-4 h-4" />;
      case 'Camps': return <Tent className="w-4 h-4" />;
      default: return null;
    }
  };

  const categoryLabels: Record<string, string> = {
    All: t('specialPrograms.all'),
    Festivals: t('specialPrograms.festivals'),
    Competitions: t('specialPrograms.competitions'),
    Masterclasses: t('specialPrograms.masterclasses'),
    Camps: t('specialPrograms.camps'),
  };

  if (isSearching && hideWhenEmptyDuringSearch && visiblePrograms.length === 0) {
    return null;
  }

  return (
    <section className={`relative overflow-hidden border-t border-border bg-[linear-gradient(180deg,rgba(228,220,243,0.72)_0%,rgba(221,211,239,0.94)_100%)] dark:border-white/5 dark:bg-black dark:[background-image:none] ${isSearching ? 'py-8 sm:py-10' : 'py-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 ${isSearching ? 'mb-8' : 'mb-16'}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-[1px] bg-purple-500" />
              <span className="text-purple-400 font-bold uppercase tracking-widest text-xs">{t('specialPrograms.eyebrow')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground dark:text-white">
              {t('specialPrograms.titleStart')} <span className="text-purple-500">{t('specialPrograms.titleAccent')}</span>
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground dark:text-gray-400">
              {t('specialPrograms.description', { city: selectedCityLabel })}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {programCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative cursor-pointer border-b-2 px-0 py-2 text-sm font-bold transition-colors ${
                  activeCategory === category 
                    ? 'border-purple-500 text-purple-600 dark:text-purple-300'
                    : 'border-transparent text-muted-foreground hover:border-purple-400/50 hover:text-foreground dark:text-gray-500 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getIcon(category)}
                  {categoryLabels[category] || category}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {visiblePrograms.length > 0 ? (
              <motion.div
                key={`${selectedCity}-${activeCategory}-${normalizedSearchQuery}-${language}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid auto-rows-fr grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {visiblePrograms.map((program) => {
                  const programWithImage = {
                    ...program,
                    image: String(program.image || '').trim(),
                  };
                  const localizedProgram = localizeEventForDisplay(programWithImage, language);
                  const programId = program.id || `${program.title}-${program.time}-${program.location}`;

                  return (
                    <EventCard
                      key={programId}
                      id={programId}
                      image={programWithImage.image}
                      category={localizedProgram.category}
                      title={localizedProgram.title}
                      date={localizedProgram.time}
                      location={localizedProgram.location}
                      price={program.price}
                      remainingTickets={program.remainingTickets ?? null}
                      soldOut={Boolean(program.soldOut)}
                      onBuyTicket={() => onBookTicket(programWithImage)}
                      isFavorite={favoriteIds.includes(programId)}
                      onToggleFavorite={() => onToggleFavorite?.({
                        id: programId,
                        title: program.title,
                        date: program.time,
                        location: program.location,
                        city: program.city,
                        image: programWithImage.image,
                        category: program.category,
                        price: program.price,
                        eventData: programWithImage,
                      })}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-600/10">
                  <Sparkles className="w-10 h-10 text-purple-500/50" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 dark:text-white">
                  {t('specialPrograms.emptyTitle', {
                    category: activeCategory !== 'All' ? (categoryLabels[activeCategory] || activeCategory).toLowerCase() : '',
                    city: selectedCityLabel,
                  })}
                </h3>
                <p className="max-w-sm mx-auto text-muted-foreground dark:text-gray-400">
                  {t('specialPrograms.emptyDescription')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {shouldShowExploreMoreButton && (
          <div className="mt-20 text-center">
            <button
              onClick={onExploreMore}
              className="group inline-flex items-center gap-2 border-b-2 border-purple-500 px-1 py-3 font-bold text-foreground transition-colors hover:text-purple-700"
            >
              {t('common.exploreAllEvents')}
              <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
