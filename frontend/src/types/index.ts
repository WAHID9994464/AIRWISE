export type NetworkState = 'Low' | 'Medium' | 'High' | 'Congested';

export interface WiFiObservation {
  id?: string;
  Day: string;
  Hour: string;
  Active_Users: number;
  Bandwidth_Utilization_Percent: number;
  New_Connections_Per_10min: number;
  Network_State: NetworkState;
}

export interface NetworkThresholds {
  lowMax: number;        // e.g. 59 (< 60)
  mediumMax: number;     // e.g. 109 (60 - 109)
  highMax: number;       // e.g. 144 (110 - 144)
  congestedMin: number;  // e.g. 145 (>= 145)
}

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  mode: number;
  variance: number;
  std: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
}

export interface ProbabilityDist {
  state: NetworkState;
  count: number;
  probability: number;
  cumulativeProbability: number;
}

export interface ANOVAGroup {
  name: string;
  count: number;
  mean: number;
  variance: number;
}

export interface ANOVAResult {
  groups: ANOVAGroup[];
  grandMean: number;
  totalN: number;
  ssBetween: number;
  ssWithin: number;
  ssTotal: number;
  dfBetween: number;
  dfWithin: number;
  dfTotal: number;
  msBetween: number;
  msWithin: number;
  fStat: number;
  pValue: number;
  alpha: number;
  rejectH0: boolean;
}

export interface ChiSquareCategory {
  category: string;
  observed: number;
  expected: number;
  chiContribution: number;
}

export interface ChiSquareResult {
  categories: ChiSquareCategory[];
  totalObserved: number;
  chi2Stat: number;
  df: number;
  pValue: number;
  alpha: number;
  rejectH0: boolean;
  assumptionsMet: boolean;
}

export interface RegressionResult {
  n: number;
  r: number;
  slope: number;
  intercept: number;
  r2: number;
  covariance: number;
  stdX: number;
  stdY: number;
  equation: string;
}

export interface PoissonRow {
  k: number;
  probability: number;
  cumulativeProbability: number;
}

export interface PoissonResult {
  lambda: number;
  targetK: number;
  targetProb: number;
  table: PoissonRow[];
  simulatedMean: number;
  simulatedVar: number;
}

export interface MarkovResult {
  states: NetworkState[];
  countsMatrix: number[][];
  transitionMatrix: number[][];
  p2: number[][];
  p3: number[][];
  validRows: boolean[];
  totalTransitions: number;
}

export interface MonteCarloResult {
  initialState: NetworkState;
  steps: number;
  simulations: number;
  congestedCount: number;
  congestionProb: number;
  finalDistribution: { state: NetworkState; count: number; percentage: number }[];
  convergencePoints: { simulation: number; probability: number }[];
}

export interface MATLABVerificationItem {
  metric: string;
  reactValue: number | null;
  matlabValue: number | null;
  difference: number | null;
  tolerance: number;
  status: 'Verified' | 'Mismatch' | 'Awaiting';
  category: string;
  description: string;
}

export type DataSourceType = 'SIMULATED SAMPLE DATA' | 'UPLOADED CSV DATA' | 'USER MODIFIED DATA';
