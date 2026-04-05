import React, { useEffect, useState } from 'react';
import { Smartphone, BarChart3, Globe, ShieldCheck, Users, Zap } from 'lucide-react';
import { useI18n } from '../i18n';

const features = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Mobile First Ticketing",
    description: "Digital tickets with unique QR codes. Easy entry management right from your phone."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-time Analytics",
    description: "Track sales, attendee demographics, and marketing ROI in real-time."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Reach",
    description: "Support for 20+ currencies and localized payment methods for international tours."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Secure Payments",
    description: "PCI-compliant payment processing with fraud protection for every transaction."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Tools",
    description: "Engage your audience with pre-sale access, newsletters, and loyalty rewards."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Setup",
    description: "Launch your event page in under 5 minutes with our drag-and-drop builder."
  }
];

export const Features = () => {
  const [isDark, setIsDark] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const updateTheme = () => {
      if (typeof document === 'undefined') return;
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      className={`py-24 border-y ${
        isDark
          ? 'bg-gray-950 border-white/5'
          : 'bg-gradient-to-b from-[#d7c6ee] via-[#e2d3f3] to-[#d9caee] border-[rgba(83,69,130,0.20)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className={`font-semibold tracking-wide uppercase text-sm mb-3 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>{t('features.eyebrow')}</h2>
          <p className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#20172f]'}`}>{t('features.title')}</p>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-[#544c6b]'}`}>
            {t('features.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className={`flex gap-6 rounded-3xl px-6 py-7 ${isDark ? 'bg-transparent' : 'surface-card'}`}>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_8px_20px_rgba(91,78,224,0.08)] ${
                isDark
                  ? 'bg-purple-600/10 text-purple-400 border border-purple-400/20'
                  : 'surface-soft text-purple-700'
              }`}>
                {feature.icon}
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#221730]'}`}>{t(`features.items.${index}.title`)}</h3>
                <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-[#554d6d]'}`}>
                  {t(`features.items.${index}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
