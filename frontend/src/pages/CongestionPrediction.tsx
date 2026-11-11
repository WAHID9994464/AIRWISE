import React from 'react';
import {
  TrendingUp,
  Activity,
  Layers,
  Dice5,
  AlertOctagon,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { computeMarkovTransitions, MARKOV_STATES } from '../calculations/markov';
import { computeCorrelationAndRegression } from '../calculations/regression';
import { runMonteCarloSimulation } from '../calculations/monteCarlo';
import { NetworkState } from '../types';

export const CongestionPrediction: React.FC = () => {
  const { observations } = useData();

  const latestObs = observations[observations.length - 1] || {
    Active_Users: 0,
    Bandwidth_Utilization_Percent: 0,
    Network_State: 'Low',
    Day: 'N/A',
    Hour: 'N/A',
  };

  const activeArr = observations.map((o) => o.Active_Users);
  const bwArr = observations.map((o) => o.Bandwidth_Utilization_Percent);

  // Method 1: Historical Trend (Moving 3-point trend)
  const windowSize = Math.min(3, activeArr.length);
  const recentSlice = activeArr.slice(-windowSize);
  const historicalTrendUsers =
    recentSlice.length > 0
      ? recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length
      : 0;

  // Method 2: Linear Regression Bandwidth Projection
  const reg = computeCorrelationAndRegression(activeArr, bwArr);
  const predictedBandwidth = Math.min(
    100,
    Math.max(0, reg.intercept + reg.slope * historicalTrendUsers)
  );

  // Method 3: Markov Chain 1-Step Transition
  const markov = computeMarkovTransitions(observations);
  const stateIndexMap: Record<NetworkState, number> = {
    Low: 0,
    Medium: 1,
    High: 2,
    Congested: 3,
  };
  const currIdx = stateIndexMap[latestObs.Network_State as NetworkState] ?? 1;
  const markovProbs = markov.transitionMatrix[currIdx] || [0, 0, 0, 0];
  const maxMarkovProb = Math.max(...markovProbs);
  const markovNextState = MARKOV_STATES[markovProbs.indexOf(maxMarkovProb)];
  const markovCongestionProb = markovProbs[3]; // Congested is idx 3

  // Method 4: Monte Carlo 3-Step Simulation
  const mc = runMonteCarloSimulation(
    markov.transitionMatrix,
    markov.validRows,
    latestObs.Network_State as NetworkState,
    3,
    2000
  );

  // Risk Categorization
  let riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  let riskBadgeColor = 'green';
  if (markovCongestionProb >= 0.4 || mc.congestionProb >= 0.3) {
    riskCategory = 'Critical';
    riskBadgeColor = 'red';
  } else if (markovCongestionProb >= 0.2 || mc.congestionProb >= 0.15) {
    riskCategory = 'High';
    riskBadgeColor = 'orange';
  } else if (markovCongestionProb >= 0.05 || mc.congestionProb >= 0.05) {
    riskCategory = 'Moderate';
    riskBadgeColor = 'gold';
  }

  // Visual chart comparing Historical vs Projected Active Users (last 8 points + projected next)
  const lastPoints = observations.slice(-8);
  const forecastChartData = lastPoints.map((obs) => ({
    time: `${obs.Day.substring(0, 3)} ${obs.Hour}`,
    actualUsers: obs.Active_Users,
    projectedUsers: null as number | null,
  }));
  forecastChartData.push({
    time: 'Next Interval',
    actualUsers: null as any,
    projectedUsers: Math.round(historicalTrendUsers),
  });

  // State probability distribution chart
  const stateProbsChart = MARKOV_STATES.map((st, i) => ({
    state: st,
    Markov1Step: Number((markovProbs[i] * 100).toFixed(1)),
    MonteCarlo3Step: Number(
      (mc.finalDistribution.find((d) => d.state === st)?.percentage || 0).toFixed(1)
    ),
  }));

  return (
    <div className="space-y-6">
      {/* Real-time Diagnostic Banner */}
      <div className="bg-[#202020] rounded-xl border border-[#66531C] p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase text-[#BDBDBD]">
              Current Baseline: {latestObs.Day} {latestObs.Hour}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-bold">
              {latestObs.Network_State}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            Predicted Next State:{' '}
            <span className="text-[#D4AF37]">{markovNextState}</span>
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Current: {latestObs.Active_Users} users • {latestObs.Bandwidth_Utilization_Percent}%
            bandwidth allocation
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-neutral-400">Assigned Risk Level</div>
            <div
              className={`text-2xl font-black ${
                riskCategory === 'Critical'
                  ? 'text-[#E53935]'
                  : riskCategory === 'High'
                  ? 'text-[#FF9800]'
                  : riskCategory === 'Moderate'
                  ? 'text-[#D4AF37]'
                  : 'text-[#00C853]'
              }`}
            >
              {riskCategory} Risk
            </div>
            <div className="text-[10px] text-neutral-400">Multi-model consensus</div>
          </div>
        </div>
      </div>

      {/* 4 Separate Prediction Engines (Independent Outputs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Method 1: Trend */}
        <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/60 space-y-2">
          <div className="flex items-center space-x-2 text-[#D4AF37]">
            <TrendingUp className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase">1. Historical Moving Trend</h4>
          </div>
          <div className="text-2xl font-bold text-white">
            {historicalTrendUsers.toFixed(1)}{' '}
            <span className="text-xs font-normal text-neutral-400">users</span>
          </div>
          <p className="text-[11px] text-[#BDBDBD] leading-relaxed">
            3-period moving average extrapolation. Smoothes short-term micro-bursts to project next-hour device presence.
          </p>
        </div>

        {/* Method 2: Regression */}
        <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/60 space-y-2">
          <div className="flex items-center space-x-2 text-[#00C853]">
            <Activity className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase">2. Linear Regression (OLS)</h4>
          </div>
          <div className="text-2xl font-bold text-[#00C853]">
            {predictedBandwidth.toFixed(1)}%{' '}
            <span className="text-xs font-normal text-neutral-400">bandwidth</span>
          </div>
          <p className="text-[11px] text-[#BDBDBD] leading-relaxed">
            Formula: Y = {reg.intercept} + {reg.slope}*X (R² = {reg.r2}). Predicts link utilization from projected user count.
          </p>
        </div>

        {/* Method 3: Markov */}
        <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/60 space-y-2">
          <div className="flex items-center space-x-2 text-[#D4AF37]">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase">3. Markov Chain (1-Step)</h4>
          </div>
          <div className="text-2xl font-bold text-[#D4AF37]">
            {markovNextState}{' '}
            <span className="text-xs font-normal text-neutral-400">
              ({(maxMarkovProb * 100).toFixed(0)}%)
            </span>
          </div>
          <p className="text-[11px] text-[#BDBDBD] leading-relaxed">
            Direct transition probability from state {latestObs.Network_State}. P(Congested) ={' '}
            {(markovCongestionProb * 100).toFixed(1)}%.
          </p>
        </div>

        {/* Method 4: Monte Carlo */}
        <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/60 space-y-2">
          <div className="flex items-center space-x-2 text-[#FF9800]">
            <Dice5 className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase">4. Monte Carlo (3-Step)</h4>
          </div>
          <div className="text-2xl font-bold text-[#FF9800]">
            {(mc.congestionProb * 100).toFixed(1)}%{' '}
            <span className="text-xs font-normal text-neutral-400">risk</span>
          </div>
          <p className="text-[11px] text-[#BDBDBD] leading-relaxed">
            2,000 realization trajectories projected 3 steps forward into the horizon. Captures cumulative tail risk.
          </p>
        </div>
      </div>

      {/* Visual Projections: Timeline Forecast & Comparative Probabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users Forecast Chart */}
        <Card
          title="Recent Historical Load & Trend Forecast"
          subtitle="Observed past active users alongside projected next-interval forecast"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="time" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#BDBDBD' }} />
                <Line
                  type="monotone"
                  dataKey="actualUsers"
                  name="Observed Users"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#D4AF37' }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedUsers"
                  name="Projected Users"
                  stroke="#00C853"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 5, fill: '#00C853' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* State Probabilities Comparison Chart */}
        <Card
          title="Model Comparison: State Probability Distributions"
          subtitle="Contrast between 1-step Markov transition and 3-step Monte Carlo trajectory"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateProbsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="state" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" unit="%" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#BDBDBD' }} />
                <Bar dataKey="Markov1Step" name="Markov (1-Step)" fill="#D4AF37" radius={[3, 3, 0, 0]} />
                <Bar dataKey="MonteCarlo3Step" name="Monte Carlo (3-Step)" fill="#00C853" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Model Limitations & Validation Notice */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/50 space-y-2 text-xs text-[#BDBDBD]">
        <div className="flex items-center space-x-2 font-bold text-white">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          <span>Model Limitations & Validation Integrity:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Independent Model Outputs:</strong> Each prediction method operates on independent mathematical principles and is not blended into a synthetic composite score.
          </li>
          <li>
            <strong>Temporal Directionality:</strong> Predictions do not incorporate future observations when evaluating historical states.
          </li>
          <li>
            <strong>Validation Status:</strong> In the absence of an external out-of-sample physical network testbed, these predictions serve as academic prototype stochastic estimates.
          </li>
        </ul>
      </div>
    </div>
  );
};
