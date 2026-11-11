import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ShimmerButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'gold' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  shimmer?: boolean;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  icon,
  shimmer = true,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
  };

  const variantClasses = {
    gold: 'bg-gradient-to-r from-[#D4AF37] via-[#DFBF54] to-[#C29D26] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_22px_rgba(212,175,55,0.4)] border border-[#E5C158]',
    secondary: 'bg-[#1C1C1C] hover:bg-[#252525] text-neutral-200 hover:text-white border border-[#66531C]/60 hover:border-[#D4AF37]/50 shadow-sm',
    outline: 'bg-transparent hover:bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/60 hover:border-[#D4AF37] shadow-sm',
    danger: 'bg-gradient-to-r from-[#D32F2F] to-[#C62828] text-white font-semibold shadow-[0_0_15px_rgba(229,57,53,0.3)] hover:shadow-[0_0_22px_rgba(229,57,53,0.5)] border border-[#EF5350]/50',
    success: 'bg-gradient-to-r from-[#00C853] to-[#00A844] text-black font-bold shadow-[0_0_15px_rgba(0,200,83,0.3)] hover:shadow-[0_0_22px_rgba(0,200,83,0.5)] border border-[#69F0AE]/50',
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {/* 21st.dev Shimmer light beam animation */}
      {shimmer && !disabled && (
        <span
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="shimmer-beam block absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg]" />
        </span>
      )}

      {icon && <span className="flex-shrink-0 relative z-10">{icon}</span>}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </motion.button>
  );
};
