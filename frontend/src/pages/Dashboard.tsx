import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Activity,
  Maximize2,
  Percent,
  AlertOctagon,
  Radio,
  Clock,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import { KpiCard } from '../components/KpiCard';
import { Card } from '../components/Card';
import { AdjustableGlassDashboard } from '../components/AdjustableGlassDashboard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { computeDescriptiveStats } from '../calculations/stats';
import { computeStateProbabilities } from '../calculations/probability';

export const Dashboard: React.FC = () => {
  const { observations, dataSource } = useData();
  const [viewMode, setViewMode] = useState<'glass' | 'classic'>('glass');

  const activeUsersArr = observations.map((o) => o.Active_Users);
  const bandwidthArr = observations.map((o) => o.Bandwidth_Utilization_Percent);
  const statesArr = observations.map((o) => o.Network_State);

  const stats = computeDescriptiveStats(activeUsersArr);
  const probData = computeStateProbabilities(statesArr);

  const avgBandwidth =
    bandwidthArr.length > 0
      ? (bandwidthArr.reduce((a, b) => a + b, 0) / bandwidthArr.length).toFixed(1)
      : '0.0';

  const latestObs = observations[observations.length - 1] || {
    Active_Users: 0,
    Bandwidth_Utilization_Percent: 0,
    Network_State: 'Low',
    Day: 'N/A',
    Hour: 'N/A',
  };

  const isCongested = latestObs.Network_State === 'Congested';
  const isHigh = latestObs.Network_State === 'High';

  // Group by Hour for Chart 4
  const hourlyDataMap: Record<string, { totalUsers: number; count: number }> = {};
  for (const obs of observations) {
    if (!hourlyDataMap[obs.Hour]) {
      hourlyDataMap[obs.Hour] = { totalUsers: 0, count: 0 };
    }
    hourlyDataMap[obs.Hour].totalUsers += obs.Active_Users;
    hourlyDataMap[obs.Hour].count++;
  }
  const hourlyChartData = Object.keys(hourlyDataMap)
    .sort()
    .map((hour) => ({
      hour,
      avgUsers: Math.round(hourlyDataMap[hour].totalUsers / hourlyDataMap[hour].count),
    }));

  // State distribution colors
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

  return (
    <div className="space-y-6">
      {/* Top View Mode Switcher */}
      <div className="flex items-center justify-between bg-[#151515] p-2 rounded-2xl border border-[#66531C]/50 shadow-md">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('glass')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              viewMode === 'glass'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29D26] text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/05'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Adjustable Glass Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('classic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              viewMode === 'classic'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29D26] text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/05'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Classic Metrics Overview</span>
          </button>
        </div>

        <span className="text-xs text-neutral-400 hidden sm:inline mr-2">
          {viewMode === 'glass' ? 'Adjustable Glassmorphism Active' : 'Standard Grid Active'}
        </span>
      </div>

      {viewMode === 'glass' ? (
        <ErrorBoundary fallbackTitle="Glass Dashboard Diagnostic">
          <AdjustableGlassDashboard />
        </ErrorBoundary>
      ) : (
        <div className="space-y-6">
          {/* Simulation Disclaimer Alert with 21st.dev subtle glow */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-[#171717] via-[#1A1812] to-[#151515] border-l-4 border-l-[#D4AF37] border-y border-r border-[#66531C]/60 p-4 rounded-2xl flex items-start space-x-3.5 shadow-lg"
          >
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                <span>Academic Software Prototype Engine</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                  ASSP
                </span>
              </span>{' '}
              <span className="text-[#BDBDBD]">
                This analytical platform models stochastic Wi-Fi congestion patterns. Currently operating on{' '}
                <strong className="text-[#D4AF37]">{dataSource}</strong> with {observations.length} time-series observations.
                Simulated environment — not connected to production university access points.
              </span>
            </div>
          </motion.div>

          {/* 7 Animated KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
            <KpiCard
              title="Total Observations"
              value={stats.count}
              subtitle="Time intervals"
              icon={Radio}
              variant="gold"
              delay={0.02}
            />
            <KpiCard
              title="Current Users"
              value={latestObs.Active_Users}
              subtitle={`Latest: ${latestObs.Hour}`}
              icon={Users}
              variant={isCongested ? 'red' : isHigh ? 'orange' : 'gold'}
              delay={0.06}
            />
            <KpiCard
              title="Avg Active Users"
              value={stats.mean.toFixed(1)}
              subtitle="Sample mean x̄"
              icon={Activity}
              variant="gold"
              delay={0.10}
            />
            <KpiCard
              title="Peak Users"
              value={stats.max}
              subtitle="Maximum observed"
              icon={Maximize2}
              variant="orange"
              delay={0.14}
            />
            <KpiCard
              title="Avg Bandwidth"
              value={`${avgBandwidth}%`}
              subtitle="Capacity utilization"
              icon={Percent}
              variant="green"
              delay={0.18}
            />
            <KpiCard
              title="Congestion Prob"
              value={`${(probData.congestionProbability * 100).toFixed(1)}%`}
              subtitle="P(X = Congested)"
              icon={AlertOctagon}
              variant={probData.congestionProbability > 0.15 ? 'red' : 'gold'}
              delay={0.22}
            />
            <KpiCard
              title="Network State"
              value={latestObs.Network_State}
              subtitle="Dynamic classification"
              icon={TrendingUp}
              variant={isCongested ? 'red' : isHigh ? 'orange' : 'green'}
              delay={0.26}
            />
          </div>

      {/* Network Status Live Panel */}
      <Card
        title="Network State Operational Status"
        subtitle={`Real-time synthesis based on latest observation at ${latestObs.Day} ${latestObs.Hour}`}
        badge={latestObs.Network_State}
        badgeColor={isCongested ? 'red' : isHigh ? 'orange' : 'green'}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-[#181818] rounded-lg border border-[#66531C]/40">
            <div className="text-xs text-[#BDBDBD]">Current Active Load</div>
            <div className="text-xl font-bold text-white mt-1">
              {latestObs.Active_Users}{' '}
              <span className="text-xs font-normal text-neutral-400">devices connected</span>
            </div>
          </div>
          <div className="p-3 bg-[#181818] rounded-lg border border-[#66531C]/40">
            <div className="text-xs text-[#BDBDBD]">Bandwidth Allocation</div>
            <div className="text-xl font-bold text-[#00C853] mt-1">
              {latestObs.Bandwidth_Utilization_Percent}%
            </div>
          </div>
          <div className="p-3 bg-[#181818] rounded-lg border border-[#66531C]/40">
            <div className="text-xs text-[#BDBDBD]">Calculated Congestion Risk</div>
            <div
              className={`text-xl font-bold mt-1 ${
                isCongested
                  ? 'text-[#E53935]'
                  : isHigh
                  ? 'text-[#FF9800]'
                  : 'text-[#00C853]'
              }`}
            >
              {isCongested ? 'Critical (Overload)' : isHigh ? 'Elevated Warning' : 'Normal / Low'}
            </div>
          </div>
          <div className="p-3 bg-[#181818] rounded-lg border border-[#66531C]/40">
            <div className="text-xs text-[#BDBDBD]">Diagnostic Message</div>
            <div className="text-xs font-medium text-white mt-1.5 leading-relaxed">
              {isCongested
                ? 'High network load detected in sample data. Congestion risk elevated; channel contention likely.'
                : isHigh
                ? 'Network usage increasing. Peak campus activity period observed.'
                : 'Network operating normally within acceptable channel bandwidth margins.'}
            </div>
          </div>
        </div>
      </Card>

      {/* Row 1 Charts: Active Users & Bandwidth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Wi-Fi Active Users Over Time */}
        <Card
          title="Chart 1: Active Connected Users Over Time"
          subtitle="Gold time-series of active device load across observation intervals"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={observations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis
                  dataKey="Hour"
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={(val, i) => (i % 4 === 0 ? `${observations[i]?.Day.substring(0, 3)} ${val}` : '')}
                />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val} Users`, 'Active Users']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload;
                    return row ? `${row.Day} ${row.Hour} (${row.Network_State})` : '';
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Active_Users"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#D4AF37' }}
                  activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Bandwidth Utilisation */}
        <Card
          title="Chart 2: Bandwidth Utilisation Percentage"
          subtitle="Green time-series tracking campus link saturation percentage"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={observations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis
                  dataKey="Hour"
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={(val, i) => (i % 4 === 0 ? `${observations[i]?.Day.substring(0, 3)} ${val}` : '')}
                />
                <YAxis stroke="#888888" domain={[0, 100]} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Bandwidth']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload;
                    return row ? `${row.Day} ${row.Hour}` : '';
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Bandwidth_Utilization_Percent"
                  stroke="#00C853"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#00C853' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2 Charts: State Distribution, Hourly Usage, Connection Arrivals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 3: Network State Distribution */}
        <Card
          title="Chart 3: Network State Distribution"
          subtitle="Empirical frequency across 4 operating regimes"
        >
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#080808" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any, name: any) => [`${val} intervals (${pieData.find(p=>p.name===name)?.pct}%)`, name]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center space-x-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[#BDBDBD]">{p.name}:</span>
                <span className="font-semibold text-white">{p.value} ({p.pct}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chart 4: Hourly Network Usage */}
        <Card
          title="Chart 4: Hourly Mean Active Users"
          subtitle="Average user load categorized by time of day"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="hour" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val} Users`, 'Mean Load']}
                />
                <Bar dataKey="avgUsers" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 5: Connection Arrivals */}
        <Card
          title="Chart 5: Connection Arrivals (10-min)"
          subtitle="Poisson arrival count distribution across intervals"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={observations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis
                  dataKey="Hour"
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={(_, i) => (i % 6 === 0 ? observations[i]?.Day.substring(0, 3) : '')}
                />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val} arrivals`, 'New Connections']}
                />
                <Line
                  type="monotone"
                  dataKey="New_Connections_Per_10min"
                  stroke="#FF9800"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )}
</div>
  );
};
