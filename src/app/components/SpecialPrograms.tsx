import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, GraduationCap, Tent, Clock, MapPin, ChevronRight, Ticket, LayoutGrid, Sparkles, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useI18n } from '../i18n';

const programCategories = ['All', 'Festivals', 'Competitions', 'Masterclasses', 'Camps'];

export interface Activity {
  id: string;
  name: string;
  type: 'Masterclass' | 'Battle' | 'Contest' | 'Camp';
  time: string;
  description: string;
  instructor?: string;
  price: number;
  ticketLimit?: number;
  soldTickets?: number;
  remainingTickets?: number | null;
  soldOut?: boolean;
  organizer?: {
    name: string;
    role: 'Host' | 'Co-organizer';
    avatar?: string;
  };
  location?: string;
}

interface Program {
  id?: string;
  category: string;
  title: string;
  time: string;
  location: string;
  city: string;
  price: string;
  image: string;
  description: string;
  longDescription: string;
  highlights: string[];
  targetAudience: string;
  activities: Activity[];
  ticketLimit?: number;
  soldTickets?: number;
  remainingTickets?: number | null;
  soldOut?: boolean;
}

export const programs: Program[] = [
  {
    category: "Festivals",
    title: "Almaty Summer Dance Fest",
    time: "June 15-20, 2026",
    location: "Park of 28 Panfilov Guardsmen",
    city: "Almaty",
    price: "From 15,000 ₸",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1000",
    description: "6 days of open-air workshops, night parties, and showcase performances under the stars.",
    longDescription: "Experience the magic of summer dancing under the open sky at Almaty's most anticipated dance festival. Six full days of intensive workshops, evening performances, and late-night parties bring together Kazakhstan's finest dancers and international guest instructors. From sunrise flow sessions to midnight freestyle jams, immerse yourself in a complete dance experience surrounded by nature and community.",
    highlights: ["International guest instructors", "Open-air dance floors", "Evening showcases", "Networking opportunities", "All-level workshops"],
    targetAudience: "Dancers of all levels, from beginners looking to learn to professionals seeking to expand their network and refine their skills.",
    activities: [
      { 
        id: 'f1_a1', 
        name: "Opening Gala Showcase", 
        type: "Contest" as const, 
        time: "18:00 - 21:00", 
        description: "Grand opening with top teams showcase. Witness the best dance crews from across Kazakhstan perform their signature pieces on the main stage.", 
        price: 5000,
        organizer: { name: "DanceTime Events", role: "Host" as const },
        location: "Main Stage"
      },
      { 
        id: 'f1_a2', 
        name: "Social Night Party", 
        type: "Camp" as const, 
        time: "21:00 - 01:00", 
        description: "Open floor social dancing with live DJs. Dance freely, make connections, and enjoy the music under the stars.", 
        price: 3000,
        organizer: { name: "DJ Collective KZ", role: "Co-organizer" as const },
        location: "Garden Arena"
      },
      { 
        id: 'f1_a3', 
        name: "Morning Flow Workshop", 
        type: "Masterclass" as const, 
        time: "09:00 - 10:30", 
        description: "Start your day with fluid movements. A gentle warm-up session combining yoga and contemporary movement to energize your body.", 
        price: 4000,
        organizer: { name: "Flow Studios Almaty", role: "Co-organizer" as const },
        location: "Pavilion A"
      }
    ]
  },
  {
    category: "Festivals",
    title: "Astana Digital Dance Week",
    time: "July 05-12, 2026",
    location: "Expo City, Astana",
    city: "Astana",
    price: "From 20,000 ₸",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
    description: "Intersection of technology and movement featuring VR dance experiences and global livestreams.",
    longDescription: "Step into the future of dance at Astana Digital Dance Week, where cutting-edge technology meets human expression. This pioneering event explores the intersection of dance, VR, motion capture, and digital art. Participate in immersive workshops, compete in battles with real-time visual effects, and experience performances that blur the line between physical and digital reality.",
    highlights: ["VR dance experiences", "Motion capture workshops", "Global livestream performances", "Digital art installations", "Tech-enhanced battles"],
    targetAudience: "Tech-savvy dancers, digital artists, and anyone curious about the future of performance art and movement.",
    activities: [
      { 
        id: 'f2_a1', 
        name: "VR Performance Lab", 
        type: "Masterclass" as const, 
        time: "14:00 - 17:00", 
        description: "Experiment with motion capture and VR technology. Learn how to create and perform in virtual environments with professional guidance.", 
        price: 8000,
        organizer: { name: "TechDance Institute", role: "Host" as const },
        location: "VR Lab, Building 3"
      },
      { 
        id: 'f2_a2', 
        name: "Digital Battle 1v1", 
        type: "Battle" as const, 
        time: "18:00 - 20:00", 
        description: "Battle with digital visual backdrops that react to your movements in real-time. A unique competition format.", 
        price: 5000,
        organizer: { name: "DanceTime Events", role: "Host" as const },
        location: "Main Arena"
      }
    ]
  },
  {
    category: "Competitions",
    title: "National Breaking Championship",
    time: "September 12, 2026",
    location: "Baluan Sholak Arena, Almaty",
    city: "Almaty",
    price: "8,000 ₸",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1000",
    description: "The official qualifier for the world finals. 1v1 and 2v2 categories for all ages.",
    longDescription: "Kazakhstan's most prestigious breaking competition returns for its annual championship. This is your chance to compete at the highest level and qualify for international competitions. With legendary judges, world-class production, and the country's best b-boys and b-girls, this event represents the pinnacle of breaking culture in Kazakhstan.",
    highlights: ["World-renowned judges", "International qualification spot", "Prize pool 500,000 ₸", "Professional video coverage", "Multiple age categories"],
    targetAudience: "Competitive breakers of all skill levels, from emerging talent to established champions looking to represent Kazakhstan internationally.",
    activities: [
      { 
        id: 'c1_a1', 
        name: "1v1 Pro Breaking", 
        type: "Battle" as const, 
        time: "12:00 - 15:00", 
        description: "Main bracket qualifiers. Elite solo battles with judges Storm, Lilou, and Intact. Winner advances to world finals.", 
        instructor: "Judge: Storm", 
        price: 4000,
        organizer: { name: "Kazakhstan Breaking Federation", role: "Host" as const },
        location: "Main Arena"
      },
      { 
        id: 'c1_a2', 
        name: "2v2 Crew Battle", 
        type: "Battle" as const, 
        time: "16:00 - 19:00", 
        description: "Team battles for the national title. Crews of two compete for glory and the championship belt.", 
        instructor: "Judge: Lilou", 
        price: 6000,
        organizer: { name: "Kazakhstan Breaking Federation", role: "Host" as const },
        location: "Main Arena"
      }
    ]
  },
  {
    category: "Competitions",
    title: "Step Up: Varsity Edition",
    time: "October 08, 2026",
    location: "Congress Center, Astana",
    city: "Astana",
    price: "5,000 ₸",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1000",
    description: "University dance crew competition showcasing the best student talent in Kazakhstan.",
    longDescription: "The premier university dance competition is back for another thrilling edition. Step Up: Varsity Edition brings together the best student dance crews from universities across Kazakhstan. Watch as emerging talent takes the stage with innovative choreography, fierce energy, and unmatched school spirit in this celebration of campus culture and dance.",
    highlights: ["University crews only", "Prize scholarships", "Industry panel judges", "Social media coverage", "After-party celebration"],
    targetAudience: "University students and dance crews looking to represent their institution and compete for scholarships and recognition.",
    activities: [
      { 
        id: 'c2_a1', 
        name: "Varsity Prelims", 
        type: "Contest" as const, 
        time: "10:00 - 13:00", 
        description: "University crews first round. All registered crews perform their 3-minute showcase pieces for the qualification round.", 
        price: 3000,
        organizer: { name: "University Dance League", role: "Host" as const },
        location: "Hall A"
      },
      { 
        id: 'c2_a2', 
        name: "Main Stage Finals", 
        type: "Contest" as const, 
        time: "18:00 - 21:00", 
        description: "Final showdown for the varsity cup. Top 8 crews battle for the championship title and scholarship prizes.", 
        price: 4000,
        organizer: { name: "University Dance League", role: "Host" as const },
        location: "Main Stage"
      }
    ]
  },
  {
    category: "Masterclasses",
    title: "Urban Choreography w/ Ian Eastwood",
    time: "April 22, 2026",
    location: "Focus Dance Studio, Almaty",
    city: "Almaty",
    price: "25,000 ₸",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&q=80&w=1000",
    description: "A 4-hour intensive session with the world-renowned choreographer and director.",
    longDescription: "A once-in-a-lifetime opportunity to train with Ian Eastwood, the internationally acclaimed choreographer known for his work with major artists and viral dance content. This intensive 4-hour masterclass breaks down Ian's unique approach to urban choreography, blending technique, musicality, and performance quality. Limited spots available for this exclusive workshop.",
    highlights: ["Direct instruction from Ian Eastwood", "Original choreography piece", "Video recording included", "Q&A session", "Certificate of completion"],
    targetAudience: "Intermediate to advanced dancers looking to elevate their choreography skills and learn from one of the industry's leading figures.",
    activities: [
      { 
        id: 'm1_a1', 
        name: "Technique & Groove", 
        type: "Masterclass" as const, 
        time: "14:00 - 16:00", 
        description: "Foundational movements and textures. Deep dive into the core techniques that make urban choreography flow and groove.", 
        instructor: "Ian Eastwood", 
        price: 15000,
        organizer: { name: "Focus Dance Studio", role: "Host" as const },
        location: "Studio 1"
      },
      { 
        id: 'm1_a2', 
        name: "Performance & Choreo", 
        type: "Masterclass" as const, 
        time: "16:30 - 18:30", 
        description: "Learning and performing a full piece. Learn an original Ian Eastwood choreography and perform it with proper stage presence.", 
        instructor: "Ian Eastwood", 
        price: 15000,
        organizer: { name: "Focus Dance Studio", role: "Host" as const },
        location: "Studio 1"
      }
    ]
  },
  {
    category: "Masterclasses",
    title: "Contemporary Flow Masterclass",
    time: "April 12, 2026",
    location: "Astana Ballet Academy",
    city: "Astana",
    price: "12,000 ₸",
    image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=1000",
    description: "Focusing on floorwork transitions and emotional expression through fluid movement.",
    longDescription: "Explore the beautiful intersection of contemporary dance and emotional storytelling in this intensive masterclass. Led by renowned contemporary artist Elena I., this workshop emphasizes safe floorwork techniques, seamless transitions, and the art of improvisation. Perfect for dancers looking to add fluidity and expressiveness to their movement vocabulary.",
    highlights: ["Floorwork safety techniques", "Improvisation methods", "Emotional expression", "Individual feedback", "Suitable for all levels"],
    targetAudience: "Contemporary dancers and anyone interested in exploring fluid, expressive movement regardless of their primary dance style.",
    activities: [
      { 
        id: 'm2_a1', 
        name: "Floorwork Intensive", 
        type: "Masterclass" as const, 
        time: "10:00 - 12:00", 
        description: "Safe and fluid ground transitions. Master the art of moving on the floor with control, fluidity, and creative expression.", 
        instructor: "Elena I.", 
        price: 7000,
        organizer: { name: "Astana Ballet Academy", role: "Host" as const },
        location: "Studio B"
      },
      { 
        id: 'm2_a2', 
        name: "Improvisation Lab", 
        type: "Masterclass" as const, 
        time: "13:00 - 15:00", 
        description: "Discovering your personal flow. Learn to trust your instincts and create unique movement through guided improvisation exercises.", 
        instructor: "Elena I.", 
        price: 7000,
        organizer: { name: "Astana Ballet Academy", role: "Host" as const },
        location: "Studio B"
      }
    ]
  },
  {
    category: "Camps",
    title: "Wild West Dance Camp",
    time: "August 10-17, 2026",
    location: "Borovoe Resort",
    city: "Astana",
    price: "120,000 ₸",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=1000",
    description: "All-inclusive mountain retreat with 12 instructors, 3 meals a day, and evening campfire sessions.",
    longDescription: "Escape to the mountains for the ultimate dance camp experience. Wild West Dance Camp combines intensive training with the healing power of nature. Seven days of workshops, battles, and creative sessions with 12 world-class instructors, all set against the stunning backdrop of Borovoe's landscapes. All-inclusive package with accommodation, meals, and unforgettable memories.",
    highlights: ["12 international instructors", "All-inclusive (accommodation + meals)", "Nature immersion", "Evening campfire sessions", "Competition training"],
    targetAudience: "Dancers seeking an immersive experience that combines intensive training, nature, and community in a week-long retreat format.",
    activities: [
      { 
        id: 'cp1_a1', 
        name: "Sunrise Warm-up", 
        type: "Camp" as const, 
        time: "07:00 - 08:30", 
        description: "Yoga and gentle stretching. Start each morning with mindful movement by the lake to prepare your body for the day ahead.", 
        price: 3000,
        organizer: { name: "Wild West Collective", role: "Host" as const },
        location: "Lakeside Platform"
      },
      { 
        id: 'cp1_a2', 
        name: "Battle Training", 
        type: "Battle" as const, 
        time: "14:00 - 16:00", 
        description: "Drills and strategy for competitive dance. Learn battle techniques, strategy, and mental preparation from competition veterans.", 
        price: 5000,
        organizer: { name: "Battle Masters KZ", role: "Co-organizer" as const },
        location: "Main Hall"
      },
      { 
        id: 'cp1_a3', 
        name: "Midnight Freestyle", 
        type: "Camp" as const, 
        time: "22:00 - 00:00", 
        description: "Guided freestyle session by the fire. Express yourself freely in the magical atmosphere of a campfire circle under the stars.", 
        price: 3000,
        organizer: { name: "Wild West Collective", role: "Host" as const },
        location: "Campfire Circle"
      }
    ]
  },
  {
    category: "Camps",
    title: "Winter Intensive: Astana",
    time: "January 04-08, 2027",
    location: "Duman Entertainment Center",
    city: "Astana",
    price: "45,000 ₸",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1000",
    description: "Kickstart your year with a 5-day training program covering 4 different dance disciplines.",
    longDescription: "Begin 2027 with intensive dance training at Astana's premier venue. This 5-day winter camp covers four distinct dance disciplines with expert instructors in each style. Whether you're looking to diversify your skillset or deepen your practice, this intensive program provides focused training, culminating in a final showcase performance.",
    highlights: ["4 dance disciplines covered", "5 consecutive days", "Final showcase performance", "Certificate of completion", "Networking opportunities"],
    targetAudience: "Dedicated dancers looking to start the new year with intensive multi-style training and serious skill development.",
    activities: [
      { 
        id: 'cp2_a1', 
        name: "Urban Foundations", 
        type: "Masterclass" as const, 
        time: "10:00 - 13:00", 
        description: "Core urban dance styles. Master the fundamentals of hip hop, popping, and locking with detailed technique breakdowns.", 
        price: 10000,
        organizer: { name: "Duman Dance Center", role: "Host" as const },
        location: "Hall 1"
      },
      { 
        id: 'cp2_a2', 
        name: "Showcase Preparation", 
        type: "Contest" as const, 
        time: "14:00 - 17:00", 
        description: "Choreographing for the final show. Work in groups to create original pieces for the end-of-camp showcase performance.", 
        price: 10000,
        organizer: { name: "Duman Dance Center", role: "Host" as const },
        location: "Hall 1"
      }
    ]
  },
  {
    category: "Festivals",
    title: "Astana Rhythm Weekend",
    time: "February 12-14, 2027",
    location: "Astana Arena Expo Hall",
    city: "Astana",
    price: "From 18,000 ₸",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=1000",
    description: "Three days of festival showcases, social nights, and open-format dance labs in the capital.",
    longDescription: "Astana Rhythm Weekend brings together dancers from across Kazakhstan for a packed three-day festival featuring open classes, evening performances, themed social parties, and collaborative freestyle labs. The program is designed for dancers who want both structured learning and a strong social dance atmosphere in one event.",
    highlights: ["Three-day festival format", "Showcases and socials", "Open-format dance labs", "Guest instructors", "Community networking"],
    targetAudience: "Social dancers, performance teams, and festival-goers looking for a vibrant multi-day experience in Astana.",
    activities: [
      {
        id: 'f3_a1',
        name: "Capital Opening Showcase",
        type: "Contest" as const,
        time: "18:30 - 20:30",
        description: "Opening performances from invited crews and local community teams.",
        price: 5000,
        organizer: { name: "Rhythm Collective", role: "Host" as const },
        location: "Main Festival Stage"
      },
      {
        id: 'f3_a2',
        name: "Night Social Session",
        type: "Camp" as const,
        time: "21:00 - 00:30",
        description: "An open social dance night with mixed DJs and guided freestyle circles.",
        price: 4000,
        organizer: { name: "Rhythm Collective", role: "Host" as const },
        location: "Sky Hall"
      }
    ]
  },
  {
    category: "Competitions",
    title: "Astana Crew Clash",
    time: "March 06, 2027",
    location: "Congress Center, Astana",
    city: "Astana",
    price: "7,000 ₸",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1000",
    description: "A citywide crew competition with showcase, battle, and judges' critique rounds.",
    longDescription: "Astana Crew Clash is a high-energy competition built for university teams, studio crews, and independent collectives. The event includes qualification rounds, live battle segments, and professional judges' feedback sessions, making it both a competition and a development platform for emerging teams.",
    highlights: ["Crew-vs-crew format", "Live judges' critique", "University and studio teams", "Final showcase round", "Prize support for winners"],
    targetAudience: "Dance teams and performance crews seeking competitive stage experience and judges' feedback.",
    activities: [
      {
        id: 'c3_a1',
        name: "Qualification Round",
        type: "Contest" as const,
        time: "11:00 - 14:00",
        description: "All registered teams present their stage pieces for qualification.",
        price: 3500,
        organizer: { name: "Astana Crew Network", role: "Host" as const },
        location: "Hall A"
      },
      {
        id: 'c3_a2',
        name: "Final Battle Night",
        type: "Battle" as const,
        time: "18:00 - 21:00",
        description: "Top crews compete head-to-head for the Astana Crew Clash title.",
        price: 4500,
        organizer: { name: "Astana Crew Network", role: "Host" as const },
        location: "Main Stage"
      }
    ]
  },
  {
    category: "Masterclasses",
    title: "Stage Presence Intensive",
    time: "April 10, 2027",
    location: "Astana Performance Lab",
    city: "Astana",
    price: "14,000 ₸",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1000",
    description: "An intensive special program focused on projection, confidence, and storytelling on stage.",
    longDescription: "Stage Presence Intensive is a one-day immersive program built for dancers who want to strengthen performance quality, emotional connection, and confidence in front of an audience. Through guided drills and coached combinations, participants learn how to command attention and elevate their stage impact.",
    highlights: ["Performance coaching", "Storytelling through movement", "Confidence-building drills", "Feedback from mentors", "Small focused groups"],
    targetAudience: "Intermediate and advanced dancers preparing for showcases, competitions, or auditions.",
    activities: [
      {
        id: 'm3_a1',
        name: "Presence and Projection",
        type: "Masterclass" as const,
        time: "12:00 - 14:00",
        description: "A focused session on body language, eye line, and stage projection.",
        instructor: "Dana S.",
        price: 8000,
        organizer: { name: "Astana Performance Lab", role: "Host" as const },
        location: "Studio Black"
      },
      {
        id: 'm3_a2',
        name: "Performance Composition",
        type: "Masterclass" as const,
        time: "15:00 - 17:00",
        description: "Applying storytelling and stage confidence in a choreographic combination.",
        instructor: "Dana S.",
        price: 8000,
        organizer: { name: "Astana Performance Lab", role: "Host" as const },
        location: "Studio Black"
      }
    ]
  }
];

const hasDisplayImage = (item: any) => Boolean(String(item?.image || '').trim());

interface SpecialProgramsProps {
  onBookTicket: (event: any) => void;
  selectedCity: string;
  favoriteIds?: string[];
  onToggleFavorite?: (event: any) => void;
  dynamicPrograms?: any[];
  expandedMode?: boolean;
  onExploreMore?: () => void;
  showExploreMoreButton?: boolean;
}

export const SpecialPrograms = ({
  onBookTicket,
  selectedCity,
  favoriteIds = [],
  onToggleFavorite,
  dynamicPrograms = [],
  expandedMode = false,
  onExploreMore,
  showExploreMoreButton = true,
}: SpecialProgramsProps) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { t } = useI18n();

  const mergedPrograms = [...dynamicPrograms, ...programs].filter(hasDisplayImage);

  const filteredPrograms = mergedPrograms.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesCity = p.city === selectedCity;
    return matchesCategory && matchesCity;
  });
  const visiblePrograms = expandedMode ? filteredPrograms : filteredPrograms.slice(0, 6);
  const cityProgramsCount = mergedPrograms.filter((program) => program.city === selectedCity).length;
  const shouldShowExploreMoreButton = showExploreMoreButton && cityProgramsCount > 6 && Boolean(onExploreMore);

  const getIcon = (category: string) => {
    switch (category) {
      case 'All': return <LayoutGrid className="w-4 h-4" />;
      case 'Festivals': return <Star className="w-4 h-4" />;
      case 'Competitions': return <Trophy className="w-4 h-4" />;
      case 'Masterclasses': return <GraduationCap className="w-4 h-4" />;
      case 'Camps': return <Tent className="w-4 h-4" />;
      default: return null;
    }
  };

  const categoryLabels: Record<string, string> = {
    All: t('specialPrograms.all'),
    Festivals: t('specialPrograms.festivals'),
    Competitions: t('specialPrograms.competitions'),
    Masterclasses: t('specialPrograms.masterclasses'),
    Camps: t('specialPrograms.camps'),
  };

  return (
    <section className="relative overflow-hidden border-t border-border py-24 bg-[linear-gradient(180deg,rgba(228,220,243,0.72)_0%,rgba(221,211,239,0.94)_100%)] dark:border-white/5 dark:bg-black dark:[background-image:none]">
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-600/8 blur-[120px] -translate-y-1/2 translate-x-1/2 dark:bg-purple-600/5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-[1px] bg-purple-500" />
              <span className="text-purple-400 font-bold uppercase tracking-widest text-xs">{t('specialPrograms.eyebrow')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground dark:text-white">
              {t('specialPrograms.titleStart')} <span className="text-purple-500">{t('specialPrograms.titleAccent')}</span>
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground dark:text-gray-400">
              {t('specialPrograms.description', { city: selectedCity })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {programCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all cursor-pointer relative overflow-hidden ${
                  activeCategory === category 
                    ? 'text-white' 
                    : 'surface-soft text-foreground hover:bg-[rgba(165,141,212,0.95)] hover:text-foreground dark:bg-gray-900/50 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:border dark:border-white/5'
                }`}
              >
                {activeCategory === category && (
                  <motion.div 
                    layoutId="activeProgramPill"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  {getIcon(category)}
                  {categoryLabels[category] || category}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
          <AnimatePresence mode="sync">
            {visiblePrograms.length > 0 ? (
              visiblePrograms.map((program, index) => (
                <motion.div
                  key={`${program.title}-${activeCategory}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group relative surface-card rounded-[32px] overflow-hidden transition-all duration-500 hover:border-purple-500/30 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.1)] dark:bg-gray-900/40 dark:border-white/5"
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="w-full sm:w-2/5 relative overflow-hidden h-48 sm:h-auto">
                      <ImageWithFallback
                        src={program.image}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <button
                        type="button"
                        onClick={() => onToggleFavorite?.({
                          id: program.id || `${program.title}-${program.time}-${program.location}`,
                          title: program.title,
                          date: program.time,
                          location: program.location,
                          city: program.city,
                          image: program.image,
                          category: program.category,
                          price: program.price,
                          eventData: program,
                        })}
                        className={`absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
                          favoriteIds.includes(program.id || `${program.title}-${program.time}-${program.location}`)
                            ? 'bg-rose-500/90 border-rose-300/70 text-white shadow-lg shadow-rose-900/30'
                            : 'bg-[rgba(238,231,249,0.92)] border-[rgba(90,70,150,0.18)] text-primary hover:bg-rose-500/85 hover:border-rose-300/60 hover:text-white dark:bg-black/55 dark:border-white/10 dark:text-white/85'
                        }`}
                        aria-label={favoriteIds.includes(program.id || `${program.title}-${program.time}-${program.location}`) ? t('common.removeFromFavorites') : t('common.addToFavorites')}
                      >
                        <Heart className={`w-4 h-4 ${favoriteIds.includes(program.id || `${program.title}-${program.time}-${program.location}`) ? 'fill-current' : ''}`} />
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(45,35,67,0.55)] via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-[rgba(45,35,67,0.16)] dark:from-gray-900 dark:via-transparent dark:to-transparent dark:sm:to-gray-900/20" />
                    </div>

                    <div className="p-8 sm:w-3/5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-purple-400 font-bold text-xs uppercase tracking-widest mb-3">
                          {getIcon(program.category)}
                          {categoryLabels[program.category] || program.category}
                        </div>
                        <h3 className="text-2xl font-bold mb-4 transition-colors text-foreground group-hover:text-primary dark:text-white dark:group-hover:text-purple-400">
                          {program.title}
                        </h3>
                        <p className="text-sm leading-relaxed mb-6 line-clamp-3 text-muted-foreground dark:text-gray-400">
                          {program.description}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-border pt-6 dark:border-white/5">
                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-gray-500">{t('common.startsAt')}</span>
                          <span className="text-xl font-black text-foreground dark:text-white">{program.price}</span>
                          {program.soldOut ? (
                            <span className="mt-1 block text-sm font-semibold text-red-400">{t('common.soldOut')}</span>
                          ) : program.remainingTickets !== undefined && program.remainingTickets !== null && program.remainingTickets <= 15 ? (
                            <span className="mt-1 block text-sm font-medium text-emerald-400">{t('common.ticketsLeft', { count: program.remainingTickets })}</span>
                          ) : null}
                        </div>
                        <button 
                          onClick={() => onBookTicket(program)}
                          className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-purple-600/20 group/btn cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-600/10">
                  <Sparkles className="w-10 h-10 text-purple-500/50" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 dark:text-white">
                  {t('specialPrograms.emptyTitle', {
                    category: activeCategory !== 'All' ? (categoryLabels[activeCategory] || activeCategory).toLowerCase() : '',
                    city: selectedCity,
                  })}
                </h3>
                <p className="max-w-sm mx-auto text-muted-foreground dark:text-gray-400">
                  {t('specialPrograms.emptyDescription')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {shouldShowExploreMoreButton && (
          <div className="mt-16 text-center">
            <button
              onClick={onExploreMore}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 group"
            >
              {t('common.exploreAllEvents')}
              <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
