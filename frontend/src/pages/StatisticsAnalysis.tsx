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
import { computeDescriptiveStats, computeHistogramBins } from '../calculations/stats';

export const StatisticsAnalysis: React.FC = () => {
  const { observations } = useData();

  const [selectedVariable, setSelectedVariable] = useState<
    'Active_Users' | 'Bandwidth_Utilization_Percent' | 'New_Connections_Per_10min'
  >('Active_Users');
  const [filterDay, setFilterDay] = useState<string>('All');

  // Filter observations by day if selected
  const filteredObs = observations.filter((o) => filterDay === 'All' || o.Day === filterDay);

  const rawValues = filteredObs.map((o) => o[selectedVariable]);
  const stats = computeDescriptiveStats(rawValues);
  const histogramData = computeHistogramBins(rawValues, 7);

  // Group by Day for Mean comparison chart
  const dayGroups: Record<string, { sum: number; count: number }> = {};
  for (const obs of observations) {
    if (!dayGroups[obs.Day]) dayGroups[obs.Day] = { sum: 0, count: 0 };
    dayGroups[obs.Day].sum += obs[selectedVariable];
    dayGroups[obs.Day].count++;
  }
  const dayComparisonData = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]
    .filter((d) => dayGroups[d])
    .map((day) => ({
      day: day.substring(0, 3),
      mean: Number((dayGroups[day].sum / dayGroups[day].count).toFixed(2)),
    }));

  const variableLabels = {
    Active_Users: 'Active Connected Users (Devices)',
    Bandwidth_Utilization_Percent: 'Bandwidth Utilization (%)',
    New_Connections_Per_10min: 'New Connections Arrival Count (per 10 min)',
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Filter Bar */}
      <Card
        title="Statistical Variable & Temporal Filter"
        subtitle="Select metric and scope to compute descriptive mathematical properties"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Analytical Target Variable:
            </label>
            <select
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value as any)}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="Active_Users">Active Connected Users</option>
              <option value="Bandwidth_Utilization_Percent">Bandwidth Utilization (%)</option>
              <option value="New_Connections_Per_10min">New Connections / 10min</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Temporal Scope Filter (Day):
            </label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full bg-[#151515] border border-[#66531C] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="All">All 7 Observation Days</option>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 11 Statistical Measures Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Count (n)</div>
          <div className="text-xl font-bold text-white mt-1">{stats.count}</div>
          <div className="text-[10px] text-neutral-500">Sample size</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Mean (x̄)</div>
          <div className="text-xl font-bold text-[#D4AF37] mt-1">{stats.mean}</div>
          <div className="text-[10px] text-neutral-500">Central arithmetic average</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Median (x̃)</div>
          <div className="text-xl font-bold text-white mt-1">{stats.median}</div>
          <div className="text-[10px] text-neutral-500">50th percentile rank</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Mode</div>
          <div className="text-xl font-bold text-white mt-1">{stats.mode}</div>
          <div className="text-[10px] text-neutral-500">Highest frequency outcome</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Variance (s²)</div>
          <div className="text-xl font-bold text-[#00C853] mt-1">{stats.variance}</div>
          <div className="text-[10px] text-neutral-500">Bessel corrected variance</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Std Dev (s)</div>
          <div className="text-xl font-bold text-[#00C853] mt-1">{stats.std}</div>
          <div className="text-[10px] text-neutral-500">Square root of variance</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Min Value</div>
          <div className="text-xl font-bold text-white mt-1">{stats.min}</div>
          <div className="text-[10px] text-neutral-500">Lower bound</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Max Value</div>
          <div className="text-xl font-bold text-[#FF9800] mt-1">{stats.max}</div>
          <div className="text-[10px] text-neutral-500">Upper bound peak</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Range</div>
          <div className="text-xl font-bold text-white mt-1">{stats.range}</div>
          <div className="text-[10px] text-neutral-500">Spread (Max - Min)</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Quartile 1 (Q1)</div>
          <div className="text-xl font-bold text-white mt-1">{stats.q1}</div>
          <div className="text-[10px] text-neutral-500">25th percentile</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">Quartile 3 (Q3)</div>
          <div className="text-xl font-bold text-white mt-1">{stats.q3}</div>
          <div className="text-[10px] text-neutral-500">75th percentile</div>
        </div>
        <div className="bg-[#181818] p-3.5 rounded-xl border border-[#66531C]/60">
          <div className="text-[11px] text-[#BDBDBD] uppercase font-semibold">IQR (Q3 - Q1)</div>
          <div className="text-xl font-bold text-[#D4AF37] mt-1">{stats.iqr}</div>
          <div className="text-[10px] text-neutral-500">Interquartile middle 50%</div>
        </div>
      </div>

      {/* Visual Charts: Histogram & Time-series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Frequency Histogram */}
        <Card
          title="Frequency Distribution Histogram"
          subtitle={`Binned frequency intervals for ${variableLabels[selectedVariable]}`}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="bin" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val} occurrences`, 'Frequency']}
                />
                <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Daily Mean Comparison */}
        <Card
          title="Mean Comparison across Days of Week"
          subtitle="Evaluates load variation between weekdays and weekends"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#66531C', color: '#fff' }}
                  formatter={(val: any) => [`${val}`, 'Daily Average']}
                />
                <Bar dataKey="mean" fill="#00C853" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Box Plot Visualization Card */}
      <Card
        title="Five-Number Summary & Box-and-Whisker Visualization"
        subtitle="Decomposes central tendency and dispersion bounds"
      >
        <div className="space-y-4">
          <div className="relative pt-6 pb-4 px-4 bg-[#121212] rounded-xl border border-[#66531C]/40">
            {/* Box plot schematic bar */}
            <div className="relative h-12 flex items-center">
              {/* Whiskers line */}
              <div className="absolute left-[5%] right-[5%] h-0.5 bg-neutral-600" />
              {/* Min marker */}
              <div className="absolute left-[5%] -top-2 flex flex-col items-center">
                <span className="text-[10px] text-neutral-400 font-mono">Min: {stats.min}</span>
                <div className="w-1.5 h-6 bg-neutral-400" />
              </div>
              {/* Q1 to Q3 Box */}
              <div className="absolute left-[25%] right-[25%] h-8 bg-[#242424] border-2 border-[#D4AF37] rounded flex items-center justify-center">
                {/* Median marker */}
                <div className="w-1 h-full bg-[#00C853]" />
              </div>
              {/* Max marker */}
              <div className="absolute right-[5%] -top-2 flex flex-col items-center">
                <span className="text-[10px] text-neutral-400 font-mono">Max: {stats.max}</span>
                <div className="w-1.5 h-6 bg-neutral-400" />
              </div>
            </div>

            <div className="flex justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-800 font-mono">
              <span>Q1: {stats.q1}</span>
              <span className="text-[#00C853] font-bold">Median: {stats.median}</span>
              <span>Q3: {stats.q3}</span>
              <span className="text-[#D4AF37] font-bold">IQR: {stats.iqr}</span>
            </div>
          </div>

          {/* Simple Academic Interpretation */}
          <div className="p-4 bg-[#181818] rounded-lg border-l-4 border-l-[#D4AF37] text-xs text-[#BDBDBD] space-y-1">
            <span className="font-bold text-white uppercase">Academic Interpretation: </span>
            <span>
              The sample displays a mean of <strong className="text-white">{stats.mean}</strong> and standard deviation
              of <strong className="text-[#00C853]">{stats.std}</strong>. Because the mean and median (
              <strong className="text-white">{stats.median}</strong>) are close, the distribution exhibits moderate
              symmetry with peak clustering within the interquartile range of{' '}
              <strong className="text-[#D4AF37]">{stats.q1}</strong> to <strong className="text-[#D4AF37]">{stats.q3}</strong>.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
