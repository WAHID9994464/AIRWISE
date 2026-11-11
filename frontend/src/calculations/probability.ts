import { NetworkState, ProbabilityDist } from '../types';

export const ALL_NETWORK_STATES: NetworkState[] = ['Low', 'Medium', 'High', 'Congested'];

export function computeStateProbabilities(states: NetworkState[]): {
  distribution: ProbabilityDist[];
  expectedValue: number;
  variance: number;
  congestionProbability: number;
} {
  const n = states.length;
  if (n === 0) {
    return {
      distribution: ALL_NETWORK_STATES.map((state) => ({
        state,
        count: 0,
        probability: 0,
        cumulativeProbability: 0,
      })),
      expectedValue: 0,
      variance: 0,
      congestionProbability: 0,
    };
  }

  const counts: Record<NetworkState, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Congested: 0,
  };

  for (const s of states) {
    if (counts[s] !== undefined) {
      counts[s]++;
    }
  }

  let cumulative = 0;
  const distribution: ProbabilityDist[] = ALL_NETWORK_STATES.map((state) => {
    const count = counts[state];
    const probability = count / n;
    cumulative += probability;
    return {
      state,
      count,
      probability: Number(probability.toFixed(4)),
      cumulativeProbability: Number(Math.min(1, cumulative).toFixed(4)),
    };
  });

  // Discrete state mapping: Low=1, Medium=2, High=3, Congested=4
  const stateValues: Record<NetworkState, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
    Congested: 4,
  };

  let expectedValue = 0;
  for (const item of distribution) {
    expectedValue += stateValues[item.state] * item.probability;
  }

  let variance = 0;
  for (const item of distribution) {
    variance += Math.pow(stateValues[item.state] - expectedValue, 2) * item.probability;
  }

  return {
    distribution,
    expectedValue: Number(expectedValue.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    congestionProbability: distribution.find((d) => d.state === 'Congested')?.probability || 0,
  };
}
