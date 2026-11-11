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
  Legend,
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { computePoissonDistribution } from '../calculations/poisson';
import { GitCommit, Play, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

export const PoissonProcess: React.FC = () => {
  const { observations } = useData();

  const arrivalsArr = observations.map((o) => o.New_Connections_Per_10min);
  const empiricalLambda =
    arrivalsArr.length > 0
      ? arrivalsArr.reduce((a, b) => a + b, 0) / arrivalsArr.length
      : 18.0;

  const [customLambda, setCustomLambda] = useState<number>(Number(empiricalLambda.toFixed(1)));
  const [targetK, setTargetK] = useState<number>(20);
  const [numSims, setNumSims] = useState<number>(1000);
  const [simSeedKey, setSimSeedKey] = useState<number>(0);

  const poisson = computePoissonDistribution(
    arrivalsArr,
    targetK,
    customLambda,
    numSims
  );

  // Chart data: sample up to k=40
  const chartData = poisson.table.slice(0, 40).map((row) => ({
    k: row.k,
    Theoretical: Number((row.probability * 100).toFixed(2)),
    Cumulative: Number((row.cumulativeProbability * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Configuration Controls Card */}
      <Card
        title="Poisson Arrival Process Simulation Parameters"
        subtitle="Models discrete device connection requests per 10-minute observation window"
        action={
          <button
            onClick={() => setSimSeedKey((prev) => prev + 1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#F4D068] text-black font-bold text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Run Simulation</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Arrival Rate Parameter (\lambda):
              </label>
              <span className="text-xs font-mono font-bold text-[#D4AF37]">
                {customLambda} arrivals/10m
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="45"
              step="0.5"
              value={customLambda}
              onChange={(e) => setCustomLambda(parseFloat(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
              <span>Empirical dataset \lambda: {empiricalLambda.toFixed(2)}</span>
              <button
                onClick={() => setCustomLambda(Number(empiricalLambda.toFixed(1)))}
                className="text-[#D4AF37] hover:underline"
              >
                Reset to Data
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Target Connection Count (k):
              </label>
              <span className="text-xs font-mono font-bold text-[#00C853]">{targetK} devices</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={targetK}
              onChange={(e) => setTargetK(parseInt(e.target.value))}
              className="w-full accent-[#00C853] cursor-pointer"
            />
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Computes exact single-point probability P(X = k)
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Monte Carlo Simulation Trials:
              </label>
              <span className="text-xs font-mono font-bold text-[#FF9800]">{numSims} runs</span>
            </div>
            <select
              value={numSims}
              onChange={(e) => setNumSims(parseInt(e.target.value))}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value={200}>200 Trials (Rapid test)</option>
              <option value={1000}>1,000 Trials (Standard precision)</option>
              <option value={5000}>5,000 Trials (High precision)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* KPI Numerical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Theoretical Rate (\lambda)</div>
          <div className="text-2xl font-bold text-[#D4AF37] mt-1">{poisson.lambda}</div>
          <div className="text-[10px] text-neutral-400">Mean & Variance E[X] = Var(X) = \lambda</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">P(X = {targetK} Arrivals)</div>
          <div className="text-2xl font-bold text-[#00C853] mt-1">
            {(poisson.targetProb * 100).toFixed(3)}%
          </div>
          <div className="text-[10px] text-neutral-400">Exact probability mass</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Simulated Mean</div>
          <div className="text-2xl font-bold text-white mt-1">{poisson.simulatedMean}</div>
          <div className="text-[10px] text-neutral-400">
            Error: {Math.abs(poisson.simulatedMean - poisson.lambda).toFixed(3)}
          </div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Simulated Variance</div>
          <div className="text-2xl font-bold text-[#FF9800] mt-1">{poisson.simulatedVar}</div>
          <div className="text-[10px] text-neutral-400">
            Theoretical: {poisson.lambda}.0
          </div>
        </div>
      </div>

      {/* Charts: Theoretical Poisson Curve & Cumulative CDF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Poisson Probability Distribution P(X = k)"
          subtitle={`Discrete probability density curve for \\lambda = ${poisson.lambda}`}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="k" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" unit="%" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Probability']}
                />
                <Bar dataKey="Theoretical" fill="#D4AF37" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Cumulative Distribution F(k) = P(X <= k)"
          subtitle="Cumulative probability of observing at most k device arrivals"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="k" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" domain={[0, 100]} unit="%" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Cumulative F(k)']}
                />
                <Line
                  type="monotone"
                  dataKey="Cumulative"
                  stroke="#00C853"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Poisson Table View (First 25 values) */}
      <Card
        title="Theoretical Poisson Probability Distribution Table"
        subtitle="Computed via log-gamma formulation: P(X=k) = \\exp(-\\lambda + k\\ln(\\lambda) - \\ln(k!))"
      >
        <div className="overflow-x-auto rounded-lg border border-[#66531C]/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151515] border-b border-[#66531C]/50 text-neutral-300 uppercase">
              <tr>
                <th className="py-2.5 px-3">Arrivals (k)</th>
                <th className="py-2.5 px-3 text-right">P(X = k) Mass</th>
                <th className="py-2.5 px-3 text-right">P(X = k) %</th>
                <th className="py-2.5 px-3 text-right">Cumulative F(k)</th>
                <th className="py-2.5 px-3">Queueing / Channel Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828] text-neutral-200">
              {poisson.table.slice(0, 25).map((row) => {
                const isTarget = row.k === targetK;
                return (
                  <tr
                    key={row.k}
                    className={isTarget ? 'bg-[#D4AF37]/15 font-bold text-white' : 'hover:bg-[#1a1a1a]'}
                  >
                    <td className="py-2 px-3 font-mono">
                      {row.k} {isTarget && <span className="text-[#D4AF37]">◀ (Selected)</span>}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{row.probability.toFixed(6)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#D4AF37]">
                      {(row.probability * 100).toFixed(3)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#00C853]">
                      {(row.cumulativeProbability * 100).toFixed(3)}%
                    </td>
                    <td className="py-2 px-3 text-neutral-400">
                      {row.k < poisson.lambda - 5
                        ? 'Low traffic arrival interval'
                        : row.k <= poisson.lambda + 5
                        ? 'Typical average campus arrival band'
                        : 'Contention surge / burst authentication phase'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assumptions & Non-Claim Notice */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/50 space-y-2 text-xs text-[#BDBDBD]">
        <div className="flex items-center space-x-2 font-bold text-white">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          <span>Poisson Model Assumptions & Prototype Reality:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Independent Increments:</strong> Assumes arrival counts in non-overlapping intervals are independent.
          </li>
          <li>
            <strong>Stationary Arrival Rate:</strong> In real physical university networks, arrival rate \lambda varies dramatically across lecture start times. Poisson modeling is an idealized academic approximation.
          </li>
          <li>
            <strong>Single Arrival Property:</strong> Probability of more than one simultaneous connection handshake in an infinitesimal dt approaches zero.
          </li>
        </ul>
      </div>
    </div>
  );
};
