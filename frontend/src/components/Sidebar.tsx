import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Database,
  BarChart2,
  PieChart,
  GitFork,
  CheckCircle2,
  GitCommit,
  Layers,
  Dice5,
  TrendingUp,
  FileCode2,
  FileText,
  Wifi,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: '1. Dashboard', path: '/', icon: LayoutDashboard },
  { name: '2. Core ASSP Concepts', path: '/concepts', icon: BookOpen },
  { name: '3. Data Management', path: '/data', icon: Database },
  { name: '4. Statistics Analysis', path: '/statistics', icon: BarChart2 },
  { name: '5. Probability Analysis', path: '/probability', icon: PieChart },
  { name: '6. Hypothesis & ANOVA', path: '/anova', icon: GitFork },
  { name: '7. Chi-Square Test', path: '/chi-square', icon: CheckCircle2 },
  { name: '8. Poisson Process', path: '/poisson', icon: GitCommit },
  { name: '9. Markov Chain & DTMC', path: '/markov', icon: Layers },
  { name: '10. Monte Carlo Sim', path: '/monte-carlo', icon: Dice5 },
  { name: '11. Congestion Prediction', path: '/prediction', icon: TrendingUp },
  { name: '12. MATLAB Verification', path: '/matlab', icon: FileCode2 },
  { name: '13. Reports & Settings', path: '/reports-settings', icon: FileText },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { observations } = useData();
  const latestObs = observations[observations.length - 1];
  const isCongested = latestObs?.Network_State === 'Congested';
  const isHigh = latestObs?.Network_State === 'High';

  return (
    <>
      {/* Mobile backdrop with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0C0C0C] border-r border-[#66531C]/60 flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Project Branding */}
        <div className="p-4 sm:p-5 border-b border-[#66531C]/50 flex items-center justify-between bg-gradient-to-r from-[#141414] to-[#0C0C0C]">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#262626] to-[#121212] border border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              <Wifi className="w-5 h-5 text-[#D4AF37]" />
            </motion.div>
            <div>
              <div className="text-white font-black text-sm tracking-wide flex items-center gap-1.5">
                <span>Wi-Fi Analytics</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#66531C]/40 text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm">
                  ASSP
                </span>
              </div>
              <div className="text-[11px] text-[#BDBDBD] font-medium">Load &amp; Congestion AI</div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Network Health Status Beacon */}
        <div className="px-4 py-3 bg-[#131313] border-b border-[#66531C]/35 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCongested ? 'bg-[#E53935]' : isHigh ? 'bg-[#FF9800]' : 'bg-[#00C853]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isCongested ? 'bg-[#E53935]' : isHigh ? 'bg-[#FF9800]' : 'bg-[#00C853]'
                }`}
              />
            </span>
            <span className="text-xs font-semibold text-neutral-300">Live Network State</span>
          </div>

          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isCongested
                ? 'bg-[#E53935]/20 text-[#E53935] border border-[#E53935]/50 shadow-[0_0_10px_rgba(229,57,53,0.3)]'
                : isHigh
                ? 'bg-[#FF9800]/20 text-[#FF9800] border border-[#FF9800]/50 shadow-[0_0_10px_rgba(255,152,0,0.3)]'
                : 'bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/50 shadow-[0_0_10px_rgba(0,200,83,0.3)]'
            }`}
          >
            {latestObs?.Network_State || 'Active'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <LayoutGroup id="sidebarNav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group select-none ${
                      isActive
                        ? 'text-[#D4AF37] font-bold shadow-sm'
                        : 'text-neutral-300 hover:text-white hover:bg-[#181818]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* 21st.dev Framer Motion Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className="absolute inset-0 bg-gradient-to-r from-[#202020] via-[#242015] to-[#1A1A1A] rounded-xl border border-[#D4AF37]/50 border-l-4 border-l-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.12)] z-0"
                        />
                      )}

                      <div className="relative z-10 flex items-center space-x-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                            isActive ? 'text-[#D4AF37]' : 'text-neutral-400 group-hover:text-white'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.path === '/matlab' && (
                        <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm">
                          M-CODE
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </LayoutGroup>
        </nav>

        {/* Academic Prototype Notice */}
        <div className="p-3.5 border-t border-[#66531C]/40 bg-[#101010] text-[11px] text-[#BDBDBD] space-y-1">
          <div className="flex items-center justify-between text-neutral-300 font-semibold">
            <span>Prototype Engine</span>
            <span className="text-[#00C853] font-bold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
              ONLINE
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 leading-tight">
            Academic software prototype with companion MATLAB verification scripts.
          </div>
        </div>
      </aside>
    </>
  );
};
