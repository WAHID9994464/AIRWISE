import { DescriptiveStats } from '../types';

export function computeDescriptiveStats(values: number[]): DescriptiveStats {
  const n = values.length;
  if (n === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      mode: 0,
      variance: 0,
      std: 0,
      min: 0,
      max: 0,
      range: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
    };
  }

  // Mean
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Sorted values for quantiles and median
  const sorted = [...values].sort((a, b) => a - b);

  // Median
  let median: number;
  if (n % 2 === 1) {
    median = sorted[Math.floor(n / 2)];
  } else {
    median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  }

  // Mode
  const frequencyMap: Record<number, number> = {};
  let maxFreq = 0;
  let mode = sorted[0];
  for (const v of sorted) {
    frequencyMap[v] = (frequencyMap[v] || 0) + 1;
    if (frequencyMap[v] > maxFreq) {
      maxFreq = frequencyMap[v];
      mode = v;
    }
  }

  // Sample Variance: s^2 = \sum (x - mean)^2 / (n - 1)
  const variance = n > 1
    ? values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
    : 0;

  // Sample Standard Deviation: s = \sqrt{s^2}
  const std = Math.sqrt(variance);

  // Min, Max, Range
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Quartiles (percentile method matching MATLAB round percentile)
  const q1 = sorted[Math.max(0, Math.round(0.25 * n) - 1)];
  const q3 = sorted[Math.min(n - 1, Math.round(0.75 * n) - 1)];
  const iqr = q3 - q1;

  return {
    count: n,
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
    mode: Number(mode.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    std: Number(std.toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    range: Number(range.toFixed(4)),
    q1: Number(q1.toFixed(4)),
    q3: Number(q3.toFixed(4)),
    iqr: Number(iqr.toFixed(4)),
  };
}

export function computeHistogramBins(values: number[], numBins = 7) {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / numBins || 1;

  const bins: { bin: string; count: number; rangeMin: number; rangeMax: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    const rangeMin = Math.round(min + i * step);
    const rangeMax = Math.round(min + (i + 1) * step);
    bins.push({
      bin: `${rangeMin} - ${rangeMax}`,
      count: 0,
      rangeMin,
      rangeMax,
    });
  }

  for (const v of values) {
    let placed = false;
    for (let i = 0; i < numBins; i++) {
      if (v >= bins[i].rangeMin && (i === numBins - 1 ? v <= bins[i].rangeMax : v < bins[i].rangeMax)) {
        bins[i].count++;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins[bins.length - 1].count++;
    }
  }

  return bins;
}
