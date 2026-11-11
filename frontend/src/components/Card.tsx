import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'gold' | 'red' | 'green' | 'orange';
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  spotlight?: boolean;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'gold',
  action,
  children,
  className = '',
  spotlight = true,
  animate = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const badgeClasses = {
    gold: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40 shadow-[0_0_10px_rgba(212,175,55,0.15)]',
    red: 'bg-[#E53935]/15 text-[#E53935] border-[#E53935]/40 shadow-[0_0_10px_rgba(229,57,53,0.15)]',
    green: 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/40 shadow-[0_0_10px_rgba(0,200,83,0.15)]',
    orange: 'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/40 shadow-[0_0_10px_rgba(255,152,0,0.15)]',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative bg-[#181818] rounded-2xl border border-[#66531C]/60 p-5 sm:p-6 shadow-xl transition-colors duration-200 hover:border-[#D4AF37]/50 overflow-hidden ${className}`}
    >
      {/* 21st.dev Spotlight Effect */}
      {spotlight && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.08), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Header section */}
      {(title || subtitle || action || badge) && (
        <div className="relative z-10 flex items-start justify-between mb-5 border-b border-[#66531C]/35 pb-3.5">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex flex-wrap items-center gap-2">
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{title}</span>
                </h3>
              )}
              {badge && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClasses[badgeColor]}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Content body */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
