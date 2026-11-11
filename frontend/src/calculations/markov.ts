import { NetworkState, MarkovResult } from '../types';

export const MARKOV_STATES: NetworkState[] = ['Low', 'Medium', 'High', 'Congested'];

export function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = Number(sum.toFixed(4));
    }
  }
  return result;
}

export function computeMarkovTransitions(
  observations: { Day: string; Network_State: NetworkState }[]
): MarkovResult {
  const nStates = MARKOV_STATES.length;
  const stateIndexMap: Record<NetworkState, number> = {
    Low: 0,
    Medium: 1,
    High: 2,
    Congested: 3,
  };

  const countsMatrix: number[][] = Array.from({ length: nStates }, () => Array(nStates).fill(0));
  let totalTransitions = 0;

  // Strict chronological transitions: Only within the exact same day
  for (let i = 0; i < observations.length - 1; i++) {
    const current = observations[i];
    const next = observations[i + 1];

    if (current.Day === next.Day) {
      const fromIdx = stateIndexMap[current.Network_State];
      const toIdx = stateIndexMap[next.Network_State];

      if (fromIdx !== undefined && toIdx !== undefined) {
        countsMatrix[fromIdx][toIdx]++;
        totalTransitions++;
      }
    }
  }

  // Row normalization
  const transitionMatrix: number[][] = Array.from({ length: nStates }, () => Array(nStates).fill(0));
  const validRows: boolean[] = Array(nStates).fill(false);

  for (let r = 0; r < nStates; r++) {
    const rowSum = countsMatrix[r].reduce((sum, val) => sum + val, 0);
    if (rowSum > 0) {
      validRows[r] = true;
      for (let c = 0; c < nStates; c++) {
        transitionMatrix[r][c] = Number((countsMatrix[r][c] / rowSum).toFixed(4));
      }
    } else {
      validRows[r] = false;
      // Do not invent probabilities; left as 0
    }
  }

  const p2 = matrixMultiply(transitionMatrix, transitionMatrix);
  const p3 = matrixMultiply(p2, transitionMatrix);

  return {
    states: MARKOV_STATES,
    countsMatrix,
    transitionMatrix,
    p2,
    p3,
    validRows,
    totalTransitions,
  };
}
