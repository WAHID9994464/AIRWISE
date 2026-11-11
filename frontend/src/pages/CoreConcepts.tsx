import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Activity,
  Network,
  TrendingUp,
  BarChart3,
  HelpCircle,
  FileSpreadsheet,
  Cpu,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/Card';
import { FormulaCard } from '../components/FormulaCard';
import { MathRenderer } from '../components/MathRenderer';
import { AnimatedTabs, TabItem } from '../components/AnimatedTabs';
import { ASSP_CONCEPTS_DATA } from '../data/asspConceptsData';
import { poissonPMF } from '../calculations/poisson';
import { chiSquarePValue, fDistributionPValue } from '../calculations/mathUtils';

type SectionFilter = 'ALL' | 'A' | 'B' | 'C' | 'D' | 'E' | 'TECHNIQUES';

export const CoreConcepts: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<SectionFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLab, setActiveLab] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  // --- Interactive Lab 1: Section A (Expectation, Variance, Std Dev) ---
  const [labAInputs, setLabAInputs] = useState<string>('45, 80, 130, 165, 90, 54');
  const parsedA = useMemo(() => {
    return labAInputs
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((v) => !isNaN(v));
  }, [labAInputs]);
  const nA = parsedA.length;
  const meanA = nA > 0 ? parsedA.reduce((a, b) => a + b, 0) / nA : 0;
  const varA =
    nA > 1 ? parsedA.reduce((a, b) => a + Math.pow(b - meanA, 2), 0) / (nA - 1) : 0;
  const stdA = Math.sqrt(varA);
  const seA = nA > 0 ? stdA / Math.sqrt(nA) : 0;

  // --- Interactive Lab 2: Section B (Binomial & Poisson PMF) ---
  const [distType, setDistType] = useState<'binomial' | 'poisson'>('poisson');
  const [binomN, setBinomN] = useState<number>(20);
  const [binomP, setBinomP] = useState<number>(0.35);
  const [binomK, setBinomK] = useState<number>(7);
  const [poissonLambda, setPoissonLambda] = useState<number>(18);
  const [poissonK, setPoissonK] = useState<number>(20);

  const binomResult = useMemo(() => {
    if (binomK < 0 || binomK > binomN || binomP < 0 || binomP > 1) return { pmf: 0, mean: 0, variance: 0 };
    // nCk
    let c = 1;
    for (let i = 1; i <= binomK; i++) {
      c = (c * (binomN - i + 1)) / i;
    }
    const pmf = c * Math.pow(binomP, binomK) * Math.pow(1 - binomP, binomN - binomK);
    return {
      pmf,
      mean: binomN * binomP,
      variance: binomN * binomP * (1 - binomP),
    };
  }, [binomN, binomP, binomK]);

  const poissonResult = useMemo(() => {
    const pmf = poissonPMF(poissonLambda, poissonK);
    return {
      pmf,
      mean: poissonLambda,
      variance: poissonLambda,
    };
  }, [poissonLambda, poissonK]);

  // --- Interactive Lab 3: Section C (One-Way ANOVA across 3 Groups) ---
  const [groupMorning, setGroupMorning] = useState<string>('35, 38, 40, 36, 42');
  const [groupNoon, setGroupNoon] = useState<string>('128, 132, 135, 130, 140');
  const [groupEvening, setGroupEvening] = useState<string>('54, 58, 62, 56, 68');

  const anovaResult = useMemo(() => {
    const parseList = (str: string) =>
      str.split(',').map((s) => parseFloat(s.trim())).filter((v) => !isNaN(v));
    const g1 = parseList(groupMorning);
    const g2 = parseList(groupNoon);
    const g3 = parseList(groupEvening);
    const all = [...g1, ...g2, ...g3];
    const N = all.length;
    if (N === 0 || g1.length === 0 || g2.length === 0 || g3.length === 0) {
      return { fVal: 0, pVal: 1, ssBetween: 0, ssWithin: 0, msBetween: 0, msWithin: 0 };
    }
    const grandMean = all.reduce((a, b) => a + b, 0) / N;
    const groups = [g1, g2, g3];
    let ssBetween = 0;
    let ssWithin = 0;

    groups.forEach((grp) => {
      const gMean = grp.reduce((a, b) => a + b, 0) / grp.length;
      ssBetween += grp.length * Math.pow(gMean - grandMean, 2);
      ssWithin += grp.reduce((a, b) => a + Math.pow(b - gMean, 2), 0);
    });

    const dfB = 3 - 1;
    const dfW = N - 3;
    const msBetween = dfB > 0 ? ssBetween / dfB : 0;
    const msWithin = dfW > 0 ? ssWithin / dfW : 1;
    const fVal = msWithin > 0 ? msBetween / msWithin : 0;
    const pVal = fDistributionPValue(fVal, dfB, dfW);

    return { fVal, pVal, ssBetween, ssWithin, msBetween, msWithin, dfB, dfW };
  }, [groupMorning, groupNoon, groupEvening]);

  // --- Interactive Lab 4: Section D (Chi-Square Goodness-of-Fit) ---
  const [chiObs, setChiObs] = useState<number[]>([25, 20, 8, 3]);
  const [chiExp, setChiExp] = useState<number[]>([14, 14, 14, 14]);

  const chiResult = useMemo(() => {
    let chi2 = 0;
    for (let i = 0; i < 4; i++) {
      const o = chiObs[i] || 0;
      const e = chiExp[i] || 1;
      chi2 += Math.pow(o - e, 2) / e;
    }
    const df = 4 - 1;
    const pVal = chiSquarePValue(chi2, df);
    const criticalVal = 7.815; // alpha = 0.05, df = 3
    const isSignificant = chi2 > criticalVal;
    return { chi2, df, pVal, criticalVal, isSignificant };
  }, [chiObs, chiExp]);

  // --- Interactive Lab 5: Section E (Run Test for Randomness) ---
  const [runSequence, setRunSequence] = useState<string>('H, H, L, L, H, L, H, H, H, L, L, H, L, H');
  const runTestResult = useMemo(() => {
    const tokens = runSequence
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);
    if (tokens.length === 0) return { runs: 0, n1: 0, n2: 0, mu: 0, sigma: 0, z: 0, isRandom: true };

    const firstToken = tokens[0];
    const n1 = tokens.filter((t) => t === firstToken).length;
    const n2 = tokens.length - n1;

    let runs = 1;
    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i] !== tokens[i - 1]) runs++;
    }

    if (n1 === 0 || n2 === 0) {
      return { runs, n1, n2, mu: 0, sigma: 0, z: 0, isRandom: false };
    }

    const nTotal = n1 + n2;
    const mu = 1 + (2 * n1 * n2) / nTotal;
    const variance =
      (2 * n1 * n2 * (2 * n1 * n2 - nTotal)) / (Math.pow(nTotal, 2) * (nTotal - 1));
    const sigma = Math.sqrt(Math.max(0, variance));
    const z = sigma > 0 ? (runs - mu) / sigma : 0;
    const isRandom = Math.abs(z) <= 1.96;

    return { runs, n1, n2, mu, sigma, z, isRandom };
  }, [runSequence]);

  // Filtered concepts based on section and search query
  const filteredConcepts = useMemo(() => {
    return ASSP_CONCEPTS_DATA.filter((concept) => {
      const matchesSection =
        selectedSection === 'ALL' || concept.section === selectedSection;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesSection;

      const matchesSearch =
        concept.title.toLowerCase().includes(q) ||
        concept.whatItCalculates.toLowerCase().includes(q) ||
        concept.formula.toLowerCase().includes(q) ||
        concept.wifiApplication.toLowerCase().includes(q) ||
        (concept.datasetConnection && concept.datasetConnection.toLowerCase().includes(q)) ||
        concept.variables.some(
          (v) =>
            v.symbol.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
        );

      return matchesSection && matchesSearch;
    });
  }, [selectedSection, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#181818] via-[#1a1710] to-[#181818] p-6 rounded-2xl border border-[#66531C] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Applied Statistics & Stochastic Processes
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30">
                Authoritative Mathematical Reference
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Core ASSP Mathematical Concepts & Formulas
            </h1>
            <p className="text-sm text-[#BDBDBD] mt-1 max-w-3xl leading-relaxed">
              Standardized mathematical definitions, exact formulas, variable symbol meanings, assumptions, and practical 
              Wi-Fi network load engineering applications. All formulas strictly correspond to the foundational ASSP curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-[#202020] px-4 py-2 rounded-xl border border-[#66531C]/60 text-right">
              <div className="text-[11px] text-[#BDBDBD] uppercase tracking-wider font-semibold">Total Formulas</div>
              <div className="text-2xl font-black text-[#D4AF37]">{ASSP_CONCEPTS_DATA.length}</div>
            </div>
          </div>
        </div>

        {/* Dataset Variables Bridge Banner */}
        <div className="mt-5 pt-4 border-t border-[#66531C]/40 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: 'Day', desc: 'Categorical schedule factor', type: 'Factor' },
            { label: 'Hour', desc: 'Discrete time index [0 - 23]', type: 'Discrete' },
            { label: 'Active_Users', desc: 'Connected device count', type: 'Discrete RV' },
            { label: 'Bandwidth_%', desc: 'Continuous utilization rate', type: 'Continuous RV' },
            { label: 'New_Conns/10m', desc: 'Poisson arrival sample', type: 'Discrete RV' },
            { label: 'Network_State', desc: 'Markov state {L, M, H, C}', type: 'State Space' },
          ].map((field, idx) => (
            <div
              key={idx}
              className="bg-[#121212] p-2.5 rounded-lg border border-[#66531C]/40 hover:border-[#D4AF37]/50 transition"
            >
              <div className="text-[10px] text-[#D4AF37] font-mono font-bold">{field.label}</div>
              <div className="text-[11px] text-white font-medium truncate">{field.desc}</div>
              <div className="text-[9px] text-[#BDBDBD] mt-0.5 uppercase tracking-wider">{field.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Filter & Search Controls */}
      <div className="space-y-4">
        {/* Section Tabs with 21st.dev Framer Motion Sliding Indicator */}
        <AnimatedTabs<SectionFilter>
          tabs={[
            { id: 'ALL', label: 'All Mathematical Concepts', count: ASSP_CONCEPTS_DATA.length },
            { id: 'A', label: 'Section A: Random Variables & Probability', count: ASSP_CONCEPTS_DATA.filter(c => c.section === 'A').length },
            { id: 'B', label: 'Section B: Probability Distributions', count: ASSP_CONCEPTS_DATA.filter(c => c.section === 'B').length },
            { id: 'C', label: 'Section C: Hypothesis Testing & ANOVA', count: ASSP_CONCEPTS_DATA.filter(c => c.section === 'C').length },
            { id: 'D', label: 'Section D: Chi-Square Test', count: ASSP_CONCEPTS_DATA.filter(c => c.section === 'D').length },
            { id: 'E', label: 'Section E: Non-Parametric Tests', count: ASSP_CONCEPTS_DATA.filter(c => c.section === 'E').length },
            { id: 'TECHNIQUES', label: 'Applied Project Stochastic Techniques', count: 4 },
          ]}
          activeTab={selectedSection}
          onChange={setSelectedSection}
          layoutId="coreConceptsSectionFilterPill"
        />

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151515] p-3 rounded-xl border border-[#66531C]/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, symbols, tests..."
              className="w-full bg-[#101010] border border-[#66531C]/60 focus:border-[#D4AF37] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#E53935] hover:underline px-2 py-1"
              >
                Clear Search
              </button>
            )}
            <span className="text-xs text-[#BDBDBD]">
              Showing <span className="font-bold text-[#D4AF37]">{filteredConcepts.length}</span> formula cards
            </span>
          </div>
        </div>
      </div>

      {/* Interactive ASSP Mathematical Labs */}
      <Card
        title="Interactive ASSP Mathematical Computation Labs"
        subtitle="Validate and test theoretical mathematical calculations using user-defined data series"
      >
        <div className="space-y-4">
          {/* Lab Switcher Tabs with Framer Motion Sliding Pill */}
          <AnimatedTabs<'A' | 'B' | 'C' | 'D' | 'E'>
            tabs={[
              { id: 'A', label: 'Section A: Mean, Variance & Std Dev' },
              { id: 'B', label: 'Section B: Discrete PMF (Binomial & Poisson)' },
              { id: 'C', label: 'Section C: One-Way ANOVA F-Ratio' },
              { id: 'D', label: 'Section D: Chi-Square Goodness-of-Fit' },
              { id: 'E', label: 'Section E: Wald-Wolfowitz Run Test' },
            ]}
            activeTab={activeLab}
            onChange={(id) => setActiveLab(id)}
            layoutId="coreConceptsLabTabPill"
            size="sm"
          />

          {/* Lab A: Expectation and Variance */}
          {activeLab === 'A' && (
            <div className="space-y-4 pt-2">
              <div className="text-xs text-[#BDBDBD] leading-relaxed">
                Computes sample mean <span className="text-[#D4AF37] font-mono">\bar&#123;x&#125;</span>, sample variance <span className="text-[#00C853] font-mono">s^2</span>, sample standard deviation <span className="text-[#FF9800] font-mono">s</span>, and standard error <span className="text-white font-mono">SE</span> directly from an active user observation sequence.
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Active Users Sample Series (Comma-separated values):
                </label>
                <input
                  type="text"
                  value={labAInputs}
                  onChange={(e) => setLabAInputs(e.target.value)}
                  className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Count (n)</div>
                  <div className="text-xl font-bold text-white">{nA}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Sample Mean (x̄)</div>
                  <div className="text-xl font-bold text-[#D4AF37]">{meanA.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Sample Variance (s²)</div>
                  <div className="text-xl font-bold text-[#00C853]">{varA.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Std Dev (s)</div>
                  <div className="text-xl font-bold text-[#FF9800]">{stdA.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Std Error (s/√n)</div>
                  <div className="text-xl font-bold text-purple-400">{seA.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Lab B: Binomial and Poisson Distributions */}
          {activeLab === 'B' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-neutral-300 font-semibold">Select Model:</span>
                <button
                  onClick={() => setDistType('poisson')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    distType === 'poisson'
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-[#202020] text-neutral-300 border border-[#66531C]/50'
                  }`}
                >
                  Poisson Distribution
                </button>
                <button
                  onClick={() => setDistType('binomial')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    distType === 'binomial'
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-[#202020] text-neutral-300 border border-[#66531C]/50'
                  }`}
                >
                  Binomial Distribution
                </button>
              </div>

              {distType === 'poisson' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Arrival Rate parameter (λ arrivals / 10 min):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={poissonLambda}
                        onChange={(e) => setPoissonLambda(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Target Exact Arrivals (x):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={poissonK}
                        onChange={(e) => setPoissonK(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">P(X = {poissonK})</div>
                      <div className="text-xl font-bold text-[#D4AF37]">
                        {(poissonResult.pmf * 100).toFixed(4)}%
                      </div>
                    </div>
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">Theoretical Mean E[X] = λ</div>
                      <div className="text-xl font-bold text-[#00C853]">{poissonResult.mean.toFixed(2)}</div>
                    </div>
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">Theoretical Var V(X) = λ</div>
                      <div className="text-xl font-bold text-[#FF9800]">{poissonResult.variance.toFixed(2)}</div>
                    </div>
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">Std Dev (√λ)</div>
                      <div className="text-xl font-bold text-white">{Math.sqrt(poissonResult.variance).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Number of Trials (n devices):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={binomN}
                        onChange={(e) => setBinomN(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Success Probability p:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={binomP}
                        onChange={(e) => setBinomP(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Target Successes (k):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={binomN}
                        value={binomK}
                        onChange={(e) => setBinomK(Math.min(binomN, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">P(X = {binomK})</div>
                      <div className="text-xl font-bold text-[#D4AF37]">
                        {(binomResult.pmf * 100).toFixed(4)}%
                      </div>
                    </div>
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">Mean E[X] = np</div>
                      <div className="text-xl font-bold text-[#00C853]">{binomResult.mean.toFixed(2)}</div>
                    </div>
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">Variance V(X) = npq</div>
                      <div className="text-xl font-bold text-[#FF9800]">{binomResult.variance.toFixed(2)}</div>
                    </div>
                    <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                      <div className="text-[11px] text-[#BDBDBD]">Std Dev (√(npq))</div>
                      <div className="text-xl font-bold text-white">{Math.sqrt(binomResult.variance).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lab C: One-Way ANOVA */}
          {activeLab === 'C' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Morning Schedule Group:
                  </label>
                  <input
                    type="text"
                    value={groupMorning}
                    onChange={(e) => setGroupMorning(e.target.value)}
                    className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Peak Noon Schedule Group:
                  </label>
                  <input
                    type="text"
                    value={groupNoon}
                    onChange={(e) => setGroupNoon(e.target.value)}
                    className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Evening Schedule Group:
                  </label>
                  <input
                    type="text"
                    value={groupEvening}
                    onChange={(e) => setGroupEvening(e.target.value)}
                    className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Between MS (MSC)</div>
                  <div className="text-lg font-bold text-[#D4AF37]">{anovaResult.msBetween.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Within MS (MSE)</div>
                  <div className="text-lg font-bold text-white">{anovaResult.msWithin.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">F-Statistic (MSC/MSE)</div>
                  <div className="text-lg font-bold text-[#00C853]">{anovaResult.fVal.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">p-value</div>
                  <div className="text-lg font-bold text-[#E53935]">
                    {anovaResult.pVal < 0.0001 ? '< 0.0001' : anovaResult.pVal.toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Decision rule: Reject H₀ if p &lt; 0.05. Result:{' '}
                <span className={anovaResult.pVal < 0.05 ? 'text-[#00C853] font-bold' : 'text-[#FF9800] font-bold'}>
                  {anovaResult.pVal < 0.05 ? 'Statistically significant difference across time intervals.' : 'No significant difference.'}
                </span>
              </div>
            </div>
          )}

          {/* Lab D: Chi-Square Test */}
          {activeLab === 'D' && (
            <div className="space-y-4 pt-2">
              <div className="text-xs text-[#BDBDBD]">
                Tests whether observed frequencies of network states (Low, Medium, High, Congested) match expected counts:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Low', 'Medium', 'High', 'Congested'].map((st, i) => (
                  <div key={st} className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40 space-y-1">
                    <div className="text-xs font-bold text-[#D4AF37]">{st} State</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400">Obs:</span>
                      <input
                        type="number"
                        min="0"
                        value={chiObs[i]}
                        onChange={(e) => {
                          const next = [...chiObs];
                          next[i] = parseInt(e.target.value) || 0;
                          setChiObs(next);
                        }}
                        className="w-16 bg-[#101010] border border-[#66531C] px-1.5 py-0.5 text-xs text-white rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400">Exp:</span>
                      <input
                        type="number"
                        min="1"
                        value={chiExp[i]}
                        onChange={(e) => {
                          const next = [...chiExp];
                          next[i] = Math.max(1, parseInt(e.target.value) || 1);
                          setChiExp(next);
                        }}
                        className="w-16 bg-[#101010] border border-[#66531C] px-1.5 py-0.5 text-xs text-white rounded font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Chi-Square Statistic (χ²)</div>
                  <div className="text-xl font-bold text-[#D4AF37]">{chiResult.chi2.toFixed(3)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Degrees of Freedom (df = k-1)</div>
                  <div className="text-xl font-bold text-white">{chiResult.df}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Critical χ² (α = 0.05)</div>
                  <div className="text-xl font-bold text-[#00C853]">{chiResult.criticalVal}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">p-value</div>
                  <div className="text-xl font-bold text-[#E53935]">
                    {chiResult.pVal < 0.0001 ? '< 0.0001' : chiResult.pVal.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lab E: Run Test */}
          {activeLab === 'E' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Binary State Sequence (e.g., H for High Load, L for Low Load):
                </label>
                <input
                  type="text"
                  value={runSequence}
                  onChange={(e) => setRunSequence(e.target.value)}
                  className="w-full bg-[#101010] border border-[#66531C] rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Total Runs (G)</div>
                  <div className="text-xl font-bold text-white">{runTestResult.runs}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Counts (n₁, n₂)</div>
                  <div className="text-xl font-bold text-[#D4AF37]">
                    {runTestResult.n1}, {runTestResult.n2}
                  </div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Expected Runs (μ_G)</div>
                  <div className="text-xl font-bold text-[#00C853]">{runTestResult.mu.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Std Error (σ_G)</div>
                  <div className="text-xl font-bold text-[#FF9800]">{runTestResult.sigma.toFixed(2)}</div>
                </div>
                <div className="bg-[#151515] p-3 rounded-lg border border-[#66531C]/40">
                  <div className="text-[11px] text-[#BDBDBD]">Z-Statistic</div>
                  <div className="text-xl font-bold text-purple-400">{runTestResult.z.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Randomness Decision (|Z| ≤ 1.96 at 5% significance):{' '}
                <span className={runTestResult.isRandom ? 'text-[#00C853] font-bold' : 'text-[#E53935] font-bold'}>
                  {runTestResult.isRandom ? 'Sequence is consistent with random order.' : 'Sequence exhibits non-random clustering or trend.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Main Formula Cards Grid */}
      {selectedSection !== 'TECHNIQUES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {selectedSection === 'ALL'
                  ? 'All Academic Concepts'
                  : selectedSection === 'A'
                  ? 'Section A: Random Variables and Probability'
                  : selectedSection === 'B'
                  ? 'Section B: Probability Distributions'
                  : selectedSection === 'C'
                  ? 'Section C: Hypothesis Testing & Decision Making'
                  : selectedSection === 'D'
                  ? 'Section D: Chi-Square Test'
                  : 'Section E: Non-Parametric Tests'}
              </span>
            </h2>
            <span className="text-xs text-[#BDBDBD]">
              {filteredConcepts.length} concepts available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredConcepts.map((concept) => (
              <FormulaCard key={concept.id} item={concept} />
            ))}
          </div>
        </div>
      )}

      {/* Section: Applied Project Stochastic Techniques (Bridge section) */}
      {(selectedSection === 'ALL' || selectedSection === 'TECHNIQUES') && (
        <div className="space-y-6 pt-4 border-t border-[#66531C]/50">
          <div className="bg-[#181818] p-5 rounded-2xl border border-[#66531C] shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF9800]/20 text-[#FF9800] border border-[#FF9800]/40 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                Applied Project Stochastic Techniques
              </span>
              <span className="text-xs text-[#BDBDBD]">
                Stochastic models extending the statistical foundations into operational Wi-Fi predictive algorithms
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Stochastic Processes & Predictive Modeling Framework
            </h2>
            <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed">
              These stochastic techniques operationalize the foundational probability definitions, hypothesis tests, and distribution 
              models across dynamic network time series.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technique 1: Discrete-Time Markov Chain */}
            <div className="bg-[#181818] rounded-xl border border-[#66531C]/60 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#66531C]/40 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-bold text-white text-base">Discrete-Time Markov Chain (DTMC)</h3>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#66531C]/40 text-[#D4AF37]">
                  Stochastic Transition
                </span>
              </div>
              <div className="bg-[#101010] px-3 py-4 rounded-lg border border-[#66531C]/50 w-full max-w-full min-w-0 overflow-hidden flex items-center justify-center text-center">
                <MathRenderer
                  math="P(X_{n+1} = j \mid X_n = i, X_{n-1} = i_{n-1}, \dots, X_0 = i_0) = P(X_{n+1} = j \mid X_n = i) = P_{ij}"
                  block
                />
              </div>
              <div className="text-xs text-[#BDBDBD] leading-relaxed">
                <strong className="text-[#D4AF37]">Markovian Property:</strong> Future network state depends solely upon current state <span className="font-mono text-white">X_n</span>, independent of historical trajectory.
              </div>
              <div className="bg-[#141414] p-3 rounded-lg border border-[#66531C]/30 text-xs space-y-1">
                <div className="font-semibold text-white">Wi-Fi Implementation:</div>
                <p className="text-neutral-300">
                  Empirical transition matrix <span className="font-mono text-[#D4AF37]">P_&#123;ij&#125; = N_&#123;ij&#125; / \sum_k N_&#123;ik&#125;</span> across state space <span className="font-mono text-white">&#123;Low, Medium, High, Congested&#125;</span> with stationary distribution <span className="font-mono text-[#00C853]">\pi P = \pi</span>.
                </p>
                <div className="text-[11px] text-[#BDBDBD] pt-1">
                  Connected Field: <span className="text-[#D4AF37] font-mono">Network_State</span>
                </div>
              </div>
            </div>

            {/* Technique 2: Poisson Connection Arrival Process */}
            <div className="bg-[#181818] rounded-xl border border-[#66531C]/60 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#66531C]/40 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00C853]" />
                  <h3 className="font-bold text-white text-base">Poisson Connection Arrival Counting Process</h3>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#00C853]/15 text-[#00C853]">
                  Arrival Dynamics
                </span>
              </div>
              <div className="bg-[#101010] px-3 py-4 rounded-lg border border-[#66531C]/50 w-full max-w-full min-w-0 overflow-hidden flex items-center justify-center text-center">
                <MathRenderer
                  math="P(N(t+s) - N(s) = k) = \frac{(\lambda t)^k e^{-\lambda t}}{k!}, \quad k = 0, 1, 2, \dots"
                  block
                />
              </div>
              <div className="text-xs text-[#BDBDBD] leading-relaxed">
                <strong className="text-[#00C853]">Stationary & Independent Increments:</strong> Number of new device connections in non-overlapping intervals are mutually independent with parameter <span className="font-mono text-white">\lambda t</span>.
              </div>
              <div className="bg-[#141414] p-3 rounded-lg border border-[#66531C]/30 text-xs space-y-1">
                <div className="font-semibold text-white">Wi-Fi Implementation:</div>
                <p className="text-neutral-300">
                  Models bursts of student devices joining campus access points between lectures; inter-arrival times are exponentially distributed.
                </p>
                <div className="text-[11px] text-[#BDBDBD] pt-1">
                  Connected Field: <span className="text-[#D4AF37] font-mono">New_Connections_Per_10min</span>
                </div>
              </div>
            </div>

            {/* Technique 3: Monte Carlo Congestion Risk Simulation */}
            <div className="bg-[#181818] rounded-xl border border-[#66531C]/60 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#66531C]/40 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#FF9800]" />
                  <h3 className="font-bold text-white text-base">Monte Carlo Congestion Risk Simulation</h3>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FF9800]/15 text-[#FF9800]">
                  Stochastic Simulation
                </span>
              </div>
              <div className="bg-[#101010] px-3 py-4 rounded-lg border border-[#66531C]/50 w-full max-w-full min-w-0 overflow-hidden flex items-center justify-center text-center">
                <MathRenderer
                  math="\hat{P}(\text{Congestion}) = \frac{1}{M} \sum_{m=1}^{M} \mathbb{I}(\text{State}_m = \text{Congested})"
                  block
                />
              </div>
              <div className="text-xs text-[#BDBDBD] leading-relaxed">
                <strong className="text-[#FF9800]">Law of Large Numbers:</strong> Simulates <span className="font-mono text-white">M = 10,000</span> random paths through empirical transition kernel to yield unbiased risk probabilities.
              </div>
              <div className="bg-[#141414] p-3 rounded-lg border border-[#66531C]/30 text-xs space-y-1">
                <div className="font-semibold text-white">Wi-Fi Implementation:</div>
                <p className="text-neutral-300">
                  Estimates the probability that campus Wi-Fi enters critical congestion state within next 1 to 6 steps from any given state.
                </p>
                <div className="text-[11px] text-[#BDBDBD] pt-1">
                  Connected Fields: <span className="text-[#D4AF37] font-mono">Network_State, Active_Users</span>
                </div>
              </div>
            </div>

            {/* Technique 4: Correlation & Bandwidth Regression */}
            <div className="bg-[#181818] rounded-xl border border-[#66531C]/60 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#66531C]/40 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-base">Correlation & Ordinary Least Squares Regression</h3>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400">
                  Predictive Modeling
                </span>
              </div>
              <div className="bg-[#101010] px-3 py-4 rounded-lg border border-[#66531C]/50 w-full max-w-full min-w-0 overflow-hidden flex items-center justify-center text-center">
                <MathRenderer
                  math="\hat{Y} = \hat{\beta}_0 + \hat{\beta}_1 X, \quad \hat{\beta}_1 = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}"
                  block
                />
              </div>
              <div className="text-xs text-[#BDBDBD] leading-relaxed">
                <strong className="text-purple-400">Ordinary Least Squares:</strong> Minimizes residual sum of squares <span className="font-mono text-white">{"\\sum (y_i - \\hat{y}_i)^2"}</span> to estimate bandwidth demand from connected user load.
              </div>
              <div className="bg-[#141414] p-3 rounded-lg border border-[#66531C]/30 text-xs space-y-1">
                <div className="font-semibold text-white">Wi-Fi Implementation:</div>
                <p className="text-neutral-300">
                  Predicts continuous <span className="font-mono text-white">Bandwidth_Utilization_Percent</span> directly from integer <span className="font-mono text-white">Active_Users</span> count.
                </p>
                <div className="text-[11px] text-[#BDBDBD] pt-1">
                  Connected Fields: <span className="text-[#D4AF37] font-mono">Active_Users, Bandwidth_Utilization_Percent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
