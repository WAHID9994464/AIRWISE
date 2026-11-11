import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Eye, EyeOff, Info, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

export interface ConceptFormulaItem {
  id: string;
  title: string;
  section: 'A' | 'B' | 'C' | 'D' | 'E';
  sectionLabel: string;
  formula: string;
  whatItCalculates: string;
  variables: { symbol: string; meaning: string }[];
  conditions?: string[];
  wifiApplication: string;
  workedExample?: string;
  datasetConnection?: string;
}

interface FormulaCardProps {
  item: ConceptFormulaItem;
  defaultExpanded?: boolean;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({ item, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showFormula, setShowFormula] = useState(true);
  const [showSymbols, setShowSymbols] = useState(true);

  // 21st.dev Spotlight cursor glow state
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

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative bg-[#181818] rounded-2xl border border-[#66531C]/60 hover:border-[#D4AF37]/60 shadow-xl transition-colors duration-200 overflow-hidden"
    >
      {/* 21st.dev Spotlight cursor tracking */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.08), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Header bar */}
      <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-[#66531C]/35 bg-[#161616]">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#66531C]/35 text-[#D4AF37] border border-[#66531C]/60">
              {item.sectionLabel}
            </span>
            {item.conditions && item.conditions.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Assumptions Defined</span>
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </h3>
          <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed line-clamp-2">
            {item.whatItCalculates}
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0 relative z-20">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowFormula(!showFormula)}
            title={showFormula ? 'Hide Formula' : 'Show Formula'}
            className="p-2 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-[#D4AF37] border border-[#66531C]/50 transition text-xs shadow-sm"
          >
            {showFormula ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#E53935]" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Card' : 'Expand Card'}
            className="p-2 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white border border-[#66531C]/50 transition text-xs flex items-center gap-1 shadow-sm"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Main Body with Smooth Framer Motion Collapse */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 space-y-4 text-xs relative z-10">
              {/* Formula display box */}
              {showFormula ? (
                <div className="bg-[#0C0C0C] px-3 py-4 sm:px-5 sm:py-5 rounded-2xl border border-[#66531C]/60 flex flex-col items-center justify-center text-center shadow-inner w-full max-w-full min-w-0 overflow-hidden">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>Mathematical Formula</span>
                  </div>
                  <div className="w-full max-w-full min-w-0 flex items-center justify-center overflow-hidden min-h-[4rem]">
                    <MathRenderer math={item.formula} block />
                  </div>
                </div>
              ) : (
                <div className="bg-[#121212] p-3 rounded-xl border border-neutral-800 text-center text-neutral-400 italic">
                  Formula display hidden. Click the eye icon to reveal.
                </div>
              )}

              {/* Symbol definitions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Meaning of Symbols:</span>
                  </span>
                  <button
                    onClick={() => setShowSymbols(!showSymbols)}
                    className="text-[11px] text-[#D4AF37] hover:underline font-semibold"
                  >
                    {showSymbols ? 'Collapse Symbols' : 'Expand Symbols'}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {showSymbols && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.variables.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 bg-[#202020] p-2.5 rounded-xl border border-[#66531C]/35 min-w-0 overflow-hidden"
                          >
                            <span className="font-mono text-[#D4AF37] font-bold flex-shrink-0 max-w-[50%] overflow-hidden">
                              <MathRenderer math={v.symbol} />
                            </span>
                            <span className="text-[#BDBDBD] leading-relaxed break-words min-w-0">: {v.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Conditions / Assumptions */}
              {item.conditions && item.conditions.length > 0 && (
                <div className="bg-[#1C1608] p-3.5 rounded-xl border border-[#D4AF37]/40 space-y-1">
                  <span className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Conditions &amp; Assumptions:</span>
                  </span>
                  <ul className="list-disc pl-5 space-y-0.5 text-neutral-300">
                    {item.conditions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practical Wi-Fi Application */}
              <div className="bg-[#141814] p-3.5 rounded-xl border border-[#00C853]/40 space-y-1">
                <span className="font-bold text-[#00C853] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />
                  <span>College Wi-Fi Network Application:</span>
                </span>
                <p className="text-neutral-300 leading-relaxed">{item.wifiApplication}</p>
                {item.datasetConnection && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span className="font-semibold text-neutral-300">Dataset Mapping:</span>
                    <span className="text-[#D4AF37] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-[#66531C]/40">
                      {item.datasetConnection}
                    </span>
                  </div>
                )}
              </div>

              {/* Worked Numerical Example */}
              {item.workedExample && (
                <div className="bg-[#191919] p-3 rounded-xl border border-[#66531C]/35 text-neutral-300 font-mono text-[11px] leading-relaxed">
                  <span className="font-sans font-bold text-neutral-200 block mb-1">
                    Worked Numerical Demonstration:
                  </span>
                  <div className="text-neutral-300 break-words">{item.workedExample}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
