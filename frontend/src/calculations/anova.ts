import { ANOVAResult, ANOVAGroup } from '../types';
import { fDistributionPValue } from './mathUtils';

export function computeOneWayANOVA(
  values: number[],
  groups: string[],
  alpha = 0.05
): ANOVAResult {
  const n = values?.length || 0;
  if (n === 0 || !groups || groups.length !== n) {
    return {
      groups: [],
      grandMean: 0,
      totalN: 0,
      ssBetween: 0,
      ssWithin: 0,
      ssTotal: 0,
      dfBetween: 0,
      dfWithin: 0,
      dfTotal: 0,
      msBetween: 0,
      msWithin: 0,
      fStat: 0,
      pValue: 1,
      alpha,
      rejectH0: false,
    };
  }

  // Group data
  const groupMap: Record<string, number[]> = {};
  for (let i = 0; i < n; i++) {
    const g = groups[i];
    if (!groupMap[g]) groupMap[g] = [];
    groupMap[g].push(values[i]);
  }

  const groupKeys = Object.keys(groupMap);
  const k = groupKeys.length;

  if (k < 2) {
    return {
      groups: [],
      grandMean: 0,
      totalN: n,
      ssBetween: 0,
      ssWithin: 0,
      ssTotal: 0,
      dfBetween: 0,
      dfWithin: 0,
      dfTotal: 0,
      msBetween: 0,
      msWithin: 0,
      fStat: 0,
      pValue: 1,
      alpha,
      rejectH0: false,
    };
  }

  const grandMean = values.reduce((sum, v) => sum + v, 0) / n;

  let ssBetween = 0;
  let ssWithin = 0;
  const groupStats: ANOVAGroup[] = [];

  for (const gName of groupKeys) {
    const gVals = groupMap[gName];
    const n_i = gVals.length;
    const mean_i = gVals.reduce((sum, v) => sum + v, 0) / n_i;
    const var_i = n_i > 1
      ? gVals.reduce((sum, v) => sum + Math.pow(v - mean_i, 2), 0) / (n_i - 1)
      : 0;

    groupStats.push({
      name: gName,
      count: n_i,
      mean: Number(mean_i.toFixed(4)),
      variance: Number(var_i.toFixed(4)),
    });

    ssBetween += n_i * Math.pow(mean_i - grandMean, 2);
    ssWithin += gVals.reduce((sum, v) => sum + Math.pow(v - mean_i, 2), 0);
  }

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = k - 1;
  const dfWithin = n - k;
  const dfTotal = n - 1;

  const msBetween = ssBetween / dfBetween;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 1;

  const fStat = msWithin > 0 ? msBetween / msWithin : 0;
  const pValue = fDistributionPValue(fStat, dfBetween, dfWithin);
  const rejectH0 = pValue < alpha;

  return {
    groups: groupStats,
    grandMean: Number(grandMean.toFixed(4)),
    totalN: n,
    ssBetween: Number(ssBetween.toFixed(4)),
    ssWithin: Number(ssWithin.toFixed(4)),
    ssTotal: Number(ssTotal.toFixed(4)),
    dfBetween,
    dfWithin,
    dfTotal,
    msBetween: Number(msBetween.toFixed(4)),
    msWithin: Number(msWithin.toFixed(4)),
    fStat: Number(fStat.toFixed(4)),
    pValue: Number(pValue.toFixed(6)),
    alpha,
    rejectH0,
  };
}
