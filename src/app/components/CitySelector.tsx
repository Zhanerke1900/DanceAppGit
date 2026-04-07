import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

const cities = [
  "Astana", "Almaty", "Shymkent", "Karaganda", 
  "Aktobe", "Taraz", "Pavlodar", "Ust-Kamenogorsk"
];

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export const CitySelector = ({ selectedCity, onCityChange }: CitySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const canUseDom = typeof document !== 'undefined';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideMobileSheet = mobileSheetRef.current?.contains(target);

      if (!isInsideDropdown && !isInsideMobileSheet) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !canUseDom) return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [canUseDom, isOpen]);

  const handleSelect = (city: string) => {
    onCityChange(city);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex touch-manipulation items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-primary dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-purple-400 group"
      >
        <MapPin className="w-4 h-4 text-purple-500" />
        <span className="font-medium text-sm">{selectedCity}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Desktop Dropdown */}
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 overflow-hidden hidden md:block rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl z-[60] dark:border-white/10 dark:bg-gray-900"
            >
              <div className="p-3 border-b border-border dark:border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder={t('common.searchCity')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-background py-2 pl-9 pr-4 text-base text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 md:text-sm dark:border-white/10 dark:bg-black/50 dark:text-white"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => handleSelect(city)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCity === city 
                          ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      {city}
                      {selectedCity === city && <Check className="w-4 h-4" />}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    {t('common.noResults')}
                  </div>
                )}
              </div>
            </motion.div>

          </>
        )}
      </AnimatePresence>

      {canUseDom && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] md:hidden dark:bg-black/80"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                role="dialog"
                aria-modal="true"
                aria-label={t('common.selectCity')}
                ref={mobileSheetRef}
                className="fixed bottom-0 left-0 right-0 max-h-[64dvh] rounded-t-2xl z-[210] flex flex-col md:hidden border-t border-border bg-popover text-popover-foreground shadow-[0_-20px_60px_rgba(52,43,76,0.2)] dark:border-white/10 dark:bg-gray-900 dark:text-white dark:shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
              >
                <div className="p-4 pb-3">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30 dark:bg-white/20" />
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 dark:text-white">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      {t('common.selectCity')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg bg-accent text-muted-foreground dark:bg-white/5 dark:text-gray-400"
                      aria-label="Close city selector"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder={t('common.searchCityKazakhstan')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-border bg-input-background py-3 pl-10 pr-3 text-base text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 dark:border-white/10 dark:bg-black/50 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <div className="grid grid-cols-1 gap-1.5">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          type="button"
                          key={city}
                          onClick={() => handleSelect(city)}
                          className={`w-full touch-manipulation flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            selectedCity === city
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                              : 'bg-accent text-foreground dark:bg-white/5 dark:text-gray-300'
                          }`}
                        >
                          {city}
                          {selectedCity === city && <Check className="w-4 h-4" />}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-6 text-center text-sm text-gray-500">
                        {t('common.noResults')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
