import React from 'react';
import { Smartphone, BarChart3, Globe, ShieldCheck, Users, Zap } from 'lucide-react';

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
  return (
    <section id="about" className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-purple-400 font-semibold tracking-wide uppercase text-sm mb-3">Built for Organizers</h2>
          <p className="text-4xl font-bold text-white mb-6">Everything you need to host a sell-out dance event</p>
          <p className="text-xl text-gray-400">
            Powerful tools designed specifically for the unique needs of the dance community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-400/20">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
