import React from 'react';

interface CTAProps {
  onBecomeOrganizer?: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onBecomeOrganizer }) => {
  return (
    <section id="cta" className="py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-purple-600">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          
          <div className="relative z-10 py-20 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to take your event to the next level?
              </h2>
              <p className="text-purple-100 text-lg mb-0">
                Join 70+ organizers who trust DanceTime for their ticketing, marketing, and management.
              </p>
            </div>
            
            <div className="flex w-full md:w-auto">
              <button 
                onClick={onBecomeOrganizer}
                className="w-full bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all text-center"
              >
                Become an Organizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
