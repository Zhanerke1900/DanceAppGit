import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';
import darkHeroImage from './IMG_5075.PNG';
import lightHeroImage from './IMG_5076.PNG';

export const Hero = () => {
  const [themeImage, setThemeImage] = useState<string>(lightHeroImage);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const updateTheme = () => {
      if (typeof document === 'undefined') return;
      const isDark = document.documentElement.classList.contains('dark');
      setThemeMode(isDark ? 'dark' : 'light');
      setThemeImage(isDark ? darkHeroImage : lightHeroImage);
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={themeImage}
          alt="Dance performance"
          className="w-full h-full object-cover"
        />
        {themeMode === 'dark' ? (
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/10" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(238,231,248,0.78) 0%, rgba(238,231,248,0.5) 42%, rgba(238,231,248,0.12) 100%)',
            }}
          />
        )}
        {themeMode === 'light' && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at top left, rgba(119,101,198,0.3), transparent 24%), radial-gradient(circle at bottom right, rgba(103,84,183,0.18), transparent 22%), linear-gradient(110deg, rgba(146,126,217,0.14), rgba(222,216,243,0.02))',
            }}
          />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className={`inline-block py-1 px-4 rounded-full text-sm font-medium mb-6 ${
            themeMode === 'dark'
              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-100'
              : 'bg-purple-500/12 border border-purple-500/20 text-purple-800'
          }`}>
            The Biggest Dance Ticketing Platform in Kazakhstan
          </span>
          <h1
            className={`text-5xl md:text-7xl font-bold leading-tight mb-6 ${
              themeMode === 'dark' ? 'text-white' : 'text-purple-950'
            }`}
          >
            Experience Every{' '}
            <span className={themeMode === 'dark' ? 'text-purple-300' : 'text-purple-600 underline decoration-purple-300/50'}>
              Beat
            </span>{' '}
            Live
          </h1>
          <p className={`text-xl mb-10 max-w-lg ${themeMode === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
            Streamline your dance events with the world's most intuitive ticketing system. From local workshops to global festivals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={scrollToEvents}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all hover:scale-105 shadow-lg shadow-purple-600/20"
            >
              Explore Events <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden ${
                  themeMode === 'dark'
                    ? 'border-purple-600 bg-slate-900/80'
                    : 'border-white bg-white/85 shadow-sm shadow-purple-900/10'
                }`}>
                   <ImageWithFallback 
                    src={`https://i.pravatar.cc/150?u=${i}`} 
                    alt="User"
                    className="w-full h-full object-cover"
                   />
                </div>
              ))}
            </div>
            <p className={`text-sm ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              <span className={`font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>200+</span> dancers already joined
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
