import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    onCityChange(city);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground group"
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
              className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-xl shadow-[0_18px_40px_rgba(35,31,54,0.12)] z-[60] overflow-hidden hidden md:block"
            >
              <div className="p-3 border-b border-border/70">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Search city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-input-background border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSelect(city)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCity === city 
                          ? 'bg-purple-600/10 text-purple-700' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {city}
                      {selectedCity === city && <Check className="w-4 h-4" />}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No cities found
                  </div>
                )}
              </div>
            </motion.div>

            {/* Mobile Bottom Sheet Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] md:hidden"
            />
            
            {/* Mobile Bottom Sheet Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-popover rounded-t-3xl z-[80] flex flex-col md:hidden border-t border-border"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    Select City
                  </h3>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full bg-accent text-muted-foreground"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Search city in Kazakhstan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-input-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-12">
                <div className="grid grid-cols-1 gap-2">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSelect(city)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-lg font-medium transition-all ${
                        selectedCity === city 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                          : 'bg-card text-foreground border border-border active:scale-95'
                      }`}
                    >
                      {city}
                      {selectedCity === city && <Check className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
