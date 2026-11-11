/**
 * Mathematical utilities and special functions for ASSP computations.
 * Implements Lanczos approximation for log-gamma, incomplete gamma (for Chi-Square),
 * and incomplete beta (for ANOVA F-distribution) without external heavy libraries.
 */

// Lanczos approximation coefficients for log-gamma ln(Gamma(z))
const LANCZOS_G = 7;
const LANCZOS_P = [
  0.99999999999980993,
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.138571095836524,
  9.9843695780195716e-6,
  1.5056327351493116e-7
];

export function logGamma(z: number): number {
  if (z < 0.5) {
    // Reflection formula: Gamma(1-z)*Gamma(z) = pi / sin(pi*z)
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = LANCZOS_P[0];
  for (let i = 1; i < LANCZOS_G + 2; i++) {
    x += LANCZOS_P[i] / (z + i);
  }
  const t = z + LANCZOS_G + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function gamma(z: number): number {
  return Math.exp(logGamma(z));
}

/**
 * Regularized lower incomplete gamma function P(a, x) = gamma(a, x) / Gamma(a)
 * Series expansion for x < a + 1, continued fraction otherwise.
 */
export function regularizedGammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0;
  if (x === 0) return 0;

  if (x < a + 1) {
    // Series expansion
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  } else {
    // Continued fraction for Q(a, x), then P = 1 - Q
    return 1 - regularizedGammaQ(a, x);
  }
}

/**
 * Regularized upper incomplete gamma function Q(a, x) = Gamma(a, x) / Gamma(a)
 */
export function regularizedGammaQ(a: number, x: number): number {
  if (x < 0 || a <= 0) return 1;
  if (x === 0) return 1;

  if (x < a + 1) {
    return 1 - regularizedGammaP(a, x);
  }

  // Continued fraction (Lentz's method)
  const TINY = 1e-30;
  let b = x + 1 - a;
  let c = 1 / TINY;
  let d = 1 / b;
  let f = d;

  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < TINY) d = TINY;
    c = b + an / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-15) break;
  }

  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * f;
}

/**
 * Regularized Incomplete Beta Function I_x(a, b)
 * Used to calculate exact F-distribution cumulative probabilities and p-values.
 */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Use symmetry relation if x > (a + 1) / (a + b + 2)
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularizedIncompleteBeta(1 - x, b, a);
  }

  const factor = Math.exp(
    a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b)
  ) / a;

  // Continued fraction
  const maxIterations = 200;
  const eps = 1e-15;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m++) {
    let m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    let del = d * c;
    h *= del;

    if (Math.abs(del - 1) < eps) break;
  }

  return factor * h;
}

/**
 * Chi-Square P-value: P(X >= chi2) for df degrees of freedom
 * Formula: Q(df/2, chi2/2)
 */
export function chiSquarePValue(chi2: number, df: number): number {
  if (chi2 <= 0 || df <= 0) return 1;
  return regularizedGammaQ(df / 2, chi2 / 2);
}

/**
 * F-Distribution P-value: P(F_stat >= f) for df1 and df2 degrees of freedom
 * Equivalent to MATLAB: 1 - betainc((df1*F)/(df1*F + df2), df1/2, df2/2)
 */
export function fDistributionPValue(f: number, df1: number, df2: number): number {
  if (f <= 0 || df1 <= 0 || df2 <= 0) return 1;
  const x = (df1 * f) / (df1 * f + df2);
  const betaCDF = regularizedIncompleteBeta(x, df1 / 2, df2 / 2);
  return Math.max(0, Math.min(1, 1 - betaCDF));
}
