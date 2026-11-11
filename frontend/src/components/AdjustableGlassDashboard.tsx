import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Users,
  Activity,
  Maximize2,
  Percent,
  AlertOctagon,
  Radio,
  TrendingUp,
  Sparkles,
  Sliders,
  Filter,
  Layers,
  Dice5,
  FileText,
  Download,
  RotateCcw,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from 'recharts';
import { useData } from '../context/DataContext';
import { computeDescriptiveStats } from '../calculations/stats';
import { computeStateProbabilities } from '../calculations/probability';
import { computeMarkovTransitions, MARKOV_STATES } from '../calculations/markov';
import { runMonteCarloSimulation } from '../calculations/monteCarlo';
import { computeCorrelationAndRegression } from '../calculations/regression';
import { exportObservationsToCSV } from '../utils/csvUtils';
import { NetworkState } from '../types';
import { ShimmerButton } from './ShimmerButton';

export type GlassTab = 'overview' | 'traffic' | 'intelligence' | 'prediction' | 'reports';
export type GlassTint = 'dark' | 'gold' | 'emerald' | 'crimson';

export interface GlassSettings {
  blur: number; // 0 - 32 px
  opacity: number; // 0.15 - 0.90
  saturation: number; // 100 - 220 %
  tint: GlassTint;
  borderGlow: boolean;
}

const DEFAULT_GLASS_SETTINGS: GlassSettings = {
  blur: 16,
  opacity: 0.50,
  saturation: 150,
  tint: 'dark',
  borderGlow: true,
};

export const AdjustableGlassDashboard: React.FC = () => {
  const { observations, dataSource } = useData();

  // Tab State
  const [activeTab, setActiveTab] = useState<GlassTab>('overview');

  // Glassmorphism Customizer State
  const [glassSettings, setGlassSettings] = useState<GlassSettings>(DEFAULT_GLASS_SETTINGS);
  const [showGlassControls, setShowGlassControls] = useState<boolean>(false);

  // Traffic Filters
  const [selectedDay, setSelectedDay] = useState<string>('All');

  // Monte Carlo local simulation controls
  const [mcHorizon, setMcHorizon] = useState<number>(3);
  const [mcSimCount, setMcSimCount] = useState<number>(2000);
  const [mcSimKey, setMcSimKey] = useState<number>(0);

  // Analytical Computations
  const activeUsersArr = useMemo(() => observations.map((o) => o.Active_Users), [observations]);
  const bandwidthArr = useMemo(() => observations.map((o) => o.Bandwidth_Utilization_Percent), [observations]);
  const statesArr = useMemo(() => observations.map((o) => o.Network_State), [observations]);

  const stats = useMemo(() => computeDescriptiveStats(activeUsersArr), [activeUsersArr]);
  const probData = useMemo(() => computeStateProbabilities(statesArr), [statesArr]);
  const markov = useMemo(() => computeMarkovTransitions(observations), [observations]);
  const regression = useMemo(() => computeCorrelationAndRegression(activeUsersArr, bandwidthArr), [activeUsersArr, bandwidthArr]);

  const latestObs = useMemo(() => {
    return observations[observations.length - 1] || {
      Active_Users: 0,
      Bandwidth_Utilization_Percent: 0,
      Network_State: 'Low' as NetworkState,
      Day: 'N/A',
      Hour: 'N/A',
      New_Connections_Per_10min: 0,
    };
  }, [observations]);

  const isCongested = latestObs.Network_State === 'Congested';
  const isHigh = latestObs.Network_State === 'High';

  const avgBandwidth = useMemo(() => {
    return bandwidthArr.length > 0
      ? (bandwidthArr.reduce((a, b) => a + b, 0) / bandwidthArr.length).toFixed(1)
      : '0.0';
  }, [bandwidthArr]);

  // Monte Carlo simulation execution
  const mcResult = useMemo(() => {
    try {
      const stateToUse = (['Low', 'Medium', 'High', 'Congested'].includes(latestObs.Network_State))
        ? latestObs.Network_State
        : 'Low';
      return runMonteCarloSimulation(
        markov?.transitionMatrix || [],
        markov?.validRows || [],
        stateToUse,
        mcHorizon,
        mcSimCount
      );
    } catch (e) {
      console.warn('Monte Carlo computation warning:', e);
      return {
        initialState: 'Low' as NetworkState,
        steps: mcHorizon,
        simulations: mcSimCount,
        congestedCount: 0,
        congestionProb: 0,
        finalDistribution: [],
        convergencePoints: [],
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markov, latestObs.Network_State, mcHorizon, mcSimCount, mcSimKey]);

  // Traffic filtered dataset
  const filteredTraffic = useMemo(() => {
    if (selectedDay === 'All') return observations;
    return observations.filter((o) => o.Day === selectedDay);
  }, [observations, selectedDay]);

  // Hourly chart data
  const hourlyDataMap: Record<string, { totalUsers: number; totalBw: number; count: number }> = {};
  for (const obs of filteredTraffic) {
    if (!hourlyDataMap[obs.Hour]) {
      hourlyDataMap[obs.Hour] = { totalUsers: 0, totalBw: 0, count: 0 };
    }
    hourlyDataMap[obs.Hour].totalUsers += obs.Active_Users;
    hourlyDataMap[obs.Hour].totalBw += obs.Bandwidth_Utilization_Percent;
    hourlyDataMap[obs.Hour].count++;
  }
  const hourlyChartData = Object.keys(hourlyDataMap)
    .sort()
    .map((hour) => ({
      hour,
      avgUsers: Math.round(hourlyDataMap[hour].totalUsers / hourlyDataMap[hour].count),
      avgBw: Number((hourlyDataMap[hour].totalBw / hourlyDataMap[hour].count).toFixed(1)),
    }));

  // State distribution pie colors
  const STATE_COLORS: Record<string, string> = {
    Low: '#00C853',
    Medium: '#D4AF37',
    High: '#FF9800',
    Congested: '#E53935',
  };

  const pieData = probData.distribution.map((d) => ({
    name: d.state,
    value: d.count,
    color: STATE_COLORS[d.state],
    pct: (d.probability * 100).toFixed(1),
  }));

  // Dynamic Glassmorphism Styles Generator
  const getGlassStyle = (accent?: 'gold' | 'green' | 'red' | 'orange') => {
    let tintRgb = '21, 21, 21';
    let glowRgb = '212, 175, 55';
    let borderColor = 'rgba(102, 83, 28, 0.45)';

    switch (glassSettings.tint) {
      case 'gold':
        tintRgb = '34, 28, 14';
        glowRgb = '212, 175, 55';
        borderColor = 'rgba(212, 175, 55, 0.4)';
        break;
      case 'emerald':
        tintRgb = '12, 34, 20';
        glowRgb = '0, 200, 83';
        borderColor = 'rgba(0, 200, 83, 0.35)';
        break;
      case 'crimson':
        tintRgb = '36, 14, 14';
        glowRgb = '229, 57, 53';
        borderColor = 'rgba(229, 57, 53, 0.35)';
        break;
      default:
        tintRgb = '20, 20, 20';
        glowRgb = '212, 175, 55';
        borderColor = 'rgba(102, 83, 28, 0.4)';
        break;
    }

    if (accent === 'green') {
      glowRgb = '0, 200, 83';
      borderColor = 'rgba(0, 200, 83, 0.45)';
    } else if (accent === 'red') {
      glowRgb = '229, 57, 53';
      borderColor = 'rgba(229, 57, 53, 0.45)';
    } else if (accent === 'orange') {
      glowRgb = '255, 152, 0';
      borderColor = 'rgba(255, 152, 0, 0.45)';
    }

    const backdropFilter = `blur(${glassSettings.blur}px) saturate(${glassSettings.saturation}%)`;
    const backgroundColor = `rgba(${tintRgb}, ${glassSettings.opacity})`;
    const boxShadow = glassSettings.borderGlow
      ? `0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 20px -5px rgba(${glowRgb}, 0.18)`
      : `0 8px 32px 0 rgba(0, 0, 0, 0.4)`;

    return {
      backdropFilter,
      WebkitBackdropFilter: backdropFilter,
      backgroundColor,
      borderColor,
      boxShadow,
    };
  };

  return (
    <div className="relative space-y-6">
      {/* Ambient glowing background orbs that provide deep frosted refraction through glass panels */}
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-10 w-96 h-96 bg-[#00C853]/08 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#E53935]/06 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Glass Top Header & Control Bar */}
      <div
        style={getGlassStyle()}
        className="rounded-3xl border p-5 sm:p-6 transition-all duration-300 shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.2)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Adjustable Glassmorphism Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-neutral-200 border border-white/15">
                Real-Time CSS Optical Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-black/40 text-[#00C853] border border-[#00C853]/30">
                {dataSource}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Campus Wi-Fi Load &amp; Congestion Prediction
            </h1>
            <p className="text-xs sm:text-sm text-[#BDBDBD] mt-1 max-w-2xl leading-relaxed">
              Applied Statistics and Stochastic Processes prototype engine. Adaptively monitors live access points, 
              evaluates discrete probability states, and projects congestion risks.
            </p>
          </div>

          {/* Quick Glass Adjuster Trigger & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setShowGlassControls(!showGlassControls)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition backdrop-blur-md shadow-sm"
            >
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <span>Glass Optics ({glassSettings.blur}px / {(glassSettings.opacity * 100).toFixed(0)}%)</span>
              {showGlassControls ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <ShimmerButton
              variant="gold"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => exportObservationsToCSV(observations, 'wifi_analytics_export.csv')}
            >
              <span>Export CSV</span>
            </ShimmerButton>
          </div>
        </div>

        {/* Expandable Glassmorphism Settings Panel */}
        <AnimatePresence>
          {showGlassControls && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-4 mt-4 border-t border-white/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
                {/* Blur Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-neutral-300 mb-1">
                    <span>Backdrop Blur:</span>
                    <span className="text-[#D4AF37] font-mono">{glassSettings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={glassSettings.blur}
                    onChange={(e) => setGlassSettings({ ...glassSettings, blur: parseInt(e.target.value) })}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-neutral-300 mb-1">
                    <span>Glass Opacity:</span>
                    <span className="text-[#00C853] font-mono">{(glassSettings.opacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    value={Math.round(glassSettings.opacity * 100)}
                    onChange={(e) => setGlassSettings({ ...glassSettings, opacity: parseInt(e.target.value) / 100 })}
                    className="w-full accent-[#00C853] cursor-pointer"
                  />
                </div>

                {/* Saturation Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-neutral-300 mb-1">
                    <span>Saturation Boost:</span>
                    <span className="text-purple-400 font-mono">{glassSettings.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    value={glassSettings.saturation}
                    onChange={(e) => setGlassSettings({ ...glassSettings, saturation: parseInt(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* Glass Tint Selector */}
                <div>
                  <span className="block font-semibold text-neutral-300 mb-1">Glass Tint:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'dark', label: 'Dark', color: '#1E1E1E' },
                      { id: 'gold', label: 'Amber', color: '#D4AF37' },
                      { id: 'emerald', label: 'Emerald', color: '#00C853' },
                      { id: 'crimson', label: 'Crimson', color: '#E53935' },
                    ].map((tint) => (
                      <button
                        key={tint.id}
                        onClick={() => setGlassSettings({ ...glassSettings, tint: tint.id as GlassTint })}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                          glassSettings.tint === tint.id
                            ? 'bg-white/20 text-white border-[#D4AF37] shadow-sm'
                            : 'bg-black/30 text-neutral-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {tint.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset & Glow Toggle */}
                <div className="flex items-center gap-2 pt-4 sm:pt-0">
                  <button
                    onClick={() => setGlassSettings({ ...glassSettings, borderGlow: !glassSettings.borderGlow })}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      glassSettings.borderGlow
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/60'
                        : 'bg-white/05 text-neutral-400 border-white/10'
                    }`}
                  >
                    {glassSettings.borderGlow ? 'Glow: ON' : 'Glow: OFF'}
                  </button>
                  <button
                    onClick={() => setGlassSettings(DEFAULT_GLASS_SETTINGS)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition"
                    title="Reset to Defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Tabs with Frosted Glass Surface */}
      <div
        style={getGlassStyle()}
        className="rounded-2xl border p-1.5 flex flex-wrap items-center gap-1.5 shadow-lg backdrop-blur-md"
      >
        <LayoutGroup id="glassActiveTabsGroup">
          {[
            { id: 'overview', label: 'Overview', icon: <Radio className="w-4 h-4" /> },
            { id: 'traffic', label: 'Traffic Analytics', icon: <Activity className="w-4 h-4" /> },
            { id: 'intelligence', label: 'Network Intelligence', icon: <Layers className="w-4 h-4" /> },
            { id: 'prediction', label: 'Congestion Prediction', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'reports', label: 'Reports & Export', icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as GlassTab)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 select-none z-10 ${
                  isActive
                    ? 'text-black font-extrabold shadow-md'
                    : 'text-neutral-300 hover:text-white hover:bg-white/05'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="glassActiveTabPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#C29D26] rounded-xl shadow-md z-[-1]"
                  />
                )}
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </LayoutGroup>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* 7 KPI Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
            {[
              { title: 'Total Obs', value: stats.count, sub: 'Intervals', icon: Radio, accent: 'gold' as const },
              { title: 'Current Users', value: latestObs.Active_Users, sub: latestObs.Hour, icon: Users, accent: (isCongested ? 'red' : isHigh ? 'orange' : 'gold') as 'gold' | 'red' | 'orange' },
              { title: 'Avg Users', value: stats.mean.toFixed(1), sub: 'Mean x̄', icon: Activity, accent: 'gold' as const },
              { title: 'Peak Users', value: stats.max, sub: 'Maximum', icon: Maximize2, accent: 'orange' as const },
              { title: 'Avg Bandwidth', value: `${avgBandwidth}%`, sub: 'Link Saturation', icon: Percent, accent: 'green' as const },
              { title: 'Congestion Risk', value: `${(probData.congestionProbability * 100).toFixed(1)}%`, sub: 'P(Congested)', icon: AlertOctagon, accent: (probData.congestionProbability > 0.15 ? 'red' : 'gold') as 'gold' | 'red' },
              { title: 'State', value: latestObs.Network_State, sub: 'Live Status', icon: TrendingUp, accent: (isCongested ? 'red' : isHigh ? 'orange' : 'green') as 'green' | 'orange' | 'red' },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  style={getGlassStyle(kpi.accent)}
                  className="rounded-2xl border p-4 shadow-lg transition-transform duration-200 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      {kpi.title}
                    </span>
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">{kpi.value}</div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
                    <span>{kpi.sub}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Operational Status Glass Banner */}
          <div
            style={getGlassStyle(isCongested ? 'red' : isHigh ? 'orange' : 'green')}
            className="rounded-3xl border p-5 sm:p-6 shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isCongested ? 'bg-[#E53935]' : isHigh ? 'bg-[#FF9800]' : 'bg-[#00C853]'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        isCongested ? 'bg-[#E53935]' : isHigh ? 'bg-[#FF9800]' : 'bg-[#00C853]'
                      }`}
                    />
                  </span>
                  <h3 className="text-lg font-bold text-white">Live Network State Operational Status</h3>
                </div>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Synchronized with latest observation at {latestObs.Day} {latestObs.Hour}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-400">Classification:</span>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    isCongested
                      ? 'bg-[#E53935]/25 text-[#E53935] border border-[#E53935]/60 shadow-[0_0_12px_rgba(229,57,53,0.3)]'
                      : isHigh
                      ? 'bg-[#FF9800]/25 text-[#FF9800] border border-[#FF9800]/60 shadow-[0_0_12px_rgba(255,152,0,0.3)]'
                      : 'bg-[#00C853]/25 text-[#00C853] border border-[#00C853]/60 shadow-[0_0_12px_rgba(0,200,83,0.3)]'
                  }`}
                >
                  {latestObs.Network_State} State
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <div className="text-neutral-400 font-medium">Connected Load</div>
                <div className="text-xl font-bold text-white mt-1">
                  {latestObs.Active_Users} <span className="text-xs font-normal text-neutral-400">devices</span>
                </div>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <div className="text-neutral-400 font-medium">Bandwidth Load</div>
                <div className="text-xl font-bold text-[#00C853] mt-1">
                  {latestObs.Bandwidth_Utilization_Percent}%
                </div>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <div className="text-neutral-400 font-medium">Congestion Risk Level</div>
                <div
                  className={`text-xl font-bold mt-1 ${
                    isCongested ? 'text-[#E53935]' : isHigh ? 'text-[#FF9800]' : 'text-[#00C853]'
                  }`}
                >
                  {isCongested ? 'Critical Overload' : isHigh ? 'Elevated Contention' : 'Normal Operational'}
                </div>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <div className="text-neutral-400 font-medium">Access Point Advisory</div>
                <div className="text-xs font-medium text-white mt-1 leading-relaxed">
                  {isCongested
                    ? 'Excessive load detected. Bandwidth saturation imminent; QoS throttling recommended.'
                    : isHigh
                    ? 'Approaching capacity limits. Increased student arrivals during lecture breaks.'
                    : 'Channel utilization nominal. Full bandwidth headroom available.'}
                </div>
              </div>
            </div>
          </div>

          {/* Dual Charts in Glass Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Active Users */}
            <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#D4AF37]" />
                    <span>Active Connected Users Over Time</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Time-series load across 10-minute observation intervals</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                  Gold Series
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={observations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#282828" opacity={0.6} />
                    <XAxis
                      dataKey="Hour"
                      stroke="#888888"
                      fontSize={11}
                      tickFormatter={(val, i) => (i % 4 === 0 ? `${observations[i]?.Day.substring(0, 3)} ${val}` : '')}
                    />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141414', borderColor: '#D4AF37', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any) => [`${val} Users`, 'Active Users']}
                    />
                    <Line
                      type="monotone"
                      dataKey="Active_Users"
                      stroke="#D4AF37"
                      strokeWidth={2.5}
                      dot={{ r: 2, fill: '#D4AF37' }}
                      activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Bandwidth Utilization Area */}
            <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#00C853]" />
                    <span>Bandwidth Utilisation Percentage</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Continuous network link capacity saturation curve</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00C853]/20 text-[#00C853]">
                  Emerald Area
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={observations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="glassBwGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C853" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00C853" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#282828" opacity={0.6} />
                    <XAxis
                      dataKey="Hour"
                      stroke="#888888"
                      fontSize={11}
                      tickFormatter={(val, i) => (i % 4 === 0 ? `${observations[i]?.Day.substring(0, 3)} ${val}` : '')}
                    />
                    <YAxis stroke="#888888" fontSize={11} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141414', borderColor: '#00C853', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any) => [`${val}%`, 'Bandwidth']}
                    />
                    <Area
                      type="monotone"
                      dataKey="Bandwidth_Utilization_Percent"
                      stroke="#00C853"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#glassBwGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: TRAFFIC ANALYTICS */}
      {activeTab === 'traffic' && (
        <motion.div
          key="traffic"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Day & Filter Controls in Glass Toolbar */}
          <div style={getGlassStyle()} className="rounded-2xl border p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold text-white">Filter Day of Week:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      selectedDay === d
                        ? 'bg-[#D4AF37] text-black shadow-md'
                        : 'bg-white/05 text-neutral-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-neutral-400">
              Showing <strong className="text-[#D4AF37]">{filteredTraffic.length}</strong> observations
            </span>
          </div>

          {/* Traffic Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Mean Active Users */}
            <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">Hourly Mean Active Users</h3>
              <p className="text-xs text-neutral-400 mb-4">Average load aggregated by time of day</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#282828" opacity={0.6} />
                    <XAxis dataKey="hour" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#D4AF37', borderRadius: '12px' }} />
                    <Bar dataKey="avgUsers" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Poisson Connection Arrivals (10-min) */}
            <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">Poisson Connection Arrivals (10-min)</h3>
              <p className="text-xs text-neutral-400 mb-4">New device connections per observation window</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#282828" opacity={0.6} />
                    <XAxis dataKey="Hour" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#FF9800', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="New_Connections_Per_10min" stroke="#FF9800" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: NETWORK INTELLIGENCE */}
      {activeTab === 'intelligence' && (
        <motion.div
          key="intelligence"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Markov Transitions Heatmap & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Distribution */}
            <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">Network State Distribution</h3>
              <p className="text-xs text-neutral-400 mb-4">Empirical probability masses</p>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#080808" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#D4AF37', borderRadius: '12px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {pieData.map((p) => (
                  <div key={p.name} className="flex items-center space-x-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[#BDBDBD]">{p.name}:</span>
                    <span className="font-bold text-white">{p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Markov Transition Matrix Table */}
            <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span>Empirical Markov Transition Matrix (P)</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#D4AF37]">
                  {markov.totalTransitions} Valid Transitions
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Probability P_ij of transitioning from State i (Row) to State j (Column)
              </p>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
                <table className="w-full text-center text-xs">
                  <thead className="bg-white/05 text-neutral-300 font-bold uppercase border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3 text-left">From \ To</th>
                      {MARKOV_STATES.map((s) => (
                        <th key={s} className="py-2.5 px-3">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/05">
                    {MARKOV_STATES.map((fromState, i) => (
                      <tr key={fromState} className="hover:bg-white/05 transition">
                        <td className="py-2.5 px-3 text-left font-bold text-white">{fromState}</td>
                        {MARKOV_STATES.map((toState, j) => {
                          const prob = markov.transitionMatrix[i]?.[j] || 0;
                          return (
                            <td key={toState} className="py-2.5 px-3 font-mono">
                              <span
                                className={`px-2 py-1 rounded-lg font-bold ${
                                  prob > 0.4
                                    ? 'bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/50'
                                    : prob > 0.1
                                    ? 'bg-white/10 text-white'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {prob.toFixed(4)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: PREDICTION */}
      {activeTab === 'prediction' && (
        <motion.div
          key="prediction"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Multi-Model Forecast Summary Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div style={getGlassStyle('gold')} className="rounded-2xl border p-4 shadow-lg">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Method 1: Trend</span>
              <div className="text-xl font-bold text-white mt-1">~{latestObs.Active_Users} Devices</div>
              <p className="text-[11px] text-neutral-400 mt-1">Moving 3-interval load mean</p>
            </div>
            <div style={getGlassStyle('green')} className="rounded-2xl border p-4 shadow-lg">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Method 2: OLS Regression</span>
              <div className="text-xl font-bold text-[#00C853] mt-1">
                {(regression.intercept + regression.slope * latestObs.Active_Users).toFixed(1)}% Bw
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">R² = {regression.r2.toFixed(3)}</p>
            </div>
            <div style={getGlassStyle('orange')} className="rounded-2xl border p-4 shadow-lg">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Method 3: Markov DTMC</span>
              <div className="text-xl font-bold text-[#FF9800] mt-1">{latestObs.Network_State} State</div>
              <p className="text-[11px] text-neutral-400 mt-1">Highest 1-step probability</p>
            </div>
            <div style={getGlassStyle('red')} className="rounded-2xl border p-4 shadow-lg">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Method 4: Monte Carlo</span>
              <div className="text-xl font-bold text-[#E53935] mt-1">
                {(mcResult.congestionProb * 100).toFixed(1)}% Risk
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">{mcResult.steps} steps ahead horizon</p>
            </div>
          </div>

          {/* Monte Carlo Interactive Simulator in Glass Panel */}
          <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Dice5 className="w-5 h-5 text-[#D4AF37]" />
                  <span>Monte Carlo Congestion Risk Simulation</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Simulates {mcSimCount} synthetic random walk trajectories from state "{latestObs.Network_State}"
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-400">Horizon:</span>
                  <select
                    value={mcHorizon}
                    onChange={(e) => setMcHorizon(parseInt(e.target.value))}
                    className="bg-black/50 border border-white/20 rounded-lg px-2.5 py-1 text-white text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>{s} Steps Ahead</option>
                    ))}
                  </select>
                </div>

                <ShimmerButton
                  variant="gold"
                  size="sm"
                  icon={<Play className="w-3.5 h-3.5 fill-current" />}
                  onClick={() => setMcSimKey((prev) => prev + 1)}
                >
                  <span>Re-Simulate</span>
                </ShimmerButton>
              </div>
            </div>

            {/* Simulation Convergence Curve */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mcResult.convergencePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282828" opacity={0.6} />
                  <XAxis dataKey="simulation" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} unit="%" tickFormatter={(v) => (v * 100).toFixed(0)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#E53935', borderRadius: '12px' }}
                    formatter={(val: any) => [`${(val * 100).toFixed(2)}%`, 'Congestion Probability']}
                  />
                  <Line type="monotone" dataKey="probability" stroke="#E53935" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <motion.div
          key="reports"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Executive Metadata Glass Card */}
          <div style={getGlassStyle()} className="rounded-3xl border p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span>Dataset Summary &amp; Analytics Report</span>
                </h3>
                <p className="text-xs text-neutral-400">Formal synthesis of mathematical observations</p>
              </div>

              <div className="flex items-center gap-2">
                <ShimmerButton
                  variant="gold"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => exportObservationsToCSV(observations, 'wifi_full_dataset.csv')}
                >
                  <span>Download Full CSV</span>
                </ShimmerButton>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <span className="text-neutral-400 block mb-1">Source Status:</span>
                <span className="font-bold text-[#D4AF37]">{dataSource}</span>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <span className="text-neutral-400 block mb-1">Total Intervals:</span>
                <span className="font-bold text-white">{stats.count}</span>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <span className="text-neutral-400 block mb-1">Sample Mean (x̄):</span>
                <span className="font-bold text-[#00C853]">{stats.mean.toFixed(2)} Users</span>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/08">
                <span className="text-neutral-400 block mb-1">Sample Variance (s²):</span>
                <span className="font-bold text-[#FF9800]">{stats.variance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
