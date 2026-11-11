import { PoissonResult, PoissonRow } from '../types';
import { logGamma } from './mathUtils';

/**
 * Calculates Poisson probability P(X = k) = (e^{-\lambda} * \lambda^k) / k!
 * Uses log-gamma for numerical stability with larger k values.
 */
export function poissonPMF(lambda: number, k: number): number {
  if (k < 0 || lambda <= 0) return 0;
  // ln P = -lambda + k*ln(lambda) - ln(k!)
  // ln(k!) = ln(Gamma(k+1))
  const logProb = -lambda + k * Math.log(lambda) - logGamma(k + 1);
  return Math.exp(logProb);
}

export function computePoissonDistribution(
  arrivals: number[],
  targetK = 20,
  customLambda?: number,
  numSimulations = 1000
): PoissonResult {
  const n = arrivals.length;
  const lambda = customLambda !== undefined && customLambda > 0
    ? customLambda
    : n > 0
    ? arrivals.reduce((sum, v) => sum + v, 0) / n
    : 15;

  const maxK = Math.max(Math.ceil(targetK * 1.8), 35);
  const table: PoissonRow[] = [];
  let cum = 0;

  for (let k = 0; k <= maxK; k++) {
    const prob = poissonPMF(lambda, k);
    cum += prob;
    table.push({
      k,
      probability: Number(prob.toFixed(6)),
      cumulativeProbability: Number(Math.min(1, cum).toFixed(6)),
    });
  }

  const targetProb = Number(poissonPMF(lambda, targetK).toFixed(6));

  // Monte Carlo simulation of Poisson arrivals using Knuth's algorithm or inverse transform
  let simSum = 0;
  let simSumSq = 0;

  for (let s = 0; s < numSimulations; s++) {
    // Knuth's generator for Poisson(lambda)
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
      k++;
      p *= Math.random();
    } while (p > L && k < 200);
    const count = k - 1;
    simSum += count;
    simSumSq += count * count;
  }

  const simMean = simSum / numSimulations;
  const simVar = (simSumSq - (simSum * simSum) / numSimulations) / (numSimulations - 1);

  return {
    lambda: Number(lambda.toFixed(4)),
    targetK,
    targetProb,
    table,
    simulatedMean: Number(simMean.toFixed(4)),
    simulatedVar: Number(simVar.toFixed(4)),
  };
}
