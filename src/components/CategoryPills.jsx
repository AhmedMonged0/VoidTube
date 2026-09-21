import React from 'react';
import { Flame, UtensilsCrossed, Mic, Trophy, Laugh, Camera, Lightbulb, Film, Music, Gamepad2 } from 'lucide-react';

export const ARABIC_CATEGORIES = [
  { id: 'all', label: 'الرئيسية', icon: Flame, query: 'محتوى مصري' },
  { id: 'cooking', label: '🍳 طبخ وأكلات مصرية', icon: UtensilsCrossed, query: 'اكلات مصرية طبخ سهلة نادية السيد' },
  { id: 'podcast', label: '🎙️ بودكاست ومقابلات', icon: Mic, query: 'بودكاست مصري' },
  { id: 'football', label: '⚽ كورة وملخصات', icon: Trophy, query: 'ملخص اهداف الاهلي والزمالك كورة' },
  { id: 'comedy', label: '😂 كوميديا واسكتشات', icon: Laugh, query: 'كوميديا واسكتشات مصرية' },
  { id: 'vlogs', label: '🚗 فلوجات وجولات مصر', icon: Camera, query: 'جولة اكل شوارع مصر فلوج' },
  { id: 'science', label: '💡 علوم ومعرفة', icon: Lightbulb, query: 'الدحيح علوم ومعرفة' },
  { id: 'cinema', label: '🎬 مسلسلات وسينما', icon: Film, query: 'ملخصات افلام ومسلسلات مصرية' },
  { id: 'music', label: '🎵 طرب وموسيقى', icon: Music, query: 'اغاني مصرية جديدة' },
  { id: 'gaming', label: '🎮 ألعاب وجيمينج', icon: Gamepad2, query: 'العاب وجيمينج عربي' },
];

export default function CategoryPills({ activeCategory, onSelectCategory }) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {ARABIC_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                isActive
                  ? 'bg-neon-purple text-white border-neon-purple shadow-neon-purple'
                  : 'bg-[#141419] hover:bg-[#1a1a24] text-void-300 hover:text-white border-white/[0.06] hover:border-white/15'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
