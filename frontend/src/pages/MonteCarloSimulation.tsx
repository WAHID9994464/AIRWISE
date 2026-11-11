import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { ShimmerButton } from '../components/ShimmerButton';
import { computeMarkovTransitions } from '../calculations/markov';
import { runMonteCarloSimulation } from '../calculations/monteCarlo';
import { NetworkState } from '../types';
import { Dice5, Play, RotateCcw, ShieldAlert, TrendingDown } from 'lucide-react';

export const MonteCarloSimulation: React.FC = () => {
  const { observations } = useData();

  const markov = computeMarkovTransitions(observations);

  const [initialState, setInitialState] = useState<NetworkState>('Medium');
  const [horizonSteps, setHorizonSteps] = useState<number>(3);
  const [numSimulations, setNumSimulations] = useState<number>(2000);
  const [simulationKey, setSimulationKey] = useState<number>(0);

  // Run simulation
  const result = runMonteCarloSimulation(
    markov.transitionMatrix,
    markov.validRows,
    initialState,
    horizonSteps,
    numSimulations
  );

  const STATE_COLORS: Record<NetworkState, string> = {
    Low: '#00C853',
    Medium: '#D4AF37',
    High: '#FF9800',
    Congested: '#E53935',
  };

  const finalDistData = result.finalDistribution.map((d) => ({
    name: d.state,
    count: d.count,
    percentage: d.percentage,
    color: STATE_COLORS[d.state],
  }));

  return (
    <div className="space-y-6">
      {/* Simulation Configuration Controls */}
      <Card
        title="Monte Carlo Stochastic Simulation Setup"
        subtitle="Generates repeated stochastic realization paths based on empirical DTMC transition kernel"
        action={
          <div className="flex items-center space-x-2">
            <ShimmerButton
              variant="gold"
              size="sm"
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={() => setSimulationKey((prev) => prev + 1)}
            >
              <span>Simulate</span>
            </ShimmerButton>
            <ShimmerButton
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => {
                setInitialState('Medium');
                setHorizonSteps(3);
                setNumSimulations(2000);
                setSimulationKey((prev) => prev + 1);
              }}
            >
              <span>Reset</span>
            </ShimmerButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Initial Network State (X₀):
            </label>
            <select
              value={initialState}
              onChange={(e) => setInitialState(e.target.value as NetworkState)}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              {(['Low', 'Medium', 'High', 'Congested'] as NetworkState[]).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Prediction Horizon (Steps Ahead):
              </label>
              <span className="text-xs font-mono font-bold text-[#D4AF37]">
                {horizonSteps} Steps
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={horizonSteps}
              onChange={(e) => setHorizonSteps(parseInt(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Simulates consecutive transitions into the future
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Total Monte Carlo Simulations (M):
            </label>
            <select
              value={numSimulations}
              onChange={(e) => setNumSimulations(parseInt(e.target.value))}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value={500}>500 Trajectories (Fast)</option>
              <option value={2000}>2,000 Trajectories (Standard)</option>
              <option value={5000}>5,000 Trajectories (High Precision)</option>
              <option value={10000}>10,000 Trajectories (Asymptotic Law)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* KPI Numerical Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Realization Trajectories (M)</div>
          <div className="text-2xl font-bold text-white mt-1">
            {result.simulations.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400">Total simulated futures</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Congested Realizations</div>
          <div className="text-2xl font-bold text-[#E53935] mt-1">
            {result.congestedCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400">Ended in State 4 (Congested)</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#E53935]/40 shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Estimated Congestion Prob</div>
          <div className="text-2xl font-bold text-[#E53935] mt-1">
            {(result.congestionProb * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-neutral-400">Congested / Total Simulations</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#00C853]/40 shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Safe Operating Probability</div>
          <div className="text-2xl font-bold text-[#00C853] mt-1">
            {((1 - result.congestionProb) * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-neutral-400">Ended Low, Med, or High</div>
        </div>
      </div>

      {/* Final State Distribution Chart & Convergence Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Final State Distribution */}
        <Card
          title={`Final State Distribution at Step ${horizonSteps}`}
          subtitle={`Stochastic state likelihood after ${horizonSteps} time steps starting from ${initialState}`}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" unit="%" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Likelihood']}
                />
                <Bar dataKey="percentage" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monte Carlo Convergence Graph */}
        <Card
          title="Monte Carlo Convergence Trajectory"
          subtitle="Illustrates the Law of Large Numbers stabilizing empirical probability"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.convergencePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="simulation" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" domain={[0, 'auto']} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(2)}%`, 'P(Congestion)']}
                  labelFormatter={(lbl) => `After ${lbl} Trials`}
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="#00C853"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Convergence & Law of Large Numbers Academic Note */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/50 space-y-2 text-xs text-[#BDBDBD]">
        <div className="flex items-center space-x-2 font-bold text-white">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          <span>Simulation Variability & Law of Large Numbers:</span>
        </div>
        <p className="leading-relaxed">
          As guaranteed by the <strong>Weak Law of Large Numbers (WLLN)</strong>, increasing the simulation count{' '}
          <code className="text-[#D4AF37]">M</code> reduces Monte Carlo sampling variance at a rate of{' '}
          <code className="text-[#D4AF37]">O(1/\sqrt{'{M}'})</code>. All outcomes represent <em>simulated estimates</em> derived
          from the empirical Markov kernel, and not guaranteed deterministic future network events.
        </p>
      </div>
    </div>
  );
};
