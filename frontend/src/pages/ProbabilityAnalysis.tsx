import React from 'react';
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
import { computeStateProbabilities } from '../calculations/probability';
import { NetworkState } from '../types';

export const ProbabilityAnalysis: React.FC = () => {
  const { observations } = useData();

  const statesArr = observations.map((o) => o.Network_State);
  const { distribution, expectedValue, variance, congestionProbability } =
    computeStateProbabilities(statesArr);

  const stdDev = Math.sqrt(variance);

  const STATE_COLORS: Record<NetworkState, string> = {
    Low: '#00C853',
    Medium: '#D4AF37',
    High: '#FF9800',
    Congested: '#E53935',
  };

  const chartData = distribution.map((d) => ({
    state: d.state,
    count: d.count,
    pmf: Number((d.probability * 100).toFixed(1)),
    cdf: Number((d.cumulativeProbability * 100).toFixed(1)),
    color: STATE_COLORS[d.state],
  }));

  return (
    <div className="space-y-6">
      {/* Top Analytical Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Total Observations (N)</div>
          <div className="text-2xl font-bold text-white mt-1">{observations.length}</div>
          <div className="text-[10px] text-neutral-400">Sample size denominator</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Expected State Score E[X]</div>
          <div className="text-2xl font-bold text-[#D4AF37] mt-1">{expectedValue.toFixed(3)}</div>
          <div className="text-[10px] text-neutral-400">1=Low, 2=Med, 3=High, 4=Cong</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">State Variance Var(X)</div>
          <div className="text-2xl font-bold text-[#00C853] mt-1">{variance.toFixed(3)}</div>
          <div className="text-[10px] text-neutral-400">Std Dev: {stdDev.toFixed(3)}</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#E53935]/40 shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">P(Congestion)</div>
          <div className="text-2xl font-bold text-[#E53935] mt-1">
            {(congestionProbability * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-neutral-400">Empirical probability</div>
        </div>
      </div>

      {/* Discrete Probability Mass Function & Cumulative Distribution Table */}
      <Card
        title="Empirical Probability Mass (PMF) & Cumulative Distribution (CDF) Table"
        subtitle="Computed directly from current dataset: P(X = x) = Frequency(x) / Total observations"
      >
        <div className="overflow-x-auto rounded-lg border border-[#66531C]/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151515] border-b border-[#66531C]/50 text-neutral-300 uppercase">
              <tr>
                <th className="py-2.5 px-3">State Category (x)</th>
                <th className="py-2.5 px-3">Discrete Score</th>
                <th className="py-2.5 px-3 text-right">Observed Count</th>
                <th className="py-2.5 px-3 text-right">Probability Mass P(X=x)</th>
                <th className="py-2.5 px-3 text-right">Cumulative CDF F(x)</th>
                <th className="py-2.5 px-3">Operational Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828] text-neutral-200">
              {distribution.map((item, idx) => (
                <tr key={item.state} className="hover:bg-[#1a1a1a]">
                  <td className="py-2.5 px-3 font-semibold text-white flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATE_COLORS[item.state] }} />
                    <span>{item.state}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{item.count}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#D4AF37]">
                    {(item.probability * 100).toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#00C853]">
                    {(item.cumulativeProbability * 100).toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400">
                    {item.state === 'Low' && 'Traffic well below channel saturation'}
                    {item.state === 'Medium' && 'Nominal expected university operations'}
                    {item.state === 'High' && 'High channel airtime contention risk'}
                    {item.state === 'Congested' && 'Severe packet loss & buffer delay'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Visual Charts: PMF and CDF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PMF Chart */}
        <Card
          title="Probability Mass Function P(X = x)"
          subtitle="Discrete probability density across 4 operational states"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="state" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" unit="%" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Probability']}
                />
                <Bar dataKey="pmf" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CDF Chart */}
        <Card
          title="Cumulative Distribution Function F(x) = P(X <= x)"
          subtitle="Monotonically non-decreasing cumulative probability step curve"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="state" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" domain={[0, 100]} unit="%" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Cumulative Probability']}
                />
                <Line
                  type="stepAfter"
                  dataKey="cdf"
                  stroke="#00C853"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#00C853' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Probability Interpretation for Wi-Fi Congestion */}
      <div className="bg-[#181818] p-4 rounded-xl border-l-4 border-l-[#D4AF37] border-y border-r border-[#66531C]/60 text-xs text-[#BDBDBD] space-y-2">
        <h4 className="font-bold text-white text-sm uppercase">
          Stochastic Congestion Risk Assessment
        </h4>
        <p className="leading-relaxed">
          From {observations.length} time intervals, the network spent{' '}
          <strong className="text-white">
            {distribution.find((d) => d.state === 'Congested')?.count || 0} intervals
          </strong>{' '}
          in the Congested regime, establishing an empirical congestion probability of{' '}
          <strong className="text-[#E53935]">{(congestionProbability * 100).toFixed(2)}%</strong>.
          Conversely, the network operated in safe non-critical bounds (Low or Medium) for{' '}
          <strong className="text-[#00C853]">
            {((distribution[0].probability + distribution[1].probability) * 100).toFixed(1)}%
          </strong>{' '}
          of the observation timeline.
        </p>
      </div>
    </div>
  );
};
