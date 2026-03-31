import React from 'react';
import { Star } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

const testimonials = [
  {
    content: "DancePass changed how we manage our annual festival. The QR scanning is lightning fast and our attendees love the mobile tickets.",
    author: "Aruzhan",
    role: "President of Dance Club, Astana IT University",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    content: "The analytics tools are a game-changer. We can see exactly where our ticket sales are coming from and adjust our marketing on the fly.",
    author: "Kuralay Telgarina",
    role: "Active Dancer, 10+ years of Ballroom Dancing",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  },
  {
    content: "Support is incredible. Whenever we have a question, they're there in minutes. Highly recommended for any dance event organizer.",
    author: "Aiymgul Alpysbayeva",
    role: "Vice-President of Dance Club, Astana IT University",
    avatar: "https://i.pravatar.cc/150?u=elena"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Trusted by the best in the industry</h2>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-purple-400 text-purple-400" />
            ))}
          </div>
          <p className="text-gray-400">4.9/5 average rating from over 120+ organizers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gray-900 p-8 rounded-2xl shadow-sm border border-white/5 hover:border-purple-500/30 transition-all">
              <p className="text-gray-300 italic mb-8">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <ImageWithFallback src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{t.author}</h4>
                  <p className="text-sm text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
