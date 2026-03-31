import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1524330685423-3e1966445abe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBkYW5jZSUyMHN0YWdlJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzcwMDMwODIxfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Dance performance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="inline-block py-1 px-4 rounded-full bg-purple-600/20 border border-purple-400/30 text-purple-300 text-sm font-medium mb-6">
            The Biggest Dance Ticketing Platform in Kazakhstan
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Experience Every <span className="text-purple-400 underline decoration-purple-400/50">Beat</span> Live
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-lg">
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
                <div key={i} className="w-10 h-10 rounded-full border-2 border-purple-900 bg-gray-800 flex items-center justify-center overflow-hidden">
                   <ImageWithFallback 
                    src={`https://i.pravatar.cc/150?u=${i}`} 
                    alt="User"
                    className="w-full h-full object-cover"
                   />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-white font-bold">200+</span> dancers already joined
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
