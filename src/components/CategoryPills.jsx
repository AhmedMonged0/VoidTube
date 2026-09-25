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
  { 
    id: 'all', 
    label: '✨ الكل (استكشاف)', 
    icon: Flame, 
    query: 'محتوى رائج مصري وعربي',
    queries: ['تريند اليوم', 'فلوجات وجولات', 'بودكاست حوارات', 'كوميديا مصرية', 'الدحيح حلقات', 'اكلات سريعة', 'ملخص مباريات'] 
  },
  { 
    id: 'cooking', 
    label: '🍳 طبخ وأكلات', 
    icon: UtensilsCrossed, 
    query: 'اكلات مصرية طبخ سهلة',
    queries: [
      'اكلات مصرية طبخ سهلة وسريعة', 
      'وصفات شيف نادية السيد جديدة', 
      'حلويات سريعة بدون فرن ولذيذة', 
      'أكل شوارع وتجارب مطاعم مصر', 
      'أسرار المطبخ الشرقي ووصفات زمان'
    ] 
  },
  { 
    id: 'podcast', 
    label: '🎙️ بودكاست', 
    icon: Mic, 
    query: 'بودكاست مصري جديد',
    queries: [
      'بودكاست مصري حوارات مشوقة', 
      'فنجان بودكاست إذاعة ثمانية', 
      'بودكاست إبراهيم فايق الجديد', 
      'قصص حقيقية وتجارب بودكاست', 
      'حوارات ملهمة ووثائقية'
    ] 
  },
  { 
    id: 'football', 
    label: '⚽ كورة وملخصات', 
    icon: Trophy, 
    query: 'ملخص اهداف مباريات اليوم',
    queries: [
      'ملخص مباريات اليوم وأهداف الدوري', 
      'أهداف الأهلي والزمالك ملخصات', 
      'ملخص دوري أبطال أوروبا اليوم', 
      'تحليل كروي ممتع وأهداف عالمية', 
      'مهارات ولقطات كرة قدم أسطورية'
    ] 
  },
  { 
    id: 'comedy', 
    label: '😂 كوميديا', 
    icon: Laugh, 
    query: 'كوميديا واسكتشات مصرية',
    queries: [
      'كوميديا واسكتشات مصرية مضحكة', 
      'مقالب مضحكة وتحديات مسلية', 
      'ستاند اب كوميدي مصري ممتع', 
      'مواقف وطرائف مضحكة مصر', 
      'ميمز وفيديوهات ترفيهية'
    ] 
  },
  { 
    id: 'vlogs', 
    label: '🚗 فلوجات وجولات', 
    icon: Camera, 
    query: 'جولة اكل شوارع مصر فلوج',
    queries: [
      'جولة اكل شوارع مصر فلوج وسفر', 
      'سفر وتحديات يوم كامل ممتع', 
      'فلوجات جو حطاب وسفر واستكشاف', 
      'تجارب أماكن غريبة وجولات القاهرة', 
      'يوم في حياة فلوج وتحديات'
    ] 
  },
  { 
    id: 'science', 
    label: '💡 علوم ومعرفة', 
    icon: Lightbulb, 
    query: 'الدحيح علوم ومعرفة',
    queries: [
      'الدحيح حلقات جديدة شيقة', 
      'وثائقيات علمية وتاريخية مثيرة', 
      'حقائق مذهلة حول العالم والكون', 
      'قصص اقتصاد وشركات عملاقة', 
      'تجارب علمية واكتشافات حديثة'
    ] 
  },
  { 
    id: 'cinema', 
    label: '🎬 سينما ومسلسلات', 
    icon: Film, 
    query: 'ملخصات افلام ومسلسلات',
    queries: [
      'ملخصات افلام ومسلسلات جديدة سينما', 
      'مراجعة فيلم جديد بدون حرق تفاصيل', 
      'أقوى أفلام سينمائية ملخص أكشن', 
      'كواليس ومسلسلات عربية تريند'
    ] 
  },
  { 
    id: 'music', 
    label: '🎵 موسيقى وطرب', 
    icon: Music, 
    query: 'اغاني مصرية جديدة تريند',
    queries: [
      'اغاني مصرية جديدة تريند اليوم', 
      'طرب كلاسيكي وموسيقى هادئة رايقة', 
      'شعبيات ومهرجانات مصرية جديدة', 
      'ريمكسات واغاني رايقة روقان'
    ] 
  },
  { 
    id: 'gaming', 
    label: '🎮 ألعاب وجيمينج', 
    icon: Gamepad2, 
    query: 'العاب وجيمينج عربي مضحك',
    queries: [
      'العاب وجيمينج عربي مضحك وتحديات', 
      'ببجي وكود وفيفا لقطات ممتعة', 
      'تختيم العاب رعب ومغامرات شيقة', 
      'افضل العاب جديدة مراجعات جيمينج'
    ] 
  },
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
