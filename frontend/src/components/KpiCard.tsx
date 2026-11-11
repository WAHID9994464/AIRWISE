import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'green' | 'red' | 'orange';
  change?: string;
  delay?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'gold',
  change,
  delay = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const colorMap = {
    gold: {
      border: 'border-[#66531C]',
      hoverBorder: 'hover:border-[#D4AF37]/80',
      iconBg: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]',
      valueColor: 'text-[#D4AF37]',
      spotlightColor: 'rgba(212, 175, 55, 0.1)',
      topGlow: 'from-[#D4AF37]/20 to-transparent',
    },
    green: {
      border: 'border-[#00C853]/40',
      hoverBorder: 'hover:border-[#00C853]/80',
      iconBg: 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/40 shadow-[0_0_15px_rgba(0,200,83,0.2)]',
      valueColor: 'text-[#00C853]',
      spotlightColor: 'rgba(0, 200, 83, 0.1)',
      topGlow: 'from-[#00C853]/20 to-transparent',
    },
    red: {
      border: 'border-[#E53935]/40',
      hoverBorder: 'hover:border-[#E53935]/80',
      iconBg: 'bg-[#E53935]/15 text-[#E53935] border-[#E53935]/40 shadow-[0_0_15px_rgba(229,57,53,0.2)]',
      valueColor: 'text-[#E53935]',
      spotlightColor: 'rgba(229, 57, 53, 0.1)',
      topGlow: 'from-[#E53935]/20 to-transparent',
    },
    orange: {
      border: 'border-[#FF9800]/40',
      hoverBorder: 'hover:border-[#FF9800]/80',
      iconBg: 'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/40 shadow-[0_0_15px_rgba(255,152,0,0.2)]',
      valueColor: 'text-[#FF9800]',
      spotlightColor: 'rgba(255, 152, 0, 0.1)',
      topGlow: 'from-[#FF9800]/20 to-transparent',
    },
  };

  const currentTheme = colorMap[variant];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={`relative bg-gradient-to-b from-[#1E1E1E] to-[#141414] rounded-2xl border ${currentTheme.border} ${currentTheme.hoverBorder} p-5 shadow-lg flex items-center justify-between transition-colors duration-200 overflow-hidden select-none`}
    >
      {/* 21st.dev Spotlight cursor glow */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${currentTheme.spotlightColor}, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Top subtle highlight line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${currentTheme.topGlow}`}
      />

      <div className="relative z-10 flex-1 pr-3">
        <p className="text-[11px] uppercase tracking-wider font-bold text-[#BDBDBD] mb-1.5 flex items-center gap-1.5">
          <span>{title}</span>
        </p>
        <div
          className={`text-2xl sm:text-3xl font-black ${currentTheme.valueColor} tracking-tight`}
        >
          {value}
        </div>
        {(subtitle || change) && (
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-neutral-400">
            {change && (
              <span className="font-semibold text-white px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px]">
                {change}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>
        )}
      </div>

      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ duration: 0.2 }}
        className={`relative z-10 w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border ${currentTheme.iconBg} flex-shrink-0`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.div>
    </motion.div>
  );
};
