import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface AnimatedTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  layoutId?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AnimatedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  layoutId = 'animatedTabsIndicator',
  size = 'md',
  className = '',
}: AnimatedTabsProps<T>) {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs sm:text-sm',
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 bg-[#121212] p-1.5 rounded-2xl border border-[#66531C]/40 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-xl font-semibold transition-colors duration-150 flex items-center gap-2 select-none z-10 ${
              sizeClasses[size]
            } ${isActive ? 'text-black font-bold' : 'text-neutral-300 hover:text-white'}`}
          >
            {/* Sliding Pill Active Indicator (Framer Motion 21st.dev style) */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#C29D26] rounded-xl shadow-md z-[-1]"
              />
            )}

            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-black/25 text-black'
                    : 'bg-[#222222] text-[#D4AF37] border border-[#66531C]/40'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
