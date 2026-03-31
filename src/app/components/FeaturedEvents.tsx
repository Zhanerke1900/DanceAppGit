import React, { useState } from 'react';
import { EventCard } from './EventCard';
import { motion, AnimatePresence } from 'motion/react';
import { MapPinOff } from 'lucide-react';

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
}

const categories = ['All', 'Hip Hop', 'Contemporary', 'Ballet', 'Latin', 'Ballroom'];

const events = [
  {
    category: "Hip Hop",
    title: "Astana Street Battle 2026",
    date: "April 15, 2026",
    location: "Astana, Kazakhstan",
    city: "Astana",
    price: "5,000 ₸",
    image: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXAlMjBob3AlMjBkYW5jZXxlbnwxfHx8fDE3NzAwMzA4MjF8MA"
  },
  {
    category: "Ballet",
    title: "Almaty Grand Opera Night",
    date: "April 02, 2026",
    location: "Abay Opera House, Almaty",
    city: "Almaty",
    price: "12,000 ₸",
    image: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxsZXR8ZW58MXx8fHwxNzcwMDMwODIxfDA"
  },
  {
    category: "Contemporary",
    title: "Shymkent Modern Dance Fest",
    date: "May 12, 2026",
    location: "Turkestan Hall, Shymkent",
    city: "Shymkent",
    price: "4,500 ₸",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBkYW5jZXxlbnwxfHx8fDE3NzAwMzA4MjF8MA"
  },
  {
    category: "Festival",
    title: "Karaganda Groove Days",
    date: "June 20-22, 2026",
    location: "Central Park, Karaganda",
    city: "Karaganda",
    price: "8,000 ₸",
    image: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMGZlc3RpdmFsfGVufDF8fHx8MTc3MDAzMDgyMXww"
  },
  {
    category: "Latin",
    title: "Salsa Night in Aktobe",
    date: "July 10, 2026",
    location: "Social Club, Aktobe",
    city: "Aktobe",
    price: "3,000 ₸",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxzYSUyMGRhbmNlJTIwcGFydHl8ZW58MXx8fHwxNzcwMDMwODIxfDA"
  },
  {
    category: "Ballroom",
    title: "Astana Waltz Invitationals",
    date: "August 05, 2026",
    location: "Radisson Hotel, Astana",
    city: "Astana",
    price: "15,000 ₸",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxscm9vbSUyMGRhbmNlfGVufDF8fHx8MTc3MDAzMDgyMXww"
  },
  {
    category: "Traditional",
    title: "Pavlodar Folk Heritage",
    date: "September 18, 2026",
    location: "City Palace, Pavlodar",
    city: "Pavlodar",
    price: "4,000 ₸",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVlc3R5bGUlMjBkYW5jZXxlbnwxfHx8fDE3NzAwMzA4MjF8MA"
  },
  {
    category: "Hip Hop",
    title: "Ust-Kamenogorsk Freestyle",
    date: "October 24, 2026",
    location: "Sports Arena, Ust-Kamenogorsk",
    city: "Ust-Kamenogorsk",
    price: "6,000 ₸",
    image: "https://images.unsplash.com/photo-1502519144081-acca18599776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHicmVha2RhbmNlfGVufDF8fHx8MTc3MDAzMDgyMXww"
  },
  {
    category: "Ballroom",
    title: "Almaty Ballroom Masters",
    date: "November 12, 2026",
    location: "Rixos, Almaty",
    city: "Almaty",
    price: "10,000 ₸",
    image: "https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxscm9vbSUyMGRhbmNlJTIwcGFydHl8ZW58MXx8fHwxNzcwMDMwODIxfDA"
  },
  {
    category: "Contemporary",
    title: "Astana Contemporary Showcase",
    date: "April 28, 2026",
    location: "National Opera, Astana",
    city: "Astana",
    price: "7,500 ₸",
    image: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBkYW5jZXxlbnwxfHx8fDE3NzAwMzA4MjF8MA"
  },
  {
    category: "Latin",
    title: "Almaty Latin Heat",
    date: "April 18, 2026",
    location: "Dostyk Plaza, Almaty",
    city: "Almaty",
    price: "5,500 ₸",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxzYSUyMGRhbmNlJTIwcGFydHl8ZW58MXx8fHwxNzcwMDMwODIxfDA"
  },
  {
    category: "Ballet",
    title: "Astana Ballet Spring Gala",
    date: "May 05, 2026",
    location: "Kazakhstan Opera, Astana",
    city: "Astana",
    price: "18,000 ₸",
    image: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxsZXR8ZW58MXx8fHwxNzcwMDMwODIxfDA"
  },
  {
    category: "Hip Hop",
    title: "Almaty B-Boy Battle",
    date: "June 08, 2026",
    location: "Central Stadium, Almaty",
    city: "Almaty",
    price: "4,000 ₸",
    image: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXAlMjBob3AlMjBkYW5jZXxlbnwxfHx8fDE3NzAwMzA4MjF8MA"
  },
  {
    category: "Festival",
    title: "Astana Dance Festival 2026",
    date: "July 15-17, 2026",
    location: "Expo City, Astana",
    city: "Astana",
    price: "9,500 ₸",
    image: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMGZlc3RpdmFsfGVufDF8fHx8MTc3MDAzMDgyMXww"
  },
  {
    category: "Contemporary",
    title: "Almaty Modern Movement",
    date: "August 22, 2026",
    location: "Almaty Theatre, Almaty",
    city: "Almaty",
    price: "6,500 ₸",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBkYW5jZXxlbnwxfHx8fDE3NzAwMzA4MjF8MA"
  },
  {
    category: "Ballroom",
    title: "Shymkent Tango Night",
    date: "September 09, 2026",
    location: "Grand Hotel, Shymkent",
    city: "Shymkent",
    price: "7,000 ₸",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxscm9vbSUyMGRhbmNlfGVufDF8fHx8MTc3MDAzMDgyMXww"
  },
  {
    category: "Hip Hop",
    title: "Karaganda Urban Jam",
    date: "October 10, 2026",
    location: "Youth Center, Karaganda",
    city: "Karaganda",
    price: "3,500 ₸",
    image: "https://images.unsplash.com/photo-1502519144081-acca18599776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHicmVha2RhbmNlfGVufDF8fHx8MTc3MDAzMDgyMXww"
  },
  {
    category: "Latin",
    title: "Pavlodar Bachata Social",
    date: "November 20, 2026",
    location: "Dance Studio, Pavlodar",
    city: "Pavlodar",
    price: "2,500 ₸",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxzYSUyMGRhbmNlJTIwcGFydHl8ZW58MXx8fHwxNzcwMDMwODIxfDA"
  }
  ,
  {
    category: "Hip Hop",
    title: "Astana Beat District",
    date: "December 03, 2026",
    location: "Freedom Hall, Astana",
    city: "Astana",
    price: "5,500 в‚ё",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Contemporary",
    title: "Astana Motion Theatre",
    date: "December 12, 2026",
    location: "Art Residence, Astana",
    city: "Astana",
    price: "6,500 в‚ё",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Latin",
    title: "Bachata Under Lights",
    date: "December 18, 2026",
    location: "Skyline Club, Astana",
    city: "Astana",
    price: "4,000 в‚ё",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Ballroom",
    title: "Astana Winter Ballroom Cup",
    date: "January 16, 2027",
    location: "Congress Hall, Astana",
    city: "Astana",
    price: "13,000 в‚ё",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  }
];

const extraEvents = [
  {
    category: "Hip Hop",
    title: "Astana Cypher Sessions",
    date: "September 03, 2026",
    location: "Creative Hub, Astana",
    city: "Astana",
    price: "4,500 ₸",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Contemporary",
    title: "Movement Lab Astana",
    date: "September 14, 2026",
    location: "Art Space, Astana",
    city: "Astana",
    price: "6,000 ₸",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Ballet",
    title: "Prima Youth Gala",
    date: "October 02, 2026",
    location: "Opera Studio, Astana",
    city: "Astana",
    price: "11,000 ₸",
    image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Latin",
    title: "Astana Salsa Weekend",
    date: "October 18, 2026",
    location: "Downtown Hall, Astana",
    city: "Astana",
    price: "5,000 ₸",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Ballroom",
    title: "Capital Ballroom Showcase",
    date: "November 07, 2026",
    location: "Congress Center, Astana",
    city: "Astana",
    price: "9,000 ₸",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    category: "Hip Hop",
    title: "Night Moves Street Jam",
    date: "November 21, 2026",
    location: "Urban Stage, Astana",
    city: "Astana",
    price: "4,000 ₸",
    image: "https://images.unsplash.com/photo-1502519144081-acca18599776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
];

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
}: FeaturedEventsProps) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const mergedEvents = expandedMode
    ? [...dynamicEvents, ...events, ...extraEvents]
    : [...dynamicEvents, ...events];

  const filteredEvents = mergedEvents.filter(event => {
    const matchesCity = event.city === selectedCity;
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    return matchesCity && matchesCategory;
  });
  const visibleEvents = expandedMode ? filteredEvents : filteredEvents.slice(0, 8);

  const cityEventsCount = mergedEvents.filter((event) => event.city === selectedCity).length;
  const shouldShowExploreMoreButton = showExploreMoreButton && cityEventsCount >= 9;

  const handleExploreOtherCities = () => {
    // If the style exists in other cities, switch to a hub that has most events
    const hub = selectedCity === 'Almaty' ? 'Astana' : 'Almaty';
    onCityChange(hub);
  };

  return (
    <section id="events" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Events in <span className="text-purple-400">{selectedCity}</span>
            </h2>
            <p className="text-gray-400 max-w-xl">
              Discover and book tickets for the hottest dance performances, workshops, and competitions in {selectedCity}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer relative overflow-hidden ${
                  activeCategory === category 
                    ? 'text-white' 
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {activeCategory === category && (
                  <motion.div 
                    layoutId="activePill"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {visibleEvents.length > 0 ? (
              <motion.div 
                key={`${selectedCity}-${activeCategory}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {visibleEvents.map((event, index) => (
                  (() => {
                    const eventId = event.id || `${event.title}-${event.date}-${event.location}`;
                    return (
                  <EventCard 
                    key={`${eventId}-${index}`} 
                    id={eventId}
                    image={event.image}
                    category={event.category}
                    title={event.title}
                    date={event.date}
                    location={event.location}
                    price={event.price}
                    remainingTickets={event.remainingTickets ?? null}
                    soldOut={Boolean(event.soldOut)}
                    onBuyTicket={() => onBookTicket(event)}
                    isFavorite={favoriteIds.includes(eventId)}
                    onToggleFavorite={() => onToggleFavorite?.({
                      id: eventId,
                      title: event.title,
                      date: event.date,
                      location: event.location,
                      city: event.city,
                      image: event.image,
                      category: event.category,
                      price: event.price,
                      eventData: event,
                    })}
                  />
                    );
                  })()
                ))}
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
                <h3 className="text-2xl font-bold text-white mb-3">
                  No {activeCategory !== 'All' ? activeCategory : ''} events found in your city
                </h3>
                <p className="text-gray-400 max-w-sm mb-10 leading-relaxed">
                  No events found in {selectedCity} for this style yet. Don't worry, there's plenty of dance elsewhere in Kazakhstan!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleExploreOtherCities}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                  >
                    Explore other cities
                  </button>
                  <button 
                    onClick={() => setActiveCategory('All')}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold transition-all active:scale-95"
                  >
                    View all styles in {selectedCity}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {shouldShowExploreMoreButton && <div className="mt-20 text-center">
          <button onClick={onExploreMore ?? handleExploreOtherCities} className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all group">
            Explore All Events
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>}
      </div>
    </section>
  );
};
