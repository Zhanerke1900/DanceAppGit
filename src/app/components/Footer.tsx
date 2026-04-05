import React from 'react';
import { Ticket, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { useI18n } from '../i18n';

interface FooterProps {
  onBecomeOrganizer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBecomeOrganizer }) => {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                DanceTime
              </span>
            </div>
            <p className="max-w-xs mb-8">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-purple-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.platform')}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.findEvents')}</a></li>
              <li>
                <button 
                  onClick={onBecomeOrganizer}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('common.becomeOrganizer')}
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.support')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.company')}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.careers')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.press')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.legal')}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.cookies')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">{t('footer.englishUs')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.status')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
