import { NetworkState, ChiSquareResult, ChiSquareCategory } from '../types';
import { chiSquarePValue } from './mathUtils';

export function computeChiSquareGoodnessOfFit(
  states: NetworkState[],
  expectedProportions?: Record<NetworkState, number>,
  alpha = 0.05
): ChiSquareResult {
  const categoriesList: NetworkState[] = ['Low', 'Medium', 'High', 'Congested'];
  const n = states.length;

  if (n === 0) {
    return {
      categories: [],
      totalObserved: 0,
      chi2Stat: 0,
      df: 3,
      pValue: 1,
      alpha,
      rejectH0: false,
      assumptionsMet: false,
    };
  }

  // Count observed frequencies
  const observedMap: Record<NetworkState, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Congested: 0,
  };
  for (const s of states) {
    if (observedMap[s] !== undefined) {
      observedMap[s]++;
    }
  }

  // Default expected proportions: uniform (1/4 each)
  const defaultProp = 1 / categoriesList.length;

  let chi2Stat = 0;
  let assumptionsMet = true;
  const categories: ChiSquareCategory[] = [];

  for (const cat of categoriesList) {
    const o = observedMap[cat] || 0;
    const prop = expectedProportions ? expectedProportions[cat] || defaultProp : defaultProp;
    const e = n * prop;

    if (e < 5) {
      assumptionsMet = false;
    }

    const diff = o - e;
    const contribution = e > 0 ? (diff * diff) / e : 0;
    chi2Stat += contribution;

    categories.push({
      category: cat,
      observed: o,
      expected: Number(e.toFixed(4)),
      chiContribution: Number(contribution.toFixed(4)),
    });
  }

  const df = categoriesList.length - 1;
  const pValue = chiSquarePValue(chi2Stat, df);
  const rejectH0 = pValue < alpha;

  return {
    categories,
    totalObserved: n,
    chi2Stat: Number(chi2Stat.toFixed(4)),
    df,
    pValue: Number(pValue.toFixed(6)),
    alpha,
    rejectH0,
    assumptionsMet,
  };
}
