import { RegressionResult } from '../types';

export function computeCorrelationAndRegression(x: number[], y: number[]): RegressionResult {
  const n = Math.min(x.length, y.length);
  if (n < 2) {
    return {
      n,
      r: 0,
      slope: 0,
      intercept: 0,
      r2: 0,
      covariance: 0,
      stdX: 0,
      stdY: 0,
      equation: 'Y = 0',
    };
  }

  const meanX = x.slice(0, n).reduce((sum, v) => sum + v, 0) / n;
  const meanY = y.slice(0, n).reduce((sum, v) => sum + v, 0) / n;

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  const stdX = Math.sqrt(ssXX / (n - 1));
  const stdY = Math.sqrt(ssYY / (n - 1));
  const covariance = ssXY / (n - 1);

  const denominator = Math.sqrt(ssXX * ssYY);
  const r = denominator !== 0 ? ssXY / denominator : 0;
  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = meanY - slope * meanX;
  const r2 = r * r;

  const sign = slope >= 0 ? '+' : '-';
  const equation = `Y = ${intercept.toFixed(2)} ${sign} ${Math.abs(slope).toFixed(4)} * X`;

  return {
    n,
    r: Number(r.toFixed(4)),
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4)),
    r2: Number(r2.toFixed(4)),
    covariance: Number(covariance.toFixed(4)),
    stdX: Number(stdX.toFixed(4)),
    stdY: Number(stdY.toFixed(4)),
    equation,
  };
}
