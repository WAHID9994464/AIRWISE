import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { computeOneWayANOVA } from '../calculations/anova';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export const HypothesisTestingANOVA: React.FC = () => {
  const { observations } = useData();

  const [selectedVar, setSelectedVar] = useState<
    'Active_Users' | 'Bandwidth_Utilization_Percent' | 'New_Connections_Per_10min'
  >('Active_Users');
  const [groupingFactor, setGroupingFactor] = useState<'Hour' | 'Day' | 'TimeOfDay'>('Hour');
  const [alpha, setAlpha] = useState<number>(0.05);

  // Derive groups
  const values = observations.map((o) => o[selectedVar]);
  const groups = observations.map((o) => {
    if (groupingFactor === 'Hour') return o.Hour;
    if (groupingFactor === 'Day') return o.Day;
    // TimeOfDay: Morning (<=11:00), Afternoon (12:00-16:00), Evening (>=17:00)
    const hourNum = parseInt(o.Hour.split(':')[0], 10) || 12;
    if (hourNum <= 11) return 'Morning (08-11h)';
    if (hourNum <= 16) return 'Afternoon (13-16h)';
    return 'Evening (18-20h)';
  });

  const anova = computeOneWayANOVA(values, groups, alpha);

  const chartData = anova.groups.map((g) => ({
    name: g.name,
    mean: g.mean,
    count: g.count,
    variance: g.variance,
  }));

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <Card
        title="One-Way ANOVA Experimental Configuration"
        subtitle="Tests equality of group population means across temporal clusters"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Response Variable (Dependent Y):
            </label>
            <select
              value={selectedVar}
              onChange={(e) => setSelectedVar(e.target.value as any)}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="Active_Users">Active Connected Users</option>
              <option value="Bandwidth_Utilization_Percent">Bandwidth Utilization (%)</option>
              <option value="New_Connections_Per_10min">New Connections / 10min</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Grouping Factor (Independent X):
            </label>
            <select
              value={groupingFactor}
              onChange={(e) => setGroupingFactor(e.target.value as any)}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="Hour">Observation Hour (8 distinct time slots)</option>
              <option value="Day">Day of Week (Monday to Sunday)</option>
              <option value="TimeOfDay">Schedule Period (Morning, Afternoon, Evening)</option>
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
      </Card>

      {/* Formal Hypotheses Specification Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/60 space-y-1">
          <div className="text-xs font-bold text-[#BDBDBD] uppercase">Null Hypothesis (H0)</div>
          <div className="text-sm font-semibold text-white">
            H₀: \mu₁ = \mu₂ = \dots = \mu_k
          </div>
          <div className="text-xs text-neutral-400">
            Average network load is identical across all selected temporal groups. Observed variation is attributable solely to random sampling fluctuations.
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/60 space-y-1">
          <div className="text-xs font-bold text-[#D4AF37] uppercase">Alternative Hypothesis (H1)</div>
          <div className="text-sm font-semibold text-white">
            H₁: At least one group mean \mu_i differs
          </div>
          <div className="text-xs text-neutral-400">
            Network load varies systematically across the temporal groups due to schedule constraints or academic routines.
          </div>
        </div>
      </div>

      {/* Decision and F-Statistic Outcome Banner */}
      <div
        className={`p-5 rounded-xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 ${
          anova.rejectH0
            ? 'bg-[#00C853]/10 border-[#00C853]/50'
            : 'bg-[#FF9800]/10 border-[#FF9800]/50'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              anova.rejectH0 ? 'bg-[#00C853]/20 text-[#00C853]' : 'bg-[#FF9800]/20 text-[#FF9800]'
            }`}
          >
            {anova.rejectH0 ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-neutral-400">Statistical Test Decision</div>
            <div className="text-xl font-extrabold text-white">
              {anova.rejectH0
                ? `REJECT H₀ at α = ${alpha} (Statistically Significant)`
                : `FAIL TO REJECT H₀ at α = ${alpha} (No Evidence of Difference)`}
            </div>
            <div className="text-xs text-neutral-300 mt-0.5">
              F-statistic = <strong className="text-[#D4AF37]">{anova.fStat}</strong> | p-value ={' '}
              <strong className="text-white">{anova.pValue}</strong>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-neutral-400">Decision Criterion</div>
          <div className="text-xs font-mono font-semibold text-white">
            {anova.pValue} {anova.rejectH0 ? '<' : '≥'} {alpha}
          </div>
        </div>
      </div>

      {/* Standard ANOVA Summary Table */}
      <Card
        title="Standard Analysis of Variance (ANOVA) Partitioning Table"
        subtitle="Partitions sum of squares (SS) into between-group and within-group components"
      >
        <div className="overflow-x-auto rounded-lg border border-[#66531C]/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151515] border-b border-[#66531C]/50 text-neutral-300 uppercase">
              <tr>
                <th className="py-2.5 px-3">Source of Variation</th>
                <th className="py-2.5 px-3 text-right">Sum of Squares (SS)</th>
                <th className="py-2.5 px-3 text-right">Degrees of Freedom (df)</th>
                <th className="py-2.5 px-3 text-right">Mean Square (MS)</th>
                <th className="py-2.5 px-3 text-right">F-Statistic</th>
                <th className="py-2.5 px-3 text-right">P-Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828] text-neutral-200">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#D4AF37]">
                  Between Groups (Treatment / Schedule)
                </td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.ssBetween.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.dfBetween}</td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.msBetween.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#D4AF37]">{anova.fStat}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00C853]">{anova.pValue}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-neutral-300">
                  Within Groups (Error / Random Variation)
                </td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.ssWithin.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.dfWithin}</td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.msWithin.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-neutral-500">—</td>
                <td className="py-2.5 px-3 text-right text-neutral-500">—</td>
              </tr>
              <tr className="bg-[#181818] font-bold text-white">
                <td className="py-2.5 px-3">Total Variation</td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.ssTotal.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-mono">{anova.dfTotal}</td>
                <td className="py-2.5 px-3 text-right text-neutral-500">—</td>
                <td className="py-2.5 px-3 text-right text-neutral-500">—</td>
                <td className="py-2.5 px-3 text-right text-neutral-500">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Group Means Bar Chart */}
      <Card
        title="Group Means Comparison Chart"
        subtitle="Empirical average and group sizes across categories"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                formatter={(val: any) => [`${val}`, 'Group Mean']}
              />
              <Bar dataKey="mean" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Assumptions and Academic Limitations Disclaimer */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/50 space-y-2 text-xs text-[#BDBDBD]">
        <div className="flex items-center space-x-2 font-bold text-white">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          <span>Statistical Assumptions & Academic Guidelines:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Independence of Observations:</strong> Assumes device counts in separate intervals are statistically independent.
          </li>
          <li>
            <strong>Approximate Normality:</strong> ANOVA is reasonably robust to mild non-normality given moderate sample sizes.
          </li>
          <li>
            <strong>Homogeneity of Variances (Homoscedasticity):</strong> Assumes equal variances across time groups.
          </li>
          <li>
            <strong>Non-Causal Association:</strong> Statistically significant differences demonstrate temporal association with schedule intervals, not direct causation.
          </li>
        </ul>
      </div>
    </div>
  );
};
