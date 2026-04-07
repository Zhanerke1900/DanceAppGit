import React from 'react';
import { Ticket, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { useI18n } from '../i18n';

interface FooterProps {
  onBecomeOrganizer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBecomeOrganizer }) => {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-900 py-6 text-sm text-gray-400 md:py-16 md:text-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-5 md:grid-cols-4 md:gap-12 lg:grid-cols-5 md:mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2 md:mb-6">
              <div className="rounded-lg bg-purple-600 p-1.5 md:p-2">
                <Ticket className="h-4 w-4 text-white md:h-6 md:w-6" />
              </div>
              <span className="text-base font-bold text-white md:text-xl">
                DanceTime
              </span>
            </div>
            <p className="mb-3 max-w-xs text-xs leading-relaxed md:mb-8 md:text-base">
              {t('footer.description')}
            </p>
            <div className="flex gap-3 md:gap-4">
              <a href="#" className="transition-colors hover:text-purple-400"><Twitter className="h-4 w-4 md:h-5 md:w-5" /></a>
              <a href="#" className="transition-colors hover:text-purple-400"><Instagram className="h-4 w-4 md:h-5 md:w-5" /></a>
              <a href="#" className="transition-colors hover:text-purple-400"><Facebook className="h-4 w-4 md:h-5 md:w-5" /></a>
              <a href="#" className="transition-colors hover:text-purple-400"><Linkedin className="h-4 w-4 md:h-5 md:w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-white md:mb-6 md:text-base md:normal-case md:tracking-normal">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-xs md:space-y-4 md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.findEvents')}</a></li>
              <li>
                <button 
                  onClick={onBecomeOrganizer}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('common.becomeOrganizer')}
                </button>
              </li>
              <li className="hidden md:list-item"><a href="#" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
              <li className="hidden md:list-item"><a href="#" className="hover:text-white transition-colors">{t('footer.support')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-white md:mb-6 md:text-base md:normal-case md:tracking-normal">{t('footer.company')}</h4>
            <ul className="space-y-2 text-xs md:space-y-4 md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
              <li className="hidden md:list-item"><a href="#" className="hover:text-white transition-colors">{t('footer.careers')}</a></li>
              <li className="hidden md:list-item"><a href="#" className="hover:text-white transition-colors">{t('footer.press')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-white md:mb-6 md:text-base md:normal-case md:tracking-normal">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-xs md:space-y-4 md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              <li className="hidden md:list-item"><a href="#" className="hover:text-white transition-colors">{t('footer.cookies')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-2 border-t border-gray-800 pt-4 text-xs md:mt-0 md:flex-row md:gap-4 md:pt-8 md:text-sm">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-4 md:gap-8">
            <a href="#" className="hover:text-white transition-colors">{t('footer.englishUs')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.status')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
