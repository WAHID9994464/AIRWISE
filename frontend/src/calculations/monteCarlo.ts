import { NetworkState, MonteCarloResult } from '../types';
import { MARKOV_STATES } from './markov';

export function runMonteCarloSimulation(
  transitionMatrix: number[][] = [],
  validRows: boolean[] = [],
  initialState: NetworkState = 'Low',
  steps = 3,
  simulations = 2000
): MonteCarloResult {
  const stateIndexMap: Record<NetworkState, number> = {
    Low: 0,
    Medium: 1,
    High: 2,
    Congested: 3,
  };

  const initialIdx = stateIndexMap[initialState] ?? 0;
  const finalCounts: number[] = [0, 0, 0, 0];
  let congestedCount = 0;

  const safeSimulations = Math.max(1, simulations);
  const safeSteps = Math.max(1, steps);
  const convergencePoints: { simulation: number; probability: number }[] = [];
  const logInterval = Math.max(1, Math.floor(safeSimulations / 50));

  for (let s = 1; s <= safeSimulations; s++) {
    let currentIdx = initialIdx;

    for (let step = 0; step < safeSteps; step++) {
      if (!validRows || !validRows[currentIdx] || !transitionMatrix || !transitionMatrix[currentIdx]) {
        break; // If no observed transitions, retain current state
      }

      const probs = transitionMatrix[currentIdx];
      if (!probs || probs.length === 0) {
        break;
      }

      const rand = Math.random();
      let cum = 0;
      let nextIdx = currentIdx;

      for (let j = 0; j < probs.length; j++) {
        cum += probs[j];
        if (rand <= cum) {
          nextIdx = j;
          break;
        }
      }
      currentIdx = nextIdx;
    }

    if (currentIdx >= 0 && currentIdx < 4) {
      finalCounts[currentIdx]++;
      if (currentIdx === 3) { // 3 = Congested
        congestedCount++;
      }
    }

    if (s % logInterval === 0 || s === safeSimulations) {
      convergencePoints.push({
        simulation: s,
        probability: Number((congestedCount / s).toFixed(4)),
      });
    }
  }

  const congestionProb = Number((congestedCount / safeSimulations).toFixed(4));
  const finalDistribution = MARKOV_STATES.map((state, idx) => ({
    state,
    count: finalCounts[idx] || 0,
    percentage: Number((((finalCounts[idx] || 0) / safeSimulations) * 100).toFixed(1)),
  }));

  return {
    initialState,
    steps: safeSteps,
    simulations: safeSimulations,
    congestedCount,
    congestionProb,
    finalDistribution,
    convergencePoints,
  };
}
