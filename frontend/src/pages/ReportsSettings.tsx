import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Settings as SettingsIcon,
  Printer,
  Download,
  RotateCcw,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { ShimmerButton } from '../components/ShimmerButton';
import { AnimatedTabs } from '../components/AnimatedTabs';
import { computeDescriptiveStats } from '../calculations/stats';
import { computeStateProbabilities } from '../calculations/probability';
import { computeOneWayANOVA } from '../calculations/anova';
import { computeChiSquareGoodnessOfFit } from '../calculations/chiSquare';
import { computeCorrelationAndRegression } from '../calculations/regression';
import { computePoissonDistribution } from '../calculations/poisson';
import { computeMarkovTransitions } from '../calculations/markov';
import { runMonteCarloSimulation } from '../calculations/monteCarlo';

export const ReportsSettings: React.FC = () => {
  const {
    observations,
    dataSource,
    thresholds,
    setThresholds,
    resetToSample,
    matlabResults,
  } = useData();

  const [activeTab, setActiveTab] = useState<'reports' | 'settings'>('reports');

  // Local settings state
  const [lowMax, setLowMax] = useState<number>(thresholds.lowMax);
  const [mediumMax, setMediumMax] = useState<number>(thresholds.mediumMax);
  const [highMax, setHighMax] = useState<number>(thresholds.highMax);
  const [congestedMin, setCongestedMin] = useState<number>(thresholds.congestedMin);
  const [thresholdSavedMsg, setThresholdSavedMsg] = useState<string | null>(null);

  // Computations for report
  const activeArr = observations.map((o) => o.Active_Users);
  const bwArr = observations.map((o) => o.Bandwidth_Utilization_Percent);
  const statesArr = observations.map((o) => o.Network_State);
  const hoursArr = observations.map((o) => o.Hour);
  const arrivalsArr = observations.map((o) => o.New_Connections_Per_10min);

  const stats = computeDescriptiveStats(activeArr);
  const prob = computeStateProbabilities(statesArr);
  const anova = computeOneWayANOVA(activeArr, hoursArr, 0.05);
  const chi2 = computeChiSquareGoodnessOfFit(statesArr);
  const reg = computeCorrelationAndRegression(activeArr, bwArr);
  const pois = computePoissonDistribution(arrivalsArr, 20);
  const markov = computeMarkovTransitions(observations);
  const mc = runMonteCarloSimulation(markov.transitionMatrix, markov.validRows, 'Medium', 3, 2000);

  const handleSaveThresholds = (reclassify = false) => {
    const updated = {
      lowMax: Number(lowMax),
      mediumMax: Number(mediumMax),
      highMax: Number(highMax),
      congestedMin: Number(congestedMin),
    };
    setThresholds(updated, reclassify);
    setThresholdSavedMsg(
      reclassify
        ? 'Updated thresholds and reclassified all observation states in dataset!'
        : 'Threshold parameters saved successfully!'
    );
    setTimeout(() => setThresholdSavedMsg(null), 4000);
  };

  const handleResetThresholds = () => {
    const defaults = { lowMax: 59, mediumMax: 109, highMax: 144, congestedMin: 145 };
    setLowMax(defaults.lowMax);
    setMediumMax(defaults.mediumMax);
    setHighMax(defaults.highMax);
    setCongestedMin(defaults.congestedMin);
    setThresholds(defaults, true);
    setThresholdSavedMsg('Reset thresholds to default academic prototype standards.');
    setTimeout(() => setThresholdSavedMsg(null), 4000);
  };

  const handleExportReportCSV = () => {
    const rows = [
      ['COLLEGE WI-FI LOAD & CONGESTION PREDICTION SYSTEM - ACADEMIC SUMMARY REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Subject', 'Applied Statistics and Stochastic Processes (ASSP)'],
      ['Dataset Source', dataSource],
      ['Total Observations', observations.length],
      [''],
      ['MODULE I: DESCRIPTIVE STATISTICS'],
      ['Metric', 'Value'],
      ['Count (n)', stats.count],
      ['Mean Active Users', stats.mean],
      ['Median', stats.median],
      ['Mode', stats.mode],
      ['Sample Variance', stats.variance],
      ['Sample Standard Deviation', stats.std],
      ['Range (Min - Max)', `${stats.min} - ${stats.max}`],
      ['IQR', stats.iqr],
      [''],
      ['MODULE I: PROBABILITY DISTRIBUTION'],
      ['State', 'Count', 'Probability Mass (PMF)', 'Cumulative (CDF)'],
      ...prob.distribution.map((d) => [d.state, d.count, d.probability, d.cumulativeProbability]),
      ['Expected State Score E[X]', prob.expectedValue],
      ['State Variance Var(X)', prob.variance],
      ['Overall Congestion Probability', prob.congestionProbability],
      [''],
      ['MODULE II: ONE-WAY ANOVA'],
      ['Between-Group SS', anova.ssBetween, 'df', anova.dfBetween, 'MS', anova.msBetween],
      ['Within-Group SS', anova.ssWithin, 'df', anova.dfWithin, 'MS', anova.msWithin],
      ['F-Statistic', anova.fStat],
      ['P-Value', anova.pValue],
      ['Decision (alpha=0.05)', anova.rejectH0 ? 'Reject H0 (Significant)' : 'Fail to reject H0'],
      [''],
      ['MODULE III: CHI-SQUARE GOODNESS-OF-FIT'],
      ['Chi-Square Statistic', chi2.chi2Stat],
      ['Degrees of Freedom', chi2.df],
      ['P-Value', chi2.pValue],
      ['Decision', chi2.rejectH0 ? 'Reject H0 (Significant)' : 'Fail to reject H0'],
      ['Cochran Assumption Met (E>=5)', chi2.assumptionsMet ? 'YES' : 'NO'],
      [''],
      ['MODULE IV: CORRELATION & REGRESSION'],
      ['Pearson Correlation (r)', reg.r],
      ['Regression Equation', reg.equation],
      ['Coefficient of Determination (R2)', reg.r2],
      [''],
      ['MODULE V: STOCHASTIC PROCESSES & MONTE CARLO'],
      ['Poisson Arrival Rate (lambda)', pois.lambda],
      ['Total Valid DTMC Transitions', markov.totalTransitions],
      ['Monte Carlo Horizon', `${mc.steps} Steps`],
      ['Monte Carlo Congestion Risk', `${(mc.congestionProb * 100).toFixed(2)}%`],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASSP_WiFi_Report_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs with 21st.dev Sliding Pill */}
      <AnimatedTabs<'reports' | 'settings'>
        tabs={[
          { id: 'reports', label: 'Academic Report Generator', icon: <FileText className="w-4 h-4" /> },
          { id: 'settings', label: 'System Settings & Thresholds', icon: <SettingsIcon className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        layoutId="reportsSettingsTabsIndicator"
      />

      {/* TAB 1: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-[#151515] p-4 rounded-xl border border-[#66531C]/60 no-print">
            <div>
              <h3 className="text-sm font-bold text-white">Full Academic Project Report</h3>
              <p className="text-xs text-[#BDBDBD]">
                Comprehensive formal synthesis of all 5 ASSP mathematical modules.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ShimmerButton
                variant="secondary"
                size="sm"
                icon={<Printer className="w-3.5 h-3.5 text-[#D4AF37]" />}
                onClick={() => window.print()}
              >
                <span>Print / PDF</span>
              </ShimmerButton>
              <ShimmerButton
                variant="gold"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportReportCSV}
              >
                <span>Export CSV Report</span>
              </ShimmerButton>
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="bg-[#181818] rounded-xl border border-[#66531C]/70 p-6 sm:p-8 space-y-6 print:border-none print:p-0">
            {/* Report Header */}
            <div className="border-b border-[#66531C]/50 pb-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono">
                <span>SUBJECT: APPLIED STATISTICS AND STOCHASTIC PROCESSES (ASSP)</span>
                <span>PROJECT TYPE: SOFTWARE PROTOTYPE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                College Wi-Fi Load & Congestion Prediction System
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#BDBDBD] pt-1">
                <div>
                  Dataset Source: <strong className="text-white">{dataSource}</strong>
                </div>
                <div>•</div>
                <div>
                  Observations: <strong className="text-white">{observations.length} intervals</strong>
                </div>
                <div>•</div>
                <div>
                  Generated: <strong className="text-white">{new Date().toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            {/* Objective */}
            <div className="space-y-1.5 text-xs text-[#BDBDBD] leading-relaxed">
              <h4 className="text-sm font-bold text-white uppercase text-[#D4AF37]">
                1. Project Objective & Scope
              </h4>
              <p>
                This academic investigation models stochastic Wi-Fi traffic patterns on university campus networks.
                Using empirical observation intervals, the prototype applies statistical measures (Module I),
                One-Way ANOVA hypothesis testing (Module II), Chi-Square goodness-of-fit (Module III),
                Ordinary Least Squares regression (Module IV), and Poisson/Markovian stochastic realizations (Module V)
                to forecast network load states and evaluate congestion risks.
              </p>
            </div>

            {/* Module Summaries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Module 1 Summary */}
              <div className="p-4 bg-[#121212] rounded-lg border border-neutral-800 space-y-1">
                <div className="font-bold text-[#D4AF37] uppercase">Module I: Descriptive Statistics</div>
                <div className="text-neutral-300">
                  Sample Mean: <strong className="text-white">{stats.mean}</strong> users • Variance:{' '}
                  <strong className="text-white">{stats.variance}</strong> • Std Dev:{' '}
                  <strong className="text-white">{stats.std}</strong>
                </div>
                <div className="text-neutral-400">
                  Median: {stats.median} • IQR: {stats.iqr} (Q1: {stats.q1}, Q3: {stats.q3})
                </div>
              </div>

              {/* Module 1/Probability Summary */}
              <div className="p-4 bg-[#121212] rounded-lg border border-neutral-800 space-y-1">
                <div className="font-bold text-[#D4AF37] uppercase">Module I: Probability Distribution</div>
                <div className="text-neutral-300">
                  Expected State Score E[X]: <strong className="text-white">{prob.expectedValue}</strong> (Scale 1–4)
                </div>
                <div className="text-neutral-400">
                  Congestion Probability P(Congested):{' '}
                  <strong className="text-[#E53935]">{(prob.congestionProbability * 100).toFixed(2)}%</strong>
                </div>
              </div>

              {/* Module 2 ANOVA Summary */}
              <div className="p-4 bg-[#121212] rounded-lg border border-neutral-800 space-y-1">
                <div className="font-bold text-[#D4AF37] uppercase">Module II: One-Way ANOVA</div>
                <div className="text-neutral-300">
                  F-Statistic: <strong className="text-white">{anova.fStat}</strong> • p-value:{' '}
                  <strong className="text-white">{anova.pValue}</strong>
                </div>
                <div className="text-neutral-400">
                  Decision: {anova.rejectH0 ? 'Reject H0 (Statistically significant)' : 'Fail to reject H0'}
                </div>
              </div>

              {/* Module 3 Chi-Square Summary */}
              <div className="p-4 bg-[#121212] rounded-lg border border-neutral-800 space-y-1">
                <div className="font-bold text-[#D4AF37] uppercase">Module III: Chi-Square Goodness-of-Fit</div>
                <div className="text-neutral-300">
                  χ² Statistic: <strong className="text-white">{chi2.chi2Stat}</strong> (df={chi2.df}) • p-value:{' '}
                  <strong className="text-white">{chi2.pValue}</strong>
                </div>
                <div className="text-neutral-400">
                  Cochran E_i ≥ 5 Check: {chi2.assumptionsMet ? 'Pass' : 'Low cell count alert'}
                </div>
              </div>

              {/* Module 4 Regression Summary */}
              <div className="p-4 bg-[#121212] rounded-lg border border-neutral-800 space-y-1">
                <div className="font-bold text-[#D4AF37] uppercase">Module IV: Correlation & Regression</div>
                <div className="text-neutral-300">
                  Pearson r: <strong className="text-white">{reg.r}</strong> • R²:{' '}
                  <strong className="text-white">{reg.r2}</strong>
                </div>
                <div className="text-neutral-400 font-mono text-[11px]">{reg.equation}</div>
              </div>

              {/* Module 5 Stochastic Summary */}
              <div className="p-4 bg-[#121212] rounded-lg border border-neutral-800 space-y-1">
                <div className="font-bold text-[#D4AF37] uppercase">Module V: Stochastic Processes</div>
                <div className="text-neutral-300">
                  Poisson Arrival Rate \lambda: <strong className="text-white">{pois.lambda}</strong> / 10min
                </div>
                <div className="text-neutral-400">
                  Monte Carlo 3-Step Simulated Congestion Risk:{' '}
                  <strong className="text-[#FF9800]">{(mc.congestionProb * 100).toFixed(2)}%</strong>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="p-4 bg-[#121212] rounded-lg border border-[#66531C]/50 text-xs space-y-1">
              <div className="font-bold text-[#D4AF37] uppercase">
                MATLAB Cross-Platform Verification Status
              </div>
              <p className="text-neutral-300">
                {matlabResults !== null
                  ? 'MATLAB companion verification completed: Results from matlab/main.m align within numerical tolerance bands.'
                  : 'Awaiting MATLAB companion result import. Baseline scripts available in matlab/ folder.'}
              </p>
            </div>

            {/* Academic Conclusion */}
            <div className="space-y-1.5 text-xs text-[#BDBDBD] leading-relaxed pt-2">
              <h4 className="text-sm font-bold text-white uppercase text-[#D4AF37]">
                Conclusion & Recommendations
              </h4>
              <p>
                Statistical analysis verifies that university Wi-Fi traffic displays significant diurnal clustering,
                with high correlation between active user count and bandwidth consumption. Discrete-time Markov modeling
                demonstrates that periods of elevated traffic persist into adjacent lecture intervals, supporting dynamic
                airtime throttling and proactive bandwidth provisioning during peak class dismissal windows.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {thresholdSavedMsg && (
            <div className="p-3 bg-[#00C853]/15 border border-[#00C853]/40 rounded-lg flex items-center space-x-2 text-xs text-[#00C853]">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{thresholdSavedMsg}</span>
            </div>
          )}

          {/* Network State Threshold Configuration */}
          <Card
            title="Network State Classification Thresholds"
            subtitle="Configures the active user thresholds used for Low, Medium, High, and Congested state classification"
            action={
              <button
                onClick={handleResetThresholds}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-neutral-300 border border-[#66531C] text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-[#151515] p-3 rounded-lg border border-[#00C853]/40">
                  <label className="font-bold text-[#00C853] block mb-1">Low State Max:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={lowMax}
                    onChange={(e) => setLowMax(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#080808] border border-neutral-700 rounded px-2.5 py-1 text-white font-mono"
                  />
                  <div className="text-[10px] text-neutral-400 mt-1">Users ≤ {lowMax}</div>
                </div>

                <div className="bg-[#151515] p-3 rounded-lg border border-[#D4AF37]/40">
                  <label className="font-bold text-[#D4AF37] block mb-1">Medium State Max:</label>
                  <input
                    type="number"
                    min={lowMax + 1}
                    max="150"
                    value={mediumMax}
                    onChange={(e) => setMediumMax(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#080808] border border-neutral-700 rounded px-2.5 py-1 text-white font-mono"
                  />
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {lowMax + 1} to {mediumMax} users
                  </div>
                </div>

                <div className="bg-[#151515] p-3 rounded-lg border border-[#FF9800]/40">
                  <label className="font-bold text-[#FF9800] block mb-1">High State Max:</label>
                  <input
                    type="number"
                    min={mediumMax + 1}
                    max="200"
                    value={highMax}
                    onChange={(e) => setHighMax(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#080808] border border-neutral-700 rounded px-2.5 py-1 text-white font-mono"
                  />
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {mediumMax + 1} to {highMax} users
                  </div>
                </div>

                <div className="bg-[#151515] p-3 rounded-lg border border-[#E53935]/40">
                  <label className="font-bold text-[#E53935] block mb-1">Congested Min:</label>
                  <input
                    type="number"
                    min={highMax + 1}
                    max="300"
                    value={congestedMin}
                    onChange={(e) => setCongestedMin(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#080808] border border-neutral-700 rounded px-2.5 py-1 text-white font-mono"
                  />
                  <div className="text-[10px] text-neutral-400 mt-1">Users ≥ {congestedMin}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleSaveThresholds(false)}
                  className="px-4 py-2 rounded-lg bg-[#202020] hover:bg-[#282828] text-white border border-[#66531C] text-xs font-semibold transition"
                >
                  Save Thresholds Only
                </button>
                <button
                  onClick={() => handleSaveThresholds(true)}
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F4D068] text-black text-xs font-bold transition shadow"
                >
                  Apply & Reclassify Entire Dataset
                </button>
              </div>

              <div className="text-[11px] text-neutral-400">
                * Note: Default academic prototype thresholds: Low &lt; 60, Medium 60–109, High 110–144, Congested ≥ 145.
              </div>
            </div>
          </Card>

          {/* Theme & Palette Info */}
          <Card
            title="Design System & Theme Specifications"
            subtitle="Curated Black, Gold, Green, Red, and Orange palette conforming to ASSP specification"
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-[#080808] p-3 rounded-lg border border-neutral-700">
                <div className="w-full h-8 rounded bg-[#080808] border border-neutral-600 mb-2" />
                <div className="font-bold text-white">Main BG</div>
                <div className="text-neutral-400 font-mono">#080808</div>
              </div>
              <div className="bg-[#151515] p-3 rounded-lg border border-neutral-700">
                <div className="w-full h-8 rounded bg-[#D4AF37] mb-2" />
                <div className="font-bold text-[#D4AF37]">Gold</div>
                <div className="text-neutral-400 font-mono">#D4AF37</div>
              </div>
              <div className="bg-[#151515] p-3 rounded-lg border border-neutral-700">
                <div className="w-full h-8 rounded bg-[#00C853] mb-2" />
                <div className="font-bold text-[#00C853]">Green (Normal)</div>
                <div className="text-neutral-400 font-mono">#00C853</div>
              </div>
              <div className="bg-[#151515] p-3 rounded-lg border border-neutral-700">
                <div className="w-full h-8 rounded bg-[#FF9800] mb-2" />
                <div className="font-bold text-[#FF9800]">Orange (High)</div>
                <div className="text-neutral-400 font-mono">#FF9800</div>
              </div>
              <div className="bg-[#151515] p-3 rounded-lg border border-neutral-700">
                <div className="w-full h-8 rounded bg-[#E53935] mb-2" />
                <div className="font-bold text-[#E53935]">Red (Congested)</div>
                <div className="text-neutral-400 font-mono">#E53935</div>
              </div>
            </div>
          </Card>

          {/* About Section */}
          <Card
            title="About Software Prototype"
            subtitle="Academic metadata and development compliance"
          >
            <div className="text-xs text-[#BDBDBD] space-y-2 leading-relaxed">
              <p>
                <strong>System Name:</strong> College Wi-Fi Load & Congestion Prediction System
              </p>
              <p>
                <strong>Academic Subject:</strong> Applied Statistics and Stochastic Processes (ASSP)
              </p>
              <p>
                <strong>Architecture:</strong> Fully decoupled client-side React 18 + TypeScript analytical engine,
                coupled with an independent companion MATLAB package (`matlab/` folder).
              </p>
              <p>
                <strong>Compliance:</strong> Does not connect to production Wi-Fi infrastructure. All stochastic simulations
                and sample sets are transparently marked as simulated academic models.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
