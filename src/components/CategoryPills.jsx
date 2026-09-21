import React from 'react';
import { Flame, Music, Gamepad2, Cpu, Globe, Film, Headphones, Compass } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'tech', label: 'Technology', icon: Cpu },
  { id: 'science', label: 'Space & Science', icon: Globe },
  { id: 'cinema', label: 'Cinema & Trailers', icon: Film },
  { id: 'lofi', label: 'Ambient & Lo-Fi', icon: Headphones },
];

export default function CategoryPills({ activeCategory, onSelectCategory }) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
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
              <Icon size={14} className={isActive ? 'text-white' : 'text-void-400'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
