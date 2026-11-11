import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { computeChiSquareGoodnessOfFit } from '../calculations/chiSquare';
import { NetworkState } from '../types';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

export const ChiSquareTest: React.FC = () => {
  const { observations } = useData();

  const [alpha, setAlpha] = useState<number>(0.05);
  const [distributionType, setDistributionType] = useState<'Uniform' | 'Custom'>('Uniform');

  // Custom expected proportions if user selects Custom
  const [customProportions, setCustomProportions] = useState<Record<NetworkState, number>>({
    Low: 0.35,
    Medium: 0.40,
    High: 0.15,
    Congested: 0.10,
  });

  const statesArr = observations.map((o) => o.Network_State);
  const chiResult = computeChiSquareGoodnessOfFit(
    statesArr,
    distributionType === 'Custom' ? customProportions : undefined,
    alpha
  );

  const chartData = chiResult.categories.map((c) => ({
    name: c.category,
    Observed: c.observed,
    Expected: c.expected,
    chiContrib: c.chiContribution,
  }));

  return (
    <div className="space-y-6">
      {/* Configuration Bar */}
      <Card
        title="Chi-Square Goodness-of-Fit Test Setup"
        subtitle="Tests whether network states match a theoretical null distribution"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Hypothesized Expected Distribution (Null Hypothesis H₀):
            </label>
            <select
              value={distributionType}
              onChange={(e) => setDistributionType(e.target.value as any)}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="Uniform">Uniform Equal Distribution (25% each)</option>
              <option value="Custom">Custom Baseline Policy Proportions</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Significance Level (\alpha):
            </label>
            <select
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value={0.01}>0.01 (99% Confidence)</option>
              <option value={0.05}>0.05 (95% Confidence - Standard)</option>
              <option value={0.10}>0.10 (90% Confidence)</option>
            </select>
          </div>
        </div>

        {distributionType === 'Custom' && (
          <div className="mt-4 p-3 bg-[#181818] rounded-lg border border-[#66531C]/40">
            <div className="text-xs font-semibold text-neutral-300 mb-2">
              Configure Expected Category Proportions:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {(['Low', 'Medium', 'High', 'Congested'] as NetworkState[]).map((st) => (
                <div key={st}>
                  <label className="text-neutral-400 block mb-0.5">{st} Ratio:</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    max="0.99"
                    value={customProportions[st]}
                    onChange={(e) => {
                      setCustomProportions({
                        ...customProportions,
                        [st]: parseFloat(e.target.value) || 0.1,
                      });
                    }}
                    className="w-full bg-[#101010] border border-neutral-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Decision Summary Banner */}
      <div
        className={`p-5 rounded-xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 ${
          chiResult.rejectH0
            ? 'bg-[#00C853]/10 border-[#00C853]/50'
            : 'bg-[#FF9800]/10 border-[#FF9800]/50'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              chiResult.rejectH0 ? 'bg-[#00C853]/20 text-[#00C853]' : 'bg-[#FF9800]/20 text-[#FF9800]'
            }`}
          >
            {chiResult.rejectH0 ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-neutral-400">Goodness-of-Fit Decision</div>
            <div className="text-xl font-extrabold text-white">
              {chiResult.rejectH0
                ? `REJECT H₀ at α = ${alpha} (Significant Deviation)`
                : `FAIL TO REJECT H₀ at α = ${alpha} (Fits Expected Distribution)`}
            </div>
            <div className="text-xs text-neutral-300 mt-0.5">
              Chi-Square Statistic = <strong className="text-[#D4AF37]">{chiResult.chi2Stat}</strong> | df ={' '}
              <strong className="text-white">{chiResult.df}</strong> | p-value ={' '}
              <strong className="text-[#00C853]">{chiResult.pValue}</strong>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-neutral-400">Critical Comparison</div>
          <div className="text-xs font-mono font-semibold text-white">
            p = {chiResult.pValue} {chiResult.rejectH0 ? '<' : '≥'} α = {alpha}
          </div>
        </div>
      </div>

      {/* Cochran Assumption Warning / Pass Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center space-x-3 text-xs ${
          chiResult.assumptionsMet
            ? 'bg-[#00C853]/15 border-[#00C853]/40 text-[#00C853]'
            : 'bg-[#FF9800]/15 border-[#FF9800]/40 text-[#FF9800]'
        }`}
      >
        {chiResult.assumptionsMet ? (
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        )}
        <div>
          <span className="font-bold">Cochran Expected Frequency Assumption: </span>
          {chiResult.assumptionsMet
            ? 'All expected cell counts E_i >= 5. The continuous Chi-Square asymptotic approximation is valid.'
            : 'Warning: One or more expected cells have E_i < 5. Chi-square p-value accuracy may be compromised; collect more observations.'}
        </div>
      </div>

      {/* Observed vs Expected Frequency Breakdown Table */}
      <Card
        title="Frequency Comparison & Cell Contribution Table"
        subtitle="Formula: \chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}"
      >
        <div className="overflow-x-auto rounded-lg border border-[#66531C]/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151515] border-b border-[#66531C]/50 text-neutral-300 uppercase">
              <tr>
                <th className="py-2.5 px-3">State Category</th>
                <th className="py-2.5 px-3 text-right">Observed (O)</th>
                <th className="py-2.5 px-3 text-right">Expected (E)</th>
                <th className="py-2.5 px-3 text-right">Difference (O - E)</th>
                <th className="py-2.5 px-3 text-right">(O - E)²</th>
                <th className="py-2.5 px-3 text-right">\chi² Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828] text-neutral-200">
              {chiResult.categories.map((c) => {
                const diff = c.observed - c.expected;
                const diffSq = diff * diff;
                return (
                  <tr key={c.category} className="hover:bg-[#1a1a1a]">
                    <td className="py-2.5 px-3 font-semibold text-white">{c.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#D4AF37]">
                      {c.observed}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.expected}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                      {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{diffSq.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00C853]">
                      {c.chiContribution}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#181818] font-bold text-white">
                <td className="py-2.5 px-3">Total Sum</td>
                <td className="py-2.5 px-3 text-right font-mono">{chiResult.totalObserved}</td>
                <td className="py-2.5 px-3 text-right font-mono">{chiResult.totalObserved.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-mono">0.00</td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
                <td className="py-2.5 px-3 text-right font-mono text-[#D4AF37]">
                  {chiResult.chi2Stat}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Observed vs Expected Comparison Chart */}
      <Card
        title="Observed vs Expected Frequency Distribution Chart"
        subtitle="Visual contrast between sample realization and theoretical null baseline"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#BDBDBD' }} />
              <Bar dataKey="Observed" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expected" fill="#00C853" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
