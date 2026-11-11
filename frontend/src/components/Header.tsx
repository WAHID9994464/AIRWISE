import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Download, Database, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { exportObservationsToCSV } from '../utils/csvUtils';
import { ShimmerButton } from './ShimmerButton';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
  const { dataSource, observations, resetToSample } = useData();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExportCSV = () => {
    exportObservationsToCSV(observations, 'wifi_dataset_export.csv');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0C0C0C]/90 backdrop-blur-xl border-b border-[#66531C]/60 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors shadow-lg">
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-[#1C1C1C] text-neutral-300 hover:text-white hover:bg-[#252525] border border-[#66531C]/60 lg:hidden focus:outline-none shadow-sm"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        <div className="min-w-0">
          <motion.h1
            key={title}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 truncate"
          >
            <span className="truncate">{title}</span>
          </motion.h1>
          <p className="text-[11px] text-[#BDBDBD] hidden sm:block truncate">
            College Wi-Fi Load &amp; Congestion Prediction System • ASSP Prototype
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Live Clock Pill */}
        <div className="hidden xl:flex items-center space-x-2 text-[11px] font-mono text-neutral-300 bg-[#161616] px-3 py-1.5 rounded-xl border border-[#66531C]/40 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{currentTime || 'Syncing clock...'}</span>
        </div>

        {/* Data Source Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition shadow-sm ${
            dataSource === 'SIMULATED SAMPLE DATA'
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40'
              : 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/40'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{dataSource}</span>
          <span className="md:hidden">{dataSource === 'SIMULATED SAMPLE DATA' ? 'Sample' : 'Uploaded'}</span>
        </div>

        {/* Export CSV Shimmer Button */}
        <ShimmerButton
          variant="gold"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExportCSV}
          title="Export Active Dataset to CSV"
        >
          <span className="hidden sm:inline">Export CSV</span>
        </ShimmerButton>
      </div>
    </header>
  );
};
