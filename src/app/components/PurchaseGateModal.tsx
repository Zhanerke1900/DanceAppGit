import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { motion } from 'motion/react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { useI18n } from '../i18n';

interface PurchaseGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const PurchaseGateModal = ({ isOpen, onClose, onLogin, onRegister }: PurchaseGateModalProps) => {
  const { t, language } = useI18n() as ReturnType<typeof useI18n> & { language: 'en' | 'ru' | 'kk' };
  const copy = {
    title: language === 'ru' ? 'Завершите бронирование' : language === 'kk' ? 'Брондауды аяқтаңыз' : 'Complete Your Booking',
    description:
      language === 'ru'
        ? 'Пожалуйста, войдите или создайте аккаунт, чтобы продолжить покупку.'
        : language === 'kk'
          ? 'Сатып алуды жалғастыру үшін кіріңіз немесе аккаунт ашыңыз.'
          : 'Please log in or create an account to continue your purchase.',
    continueBrowsing: language === 'ru' ? 'Продолжить просмотр' : language === 'kk' ? 'Қарауды жалғастыру' : 'Continue browsing',
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-500/20 text-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">{copy.title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            className="flex items-center justify-center gap-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            {t('auth.login')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRegister}
            className="flex items-center justify-center gap-3 w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold transition-all border border-purple-500/30 hover:border-purple-500/60 group"
          >
            <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            {t('auth.createAccount')}
          </motion.button>
        </div>

        <DialogFooter className="sm:justify-center">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
          >
            {copy.continueBrowsing}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
