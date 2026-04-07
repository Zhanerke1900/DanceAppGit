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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-purple-400 group"
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
              className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden hidden md:block"
            >
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder={t('common.searchCity')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
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
                          ? 'bg-purple-600/10 text-purple-400' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] md:hidden"
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
                className="fixed bottom-0 left-0 right-0 max-h-[88dvh] bg-gray-900 rounded-t-3xl z-[210] flex flex-col md:hidden border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
              >
                <div className="p-5 pb-4">
                  <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-white/20" />
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-500" />
                      {t('common.selectCity')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-full bg-white/5 text-gray-400"
                      aria-label="Close city selector"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder={t('common.searchCityKazakhstan')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                  <div className="grid grid-cols-1 gap-2">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          type="button"
                          key={city}
                          onClick={() => handleSelect(city)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl text-lg font-medium transition-all ${
                            selectedCity === city
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                              : 'bg-white/5 text-gray-300 active:scale-95'
                          }`}
                        >
                          {city}
                          {selectedCity === city && <Check className="w-5 h-5" />}
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
