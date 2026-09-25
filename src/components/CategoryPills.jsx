import React, { useRef } from 'react';
import { 
  Flame, 
  UtensilsCrossed, 
  Mic, 
  Trophy, 
  Laugh, 
  Camera, 
  Lightbulb, 
  Film, 
  Music, 
  Gamepad2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ARABIC_CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Flame, query: 'محتوى مصري' },
  { id: 'cooking', label: '🍳 طبخ وأكلات', icon: UtensilsCrossed, query: 'اكلات مصرية طبخ سهلة نادية السيد' },
  { id: 'podcast', label: '🎙️ بودكاست', icon: Mic, query: 'بودكاست مصري' },
  { id: 'football', label: '⚽ كورة وملخصات', icon: Trophy, query: 'ملخص اهداف الاهلي والزمالك كورة' },
  { id: 'comedy', label: '😂 كوميديا', icon: Laugh, query: 'كوميديا واسكتشات مصرية' },
  { id: 'vlogs', label: '🚗 فلوجات وجولات', icon: Camera, query: 'جولة اكل شوارع مصر فلوج' },
  { id: 'science', label: '💡 علوم ومعرفة', icon: Lightbulb, query: 'الدحيح علوم ومعرفة' },
  { id: 'cinema', label: '🎬 سينما ومسلسلات', icon: Film, query: 'ملخصات افلام ومسلسلات مصرية' },
  { id: 'music', label: '🎵 موسيقى وطرب', icon: Music, query: 'اغاني مصرية جديدة' },
  { id: 'gaming', label: '🎮 ألعاب وجيمينج', icon: Gamepad2, query: 'العاب وجيمينج عربي' },
];

export default function CategoryPills({ activeCategory, onSelectCategory }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full flex items-center group/pills py-1">
      {/* Right Scroll Button (Desktop) */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 z-10 w-8 h-8 items-center justify-center rounded-full bg-[#0d0d12]/90 hover:bg-neon-purple text-void-300 hover:text-white border border-white/10 shadow-lg backdrop-blur-md opacity-0 group-hover/pills:opacity-100 transition-opacity"
      >
        <ChevronRight size={16} />
      </button>

      {/* Scrolling Pills */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
      >
        <div className="flex items-center gap-2 min-w-max">
          {ARABIC_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 border ${
                  isActive
                    ? 'bg-neon-purple text-white border-neon-purple/80 shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-[1.02]'
                    : 'bg-[#14141c] hover:bg-[#1a1a26] text-void-300 hover:text-white border-white/[0.06] hover:border-white/15'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Left Scroll Button (Desktop) */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 z-10 w-8 h-8 items-center justify-center rounded-full bg-[#0d0d12]/90 hover:bg-neon-purple text-void-300 hover:text-white border border-white/10 shadow-lg backdrop-blur-md opacity-0 group-hover/pills:opacity-100 transition-opacity"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );
}
