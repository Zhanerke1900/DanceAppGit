import React from 'react';
import { useI18n } from '../i18n';

interface CTAProps {
  onBecomeOrganizer?: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onBecomeOrganizer }) => {
  const { t } = useI18n();

  return (
    <section id="cta" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#5f49c6_0%,#7d5ae0_58%,#a05df0_100%)] shadow-[0_30px_60px_rgba(88,63,170,0.28)] dark:bg-purple-600 dark:shadow-none">
          <div className="absolute inset-0 opacity-15">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(38,18,95,0.24),transparent_34%)]" />
          
          <div className="relative z-10 py-20 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {t('cta.title')}
              </h2>
              <p className="text-purple-100 text-lg mb-0">
                {t('cta.description')}
              </p>
            </div>
            
            <div className="flex w-full md:w-auto">
              <button 
                onClick={onBecomeOrganizer}
                className="w-full rounded-xl bg-[rgba(255,255,255,0.94)] px-8 py-4 text-center font-bold text-[#4d39b6] transition-all hover:bg-white dark:bg-white dark:text-purple-600 dark:hover:bg-purple-50"
              >
                {t('cta.button')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
