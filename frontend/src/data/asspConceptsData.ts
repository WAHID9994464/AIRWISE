import { ConceptFormulaItem } from '../components/FormulaCard';

export const ASSP_CONCEPTS_DATA: ConceptFormulaItem[] = [
  // ==========================================
  // SECTION A: RANDOM VARIABLES AND PROBABILITY
  // ==========================================
  {
    id: 'rv-definition',
    title: 'Random Variables Definition',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'X: S \\to \\mathbb{R}',
    whatItCalculates: 'Defines a mapping from sample space experimental outcomes to real numerical values.',
    variables: [
      { symbol: 'X', meaning: 'Random variable function' },
      { symbol: 'S', meaning: 'Sample space of all possible random experiment outcomes' },
      { symbol: '\\mathbb{R}', meaning: 'Set of real numbers' },
    ],
    conditions: [
      'Associates a unique real number with each elementary outcome in the sample space.',
      'Outcome value is not known in advance of the experiment.'
    ],
    wifiApplication: 'Maps observation intervals into numerical device counts and bandwidth levels in the Wi-Fi dataset.',
    workedExample: 'Sample space of network states S = {Low, Medium, High, Congested} mapped to numerical scores X in {1, 2, 3, 4}.',
    datasetConnection: 'Active_Users, Network_State'
  },
  {
    id: 'discrete-continuous-rv',
    title: 'Discrete and Continuous Random Variables',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: '\\text{Discrete: } \\sum_{i=1}^{\\infty} p(x_i) = 1, \\quad \\text{Continuous: } \\int_{-\\infty}^{\\infty} f(x) dx = 1',
    whatItCalculates: 'Characterizes variables by whether possible outcomes are countable or uncountable.',
    variables: [
      { symbol: 'p(x_i)', meaning: 'Probability mass assigned to discrete value x_i' },
      { symbol: 'f(x)', meaning: 'Continuous probability density function at point x' },
      { symbol: 'dx', meaning: 'Infinitesimal differential interval' },
    ],
    conditions: [
      'Discrete RV: takes finite or countably infinite number of possible outcomes.',
      'Continuous RV: takes uncountable continuum of possible real values.'
    ],
    wifiApplication: 'Active_Users and New_Connections_Per_10min are discrete integer variables; Bandwidth_Utilization_Percent is continuous.',
    workedExample: 'Discrete arrivals count: X in {0, 1, 2, ...}. Continuous bandwidth usage: X in [0.0%, 100.0%].',
    datasetConnection: 'Active_Users (Discrete), Bandwidth_Utilization_Percent (Continuous)'
  },
  {
    id: 'cdf-distribution',
    title: 'Cumulative Distribution Function (CDF)',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'F_X(x) = P(X \\le x), \\quad -\\infty < x < \\infty',
    whatItCalculates: 'Calculates the cumulative probability that random variable X assumes a value less than or equal to x.',
    variables: [
      { symbol: 'F_X(x)', meaning: 'Cumulative distribution function of random variable X' },
      { symbol: 'P(X \\le x)', meaning: 'Probability that outcome is less than or equal to threshold x' },
      { symbol: 'x', meaning: 'Specific numerical threshold' },
    ],
    conditions: [
      '0 <= F_X(x) <= 1 for all x.',
      'F_X(x) is non-decreasing.',
      'lim_{x -> -inf} F_X(x) = 0 and lim_{x -> +inf} F_X(x) = 1.'
    ],
    wifiApplication: 'Determines the probability that active connected users do not exceed a given network capacity threshold x.',
    workedExample: 'For discrete outcomes {0, 1, 2, 3} with probabilities {1/8, 3/8, 3/8, 1/8}: F(0)=1/8, F(1)=1/2, F(2)=7/8, F(3)=1.0.',
    datasetConnection: 'Active_Users cumulative capacity analysis'
  },
  {
    id: 'pmf-discrete',
    title: 'Probability Mass Function (PMF)',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'p(x_i) \\ge 0 \\quad \\forall x_i, \\qquad \\sum_{i=1}^{\\infty} p(x_i) = 1',
    whatItCalculates: 'Assigns probability to each discrete realization of a discrete random variable.',
    variables: [
      { symbol: 'p(x_i)', meaning: 'Probability mass for discrete outcome x_i' },
      { symbol: 'x_i', meaning: 'Discrete outcome values (i = 1, 2, ...)' },
    ],
    conditions: [
      'Every probability mass must be non-negative: p(x_i) >= 0.',
      'The total sum of probabilities across all outcomes must equal 1.'
    ],
    wifiApplication: 'Gives the probability mass distribution of network states: P(Low), P(Medium), P(High), P(Congested).',
    workedExample: 'Across 56 intervals: p(Low)=23/56=0.4107, p(Medium)=22/56=0.3929, p(High)=6/56=0.1071, p(Congested)=5/56=0.0893. Total = 1.0.',
    datasetConnection: 'Network_State'
  },
  {
    id: 'pdf-continuous',
    title: 'Probability Density Function (PDF)',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'f(x) \\ge 0, \\quad \\int_{-\\infty}^{\\infty} f(x) dx = 1, \\quad P(a < X < b) = \\int_a^b f(x) dx',
    whatItCalculates: 'Defines probability density over continuous intervals; single point probability is zero: P(X = a) = 0.',
    variables: [
      { symbol: 'f(x)', meaning: 'Continuous probability density function' },
      { symbol: 'P(a < X < b)', meaning: 'Probability that X lies strictly between limits a and b' },
      { symbol: 'a, b', meaning: 'Lower and upper integration limits' },
    ],
    conditions: [
      'f(x) >= 0 for all real numbers x.',
      'Total area under density curve bounded by x-axis equals 1: int_{-inf}^{inf} f(x) dx = 1.',
      'P(a <= X <= b) = P(a < X <= b) = P(a <= X < b) = P(a < X < b) = int_a^b f(x) dx.',
      'P(X >= a) = int_a^inf f(x) dx and P(X < a) = 1 - P(X >= a).'
    ],
    wifiApplication: 'Calculates the probability that continuous link bandwidth utilization falls between 60% and 85%.',
    workedExample: 'For f(x) = 2x on (0, 1): P(0.3 < X < 0.7) = int_{0.3}^{0.7} 2x dx = [x^2]_{0.3}^{0.7} = 0.49 - 0.09 = 0.40.',
    datasetConnection: 'Bandwidth_Utilization_Percent'
  },
  {
    id: 'expectation-mean',
    title: 'Mathematical Expectation & Mean',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'E[X] = \\mu = \\sum_{i=1}^{\\infty} x_i p(x_i) \\quad \\text{or} \\quad E(X) = \\int_{-\\infty}^{\\infty} x f(x) dx',
    whatItCalculates: 'Calculates the expected value, mean (mu), or first moment about the origin.',
    variables: [
      { symbol: 'E[X] \\text{ or } \\mu', meaning: 'Mathematical expectation / long-run arithmetic mean' },
      { symbol: 'x_i, x', meaning: 'Outcome value of random variable X' },
      { symbol: 'p(x_i), f(x)', meaning: 'Probability mass (discrete) or density (continuous)' },
    ],
    conditions: [
      'Series sum or integral must converge absolutely.'
    ],
    wifiApplication: 'Computes long-run average active connected users and mean bandwidth utilization on campus access points.',
    workedExample: 'E[X] = 0(1/8) + 1(3/8) + 2(3/8) + 3(1/8) = 12/8 = 1.5 average units.',
    datasetConnection: 'Active_Users, Bandwidth_Utilization_Percent'
  },
  {
    id: 'variance-std',
    title: 'Variance & Standard Deviation',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'V(X) = E[(X - E(X))^2] = E(X^2) - (E(X))^2, \\qquad SD(X) = \\sqrt{V(X)} = \\sigma',
    whatItCalculates: 'Measures dispersion of random variable about its mean (second moment about the mean).',
    variables: [
      { symbol: 'V(X) \\text{ or } \\sigma^2', meaning: 'Variance (second moment about the mean)' },
      { symbol: 'SD(X) \\text{ or } \\sigma', meaning: 'Standard deviation (square root of variance)' },
      { symbol: 'E(X^2)', meaning: 'Second moment about origin: sum x_i^2 p(x_i) or int x^2 f(x) dx' },
    ],
    conditions: [
      'Discrete: V(X) = sum x_i^2 p(x_i) - [sum x_i p(x_i)]^2.',
      'Continuous: V(X) = int_{-inf}^{inf} x^2 f(x) dx - [int_{-inf}^{inf} x f(x) dx]^2.'
    ],
    wifiApplication: 'Quantifies volatility, variance, and standard deviation of active Wi-Fi users during class schedule shifts.',
    workedExample: 'If E[X] = 1.5 and E[X^2] = 24/8 = 3.0, then V(X) = 3.0 - (1.5)^2 = 0.75, SD(X) = sqrt(0.75) = 0.866.',
    datasetConnection: 'Active_Users, Bandwidth_Utilization_Percent'
  },
  {
    id: 'joint-distributions',
    title: 'Joint Probability Distributions',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'p(x, y) = P(X = x, Y = y), \\quad \\sum_x \\sum_y p(x,y) = 1; \\qquad F(x, y) = \\int_{-\\infty}^x \\int_{-\\infty}^y f(u, v) dv du',
    whatItCalculates: 'Simultaneously describes the probability distribution of two random variables X and Y.',
    variables: [
      { symbol: 'p(x, y)', meaning: 'Joint PMF for discrete pair (X, Y)' },
      { symbol: 'f(x, y)', meaning: 'Joint PDF for continuous vector (X, Y) satisfying int int f(x,y)dx dy = 1' },
      { symbol: 'F(x, y)', meaning: 'Joint CDF: P(X <= x, Y <= y)' },
      { symbol: '\\frac{\\partial^2 F(x, y)}{\\partial x \\partial y}', meaning: 'Equals f(x, y) via Fundamental Theorem of Calculus' },
    ],
    conditions: [
      'Discrete: p(x, y) >= 0 and sum_x sum_y p(x, y) = 1.',
      'Continuous: f(x, y) >= 0 and int_{-inf}^{inf} int_{-inf}^{inf} f(x, y) dx dy = 1.',
      'Rectangle probability: P(a < X <= b, c < Y <= d) = F(b, d) - F(a, d) - F(b, c) + F(a, c).'
    ],
    wifiApplication: 'Models joint probability of user count X and bandwidth saturation Y occurring in the same interval.',
    workedExample: 'If p(0,1)=0.08, p(0,2)=0.12, p(1,1)=0.20, p(1,2)=0.05, then P(X <= 1, Y >= 1) = 0.08+0.12+0.20+0.05 = 0.45.',
    datasetConnection: 'Active_Users paired with Bandwidth_Utilization_Percent'
  },
  {
    id: 'marginal-conditional',
    title: 'Marginal & Conditional Distributions',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'p_X(x) = \\sum_y p(x, y), \\quad p_{X|Y}(x \\mid y) = \\frac{p(x, y)}{p_Y(y)}; \\qquad f_X(x) = \\int_{-\\infty}^{\\infty} f(x, y) dy, \\quad f_{X|Y}(x \\mid y) = \\frac{f(x, y)}{f_Y(y)}',
    whatItCalculates: 'Extracts single-variable marginals by summation/integration and conditional probabilities given partial observation.',
    variables: [
      { symbol: 'p_X(x), f_X(x)', meaning: 'Marginal PMF / PDF of random variable X' },
      { symbol: 'p_{X|Y}(x \\mid y)', meaning: 'Conditional PMF of X given Y = y (provided p_Y(y) > 0)' },
      { symbol: 'f_{X|Y}(x \\mid y)', meaning: 'Conditional PDF of X given Y = y (provided f_Y(y) > 0)' },
    ],
    conditions: [
      'Conditional distributions are legitimate probability distributions (integrate/sum to 1).',
      'Independence condition: p(x, y) = p_X(x) p_Y(y) (discrete) or f(x, y) = f_X(x) f_Y(y) (continuous).'
    ],
    wifiApplication: 'Computes conditional probability of congestion given a specific hour: P(State = Congested | Hour = 14:00).',
    workedExample: 'If p(1, 1) = 0.20 and marginal p_Y(1) = 0.40, then P(X = 1 | Y = 1) = p(1, 1) / p_Y(1) = 0.20 / 0.40 = 0.50.',
    datasetConnection: 'Hour, Network_State'
  },
  {
    id: 'expectation-properties',
    title: 'Expectation Properties & Law of Unconscious Statistician',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'E[aX + bY] = aE[X] + bE[Y], \\quad E[c] = c, \\quad E[XY] = E[X]E[Y] \\text{ (if } X \\perp Y \\text{)}',
    whatItCalculates: 'Fundamental linear and multiplicative properties of mathematical expectations.',
    variables: [
      { symbol: 'a, b, c', meaning: 'Real numerical constants' },
      { symbol: 'X \\perp Y', meaning: 'Statistically independent random variables' },
      { symbol: 'E[g(X)]', meaning: 'sum_x g(x)p(x) or int_{-inf}^{inf} g(x)f(x) dx' },
    ],
    conditions: [
      'Linearity E[aX + bY] = aE[X] + bE[Y] holds whether or not X, Y are independent.',
      'Product rule E[XY] = E[X]E[Y] requires independence X perp Y.'
    ],
    wifiApplication: 'Calculates combined expected throughput across dual frequency bands: E[Load_2.4G + Load_5G] = E[Load_2.4G] + E[Load_5G].',
    workedExample: 'If E[X] = 2/3 and E[Y] = 2/3: E[X + Y] = 2/3 + 2/3 = 4/3. If X perp Y, E[XY] = (2/3)(2/3) = 4/9.',
    datasetConnection: 'Active_Users, Bandwidth_Utilization_Percent'
  },
  {
    id: 'covariance-correlation',
    title: 'Covariance and Correlation Coefficient',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: '\\text{Cov}(X, Y) = E[XY] - \\mu_X \\mu_Y, \\qquad \\rho(X, Y) = \\frac{\\text{Cov}(X, Y)}{\\sigma_X \\sigma_Y}, \\quad |\\rho| \\le 1',
    whatItCalculates: 'Measures degree of linear co-dependence between two random variables X and Y.',
    variables: [
      { symbol: '\\text{Cov}(X, Y)', meaning: 'Covariance: E[(X - mu_X)(Y - mu_Y)]' },
      { symbol: '\\rho(X, Y)', meaning: 'Pearson correlation coefficient bounded in [-1, +1]' },
      { symbol: '\\sigma_X, \\sigma_Y', meaning: 'Standard deviations: sqrt(Var(X)), sqrt(Var(Y))' },
    ],
    conditions: [
      'If X perp Y, Cov(X, Y) = 0 (converse not true in general; zero covariance detects only linear association).',
      'Var(X + Y) = Var(X) + Var(Y) + 2 Cov(X, Y).',
      'Var(aX + bY) = a^2 Var(X) + b^2 Var(Y) + 2ab Cov(X, Y).'
    ],
    wifiApplication: 'Evaluates linear correlation between number of active users and gateway bandwidth percentage.',
    workedExample: 'If E[X] = 1.0, E[Y] = 0.9, E[XY] = 0.86: Cov(X, Y) = 0.86 - (1.0)(0.9) = -0.04. Negative covariance indicates inverse trend.',
    datasetConnection: 'Active_Users, Bandwidth_Utilization_Percent'
  },
  {
    id: 'mgf-definition',
    title: 'Moment Generating Function (MGF)',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: 'M_X(t) = E[e^{tX}] = \\sum_{n=0}^{\\infty} \\frac{t^n}{n!} E[X^n], \\qquad M_X^{(n)}(0) = E[X^n]',
    whatItCalculates: 'Generates moments of random variable X through differentiation at parameter t = 0.',
    variables: [
      { symbol: 'M_X(t)', meaning: 'Moment generating function defined on open interval containing t = 0' },
      { symbol: 'M_X\'(0)', meaning: 'First moment / mean: E[X] = mu_1\'' },
      { symbol: 'M_X\'\'(0)', meaning: 'Second moment: E[X^2] = mu_2\'' },
      { symbol: 'Var(X)', meaning: 'Computed as M_X\'\'(0) - [M_X\'(0)]^2' },
    ],
    conditions: [
      'M_{aX+b}(t) = e^{tb} M_X(at) for linear transformations.',
      'M_{X+Y}(t) = M_X(t) M_Y(t) for independent sums.'
    ],
    wifiApplication: 'Analytically computes moments and proves distribution of aggregated independent traffic streams.',
    workedExample: 'For Bernoulli(p): M_X(t) = q + p e^t. M_X\'(0) = p = E[X]. M_X\'\'(0) = p = E[X^2]. Var(X) = p - p^2 = pq.',
    datasetConnection: 'New_Connections_Per_10min moments'
  },
  {
    id: 'cf-definition',
    title: 'Characteristic Function (CF)',
    section: 'A',
    sectionLabel: 'Section A: Random Variables & Probability',
    formula: '\\phi_X(t) = E[e^{itX}] = E[\\cos(tX)] + i E[\\sin(tX)], \\qquad E[X^n] = i^{-n} \\phi_X^{(n)}(0)',
    whatItCalculates: 'Fourier transform of the probability distribution; always exists for every random variable.',
    variables: [
      { symbol: '\\phi_X(t)', meaning: 'Characteristic function defined for all real t' },
      { symbol: 'i', meaning: 'Imaginary unit: sqrt(-1)' },
      { symbol: 'E[X]', meaning: 'First moment: -i phi_X\'(0)' },
      { symbol: 'E[X^2]', meaning: 'Second moment: -phi_X\'\'(0)' },
    ],
    conditions: [
      'phi_X(0) = 1 and |phi_X(t)| <= 1 for all t (always converges absolutely).',
      'phi_X(-t) = overline{phi_X(t)} (complex conjugate).',
      'For independent sums: phi_{X+Y}(t) = phi_X(t) phi_Y(t).'
    ],
    wifiApplication: 'Preferred in network traffic analysis for heavy-tailed burst distributions where MGF does not converge.',
    workedExample: 'For Standard Normal Z ~ N(0, 1): phi_Z(t) = e^{-t^2/2}. For general X ~ N(mu, sigma^2): phi_X(t) = e^{it mu - sigma^2 t^2 / 2}.',
    datasetConnection: 'Active_Users distribution'
  },

  // ==========================================
  // SECTION B: PROBABILITY DISTRIBUTIONS
  // ==========================================
  {
    id: 'dist-bernoulli',
    title: 'Bernoulli Distribution',
    section: 'B',
    sectionLabel: 'Section B: Probability Distributions',
    formula: 'P(X = 0) = 1 - p = q, \\quad P(X = 1) = p, \\qquad \\mu = p, \\quad v(X) = pq, \\quad \\sigma = \\sqrt{pq}',
    whatItCalculates: 'Models a single random experiment with only two outcomes: success (X=1) and failure (X=0).',
    variables: [
      { symbol: 'p', meaning: 'Probability of success (0 <= p <= 1)' },
      { symbol: 'q', meaning: 'Probability of failure: q = 1 - p (p + q = 1)' },
      { symbol: '\\mu', meaning: 'Mean = p' },
      { symbol: 'v(X)', meaning: 'Variance = np(1-p) = pq' },
    ],
    conditions: [
      'Single trial with exactly two mutually exclusive outcomes.',
      'Probability of success p remains constant.'
    ],
    wifiApplication: 'Models whether a single device connection authentication succeeds (1) or fails (0).',
    workedExample: 'If authentication success probability p = 0.85: q = 0.15. Mean mu = 0.85, Variance = 0.85 * 0.15 = 0.1275, SD = sqrt(0.1275) = 0.357.',
    datasetConnection: 'Network connection success state'
  },
  {
    id: 'dist-binomial',
    title: 'Binomial Distribution',
    section: 'B',
    sectionLabel: 'Section B: Probability Distributions',
    formula: 'B(n, p) = P(X = x) = \\begin{cases} {}^nC_x p^x q^{n-x} & x = 0, 1, 2, \\dots, n \\\\ 0 & \\text{Otherwise} \\end{cases}',
    whatItCalculates: 'Calculates the probability of observing exactly x successes in n independent Bernoulli trials.',
    variables: [
      { symbol: 'n', meaning: 'Number of independent trials (degree of the binomial distribution)' },
      { symbol: 'p', meaning: 'Probability of success on each trial' },
      { symbol: 'q', meaning: 'Probability of failure: q = 1 - p' },
      { symbol: '{}^nC_x', meaning: 'Combinations formula: n! / (x! (n - x)!)' },
      { symbol: '\\mu', meaning: 'Mean: mu = np' },
      { symbol: 'v(X)', meaning: 'Variance: v(X) = np(1 - p) = npq' },
      { symbol: '\\sigma', meaning: 'Standard deviation: sigma = sqrt(npq)' },
    ],
    conditions: [
      'Number of trials n is fixed and independent.',
      'Each trial has only two outcomes: success or failure.',
      'Probability of success p is identical for all trials.'
    ],
    wifiApplication: 'Models how many client devices successfully receive packets without collision in a batch of n transmissions.',
    workedExample: 'In n = 10 questions with p = 1/2: P(X >= 6) = (1/2^10) * (210 + 120 + 45 + 10 + 1) = 386 / 1024 = 0.377. Mean = 10(0.5) = 5, Var = 10(0.5)(0.5) = 2.5.',
    datasetConnection: 'Active_Users'
  },
  {
    id: 'dist-poisson',
    title: 'Poisson Distribution',
    section: 'B',
    sectionLabel: 'Section B: Probability Distributions',
    formula: 'p(x, \\lambda) = P(X = x) = \\begin{cases} \\frac{e^{-\\lambda} \\lambda^x}{x!} & x = 0, 1, 2, \\dots; \\quad \\lambda > 0 \\\\ 0 & \\text{Otherwise} \\end{cases}',
    whatItCalculates: 'Calculates probability of x event occurrences in a specified interval with constant average rate lambda.',
    variables: [
      { symbol: '\\lambda', meaning: 'Parameter of Poisson distribution (average occurrence rate > 0)' },
      { symbol: 'x', meaning: 'Number of observed occurrences (x = 0, 1, 2, ...)' },
      { symbol: 'e', meaning: 'Euler constant: e = 2.71828' },
      { symbol: '\\mu', meaning: 'Mean: mu = lambda' },
      { symbol: 'v(X)', meaning: 'Variance: v(X) = lambda (Mean = Variance)' },
      { symbol: '\\sigma', meaning: 'Standard deviation: sigma = sqrt(lambda)' },
    ],
    conditions: [
      'Events occur independently.',
      'Approximation of Binomial: when n is large and p is close to 0, lambda = np.',
      'Note: This is the discrete Poisson distribution (distinct from continuous stochastic Poisson process).'
    ],
    wifiApplication: 'Models the discrete arrival count of new device connection requests per 10-minute observation window.',
    workedExample: 'If lambda = 0.5: P(X >= 1) = 1 - P(X = 0) = 1 - (e^{-0.5} * 0.5^0 / 0!) = 1 - e^{-0.5} = 1 - 0.6065 = 0.393.',
    datasetConnection: 'New_Connections_Per_10min'
  },
  {
    id: 'dist-normal',
    title: 'Normal (Gaussian) Distribution',
    section: 'B',
    sectionLabel: 'Section B: Probability Distributions',
    formula: 'f(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}, \\quad -\\infty < x < \\infty, \\sigma > 0; \\qquad Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1)',
    whatItCalculates: 'Continuous symmetric bell-shaped distribution defined by mean mu and standard deviation sigma.',
    variables: [
      { symbol: '\\mu', meaning: 'Mean = E[X] (location of symmetric bell peak)' },
      { symbol: '\\sigma^2', meaning: 'Variance = Var(X) (controls bell spread)' },
      { symbol: 'Z', meaning: 'Standard normal variate with mean 0 and variance 1' },
      { symbol: '\\Phi(a)', meaning: 'Tail-area function: P(0 <= Z <= a) = (1/sqrt(2pi)) int_0^a e^{-z^2/2} dz' },
    ],
    conditions: [
      'Symmetric bell curve about x = mu.',
      'Line x = mu splits unit total area into two equal halves of 0.5 each.',
      'P(Z < a) = 0.5 + Phi(a) (for a > 0) and P(Z > a) = 0.5 - Phi(a) (for a > 0).'
    ],
    wifiApplication: 'Models high-density aggregate campus Wi-Fi load and continuous bandwidth utilization percentage.',
    workedExample: 'Given mu = 70, sigma = 5: for x = 65, z = (65-70)/5 = -1.0. P(X < 65) = P(Z < -1) = 0.5 - Phi(1) = 0.5 - 0.3413 = 0.1587.',
    datasetConnection: 'Active_Users, Bandwidth_Utilization_Percent'
  },

  // ==================================================
  // SECTION C: HYPOTHESIS TESTING AND DECISION MAKING
  // ==================================================
  {
    id: 'hyp-framework-errors',
    title: 'Hypothesis Framework & Types of Error',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: '\\alpha = P(\\text{Type I error}) = P(\\text{Reject } H_0 \\mid H_0 \\text{ is true}) = P(X \\in S_R), \\quad \\beta = P(\\text{Type II error}) = P(X \\in S_A \\mid H_0 \\text{ is false})',
    whatItCalculates: 'Formal error bounds in statistical decision-making between null (H0) and alternative (H1) hypotheses.',
    variables: [
      { symbol: 'H_0', meaning: 'Null hypothesis: tested for possible rejection under assumption of truth' },
      { symbol: 'H_1', meaning: 'Alternative hypothesis' },
      { symbol: '\\alpha', meaning: 'Level of significance: maximum allowable probability of Type I error (e.g. 5%, 1%)' },
      { symbol: '\\beta', meaning: 'Type II error probability: failing to reject H0 when false' },
      { symbol: 'S_R, S_A', meaning: 'Critical (rejection) region S_R and Acceptance region S_A' },
    ],
    conditions: [
      'Simple hypothesis completely specifies distribution (e.g. H0: mu=0, sigma=1).',
      'Composite hypothesis does not completely specify distribution (e.g. H0: mu=0, sigma unknown).',
      'Level of significance alpha is always fixed in advance before collecting sample information.'
    ],
    wifiApplication: 'H0: Access point operational load is nominal vs H1: Access point is congested. Type I error = false alert.',
    workedExample: 'Decision table: When H0 is true, rejecting H0 is Type I error (alpha); failing to reject H0 is correct decision (1 - alpha).',
    datasetConnection: 'Network_State'
  },
  {
    id: 'hyp-pvalue-rule',
    title: 'p-Value and Decision Rule',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: '\\text{If } p\\text{-value} \\le \\alpha \\implies \\text{Reject } H_0, \\qquad \\text{If } p\\text{-value} > \\alpha \\implies \\text{Do not reject } H_0',
    whatItCalculates: 'Determines statistical rejection using the smallest significance level for which H0 can be rejected.',
    variables: [
      { symbol: 'p\\text{-value}', meaning: 'Smallest level of significance for which observed test statistic rejects H0' },
      { symbol: '\\alpha', meaning: 'Prespecified level of significance threshold' },
    ],
    conditions: [
      'The p-value is NOT: the probability H0 is true, nor probability of committing Type I error, nor probability sample is chance alone.',
      'A smaller p-value provides stronger quantitative evidence against H0.'
    ],
    wifiApplication: 'Decides whether active user surges across class breaks represent statistically significant traffic shifts.',
    workedExample: 'If calculated p-value = 0.0179 and alpha = 0.05: since 0.0179 < 0.05, reject H0 at the 5% level of significance.',
    datasetConnection: 'Active_Users'
  },
  {
    id: 'hyp-clt-critical',
    title: 'Central Limit Theorem & Directional Critical Regions',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: 'Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\xrightarrow{d} N(0, 1), \\qquad P(|Z| > z_\\alpha) = \\alpha \\implies P(Z > z_\\alpha) = \\frac{\\alpha}{2}',
    whatItCalculates: 'Standardizes sample mean into standard normal variate and partitions critical rejection regions.',
    variables: [
      { symbol: '\\bar{X}', meaning: 'Sample mean of independent random sample' },
      { symbol: '\\mu, \\sigma', meaning: 'Population mean and standard deviation' },
      { symbol: 'n', meaning: 'Sample size (n > 30 for large sample normal convergence)' },
      { symbol: 'z_\\alpha', meaning: 'Critical value separating rejection and acceptance regions' },
    ],
    conditions: [
      'Two-tailed critical values |z_alpha|: 2.58 (1%), 1.96 (5%), 1.645 (10%).',
      'Right-tailed critical values z_alpha: 2.33 (1%), 1.645 (5%), 1.28 (10%).',
      'Left-tailed critical values -z_alpha: -2.33 (1%), -1.645 (5%), -1.28 (10%).',
      'If |Z| > 3, H0 is always rejected.'
    ],
    wifiApplication: 'Establishes critical z thresholds for detecting abnormally heavy university Wi-Fi load periods.',
    workedExample: 'For large sample n = 49, standard error sigma/sqrt(n) = 10/7 = 1.4286. Two-tailed 5% critical cutoff is |z| = 1.96.',
    datasetConnection: 'Active_Users'
  },
  {
    id: 'hyp-ztest-mean',
    title: 'Z-Test on a Single Mean (Variance Known)',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: 'z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}}, \\qquad \\text{Reject } H_0 \\text{ if } z > z_{\\alpha/2} \\text{ or } z < -z_{\\alpha/2}',
    whatItCalculates: 'Tests hypothesis H0: mu = mu0 against H1: mu != mu0 when population variance sigma^2 is known.',
    variables: [
      { symbol: '\\bar{x}', meaning: 'Computed sample mean' },
      { symbol: '\\mu_0', meaning: 'Hypothesized population mean under H0' },
      { symbol: '\\sigma', meaning: 'Known population standard deviation' },
      { symbol: 'n', meaning: 'Sample size' },
    ],
    conditions: [
      'Random sample drawn from population with mean mu and known variance sigma^2 > 0.',
      'Sample size sufficiently large or underlying population normally distributed.',
      'Non-rejection region: P(-z_{alpha/2} < (bar{x} - mu_0)/(sigma/sqrt(n)) < z_{alpha/2}) = 1 - alpha.'
    ],
    wifiApplication: 'Tests whether daily mean active users equals historical target mu0 = 100 with known network load sigma = 10.',
    workedExample: 'Sample n = 49, bar{x} = 103, mu0 = 100, sigma = 10: z = (103 - 100)/(10/sqrt(49)) = 3 / 1.4286 = 2.10. Since 2.10 > 1.645, reject H0 (right-tailed at alpha=0.05).',
    datasetConnection: 'Active_Users'
  },
  {
    id: 'hyp-ttest-mean',
    title: 't-Test on a Single Sample (Variance Unknown)',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: 't = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}} \\quad \\text{with } df = n - 1, \\qquad s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n - 1}}',
    whatItCalculates: 'Tests hypothesis on population mean when population variance is unknown and estimated by sample variance s^2.',
    variables: [
      { symbol: 't', meaning: 'Student t-test statistic distributed with n - 1 degrees of freedom' },
      { symbol: 's', meaning: 'Sample standard deviation' },
      { symbol: 'df', meaning: 'Degrees of freedom: df = n - 1' },
      { symbol: 't_{\\alpha/2, n-1}', meaning: 'Critical t-value from Student t-distribution table' },
    ],
    conditions: [
      'Random sample from normal distribution with unknown mean mu and variance sigma^2 > 0.',
      'Variable sqrt(n)(bar{x} - mu)/s follows Student t-distribution with n - 1 degrees of freedom.',
      'Reject H0 at level alpha if |t| > t_{alpha/2, n-1} (two-sided).'
    ],
    wifiApplication: 'Tests small sample average user counts on specific departmental AP routers where population variance is unknown.',
    workedExample: 'Sample n = 12, bar{x} = 42, mu0 = 46, s = 11.9: t = (42 - 46)/(11.9/sqrt(12)) = -1.16 with df = 11. Critical t_{0.05, 11} = -1.796. Since -1.16 > -1.796, fail to reject H0.',
    datasetConnection: 'Active_Users'
  },
  {
    id: 'hyp-single-proportion',
    title: 'Test of Hypothesis for Single Population Proportion',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: 'z = \\frac{p - P_0}{\\sqrt{\\frac{P_0(1 - P_0)}{n}}} \\sim N(0, 1), \\qquad p = \\frac{X}{n} \\le 1',
    whatItCalculates: 'Tests claim H0: P = P0 (or P <= P0) regarding the proportion of elements possessing a certain attribute.',
    variables: [
      { symbol: 'p', meaning: 'Sample proportion: X / n' },
      { symbol: 'X', meaning: 'Observed number of successes possessing the attribute' },
      { symbol: 'P_0', meaning: 'Hypothesized population proportion' },
      { symbol: 'n', meaning: 'Sample size' },
    ],
    conditions: [
      'Normality conditions: n P0 > 15 and n(1 - P0) > 15.',
      'Standard normal test statistic under the null hypothesis.'
    ],
    wifiApplication: 'Tests whether the proportion of severely congested intervals exceeds baseline threshold P0 = 0.10.',
    workedExample: 'Sample n = 200, X = 182, p = 0.91, P0 = 0.85: z = (0.91 - 0.85)/sqrt(0.85 * 0.15 / 200) = 0.06 / 0.0252 = 2.38. Since 2.38 > 1.645, reject H0 at alpha = 0.05.',
    datasetConnection: 'Network_State proportion'
  },
  {
    id: 'hyp-two-proportions',
    title: 'Hypothesis Testing for Comparing Two Population Proportions',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: 'z = \\frac{p_1 - p_2}{\\sqrt{\\hat{P}(1 - \\hat{P})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}}, \\qquad \\hat{P} = \\frac{n_1 p_1 + n_2 p_2}{n_1 + n_2} = \\frac{X_1 + X_2}{n_1 + n_2}',
    whatItCalculates: 'Tests equality H0: P1 = P2 between two independent population proportions.',
    variables: [
      { symbol: 'p_1, p_2', meaning: 'Sample proportions: X_1 / n_1 and X_2 / n_2' },
      { symbol: '\\hat{P}', meaning: 'Pooled sample proportion estimator' },
      { symbol: 'n_1, n_2', meaning: 'Sample sizes of group 1 and group 2' },
    ],
    conditions: [
      'Normality conditions: n1 p1 > 15, n1(1 - p1) > 15, and n2 p2 > 15, n2(1 - p2) > 15.',
      'Under H0: P1 = P2 = P, difference (p1 - p2) converges to normal with mean 0.'
    ],
    wifiApplication: 'Compares the proportion of congested intervals between Weekday periods and Weekend periods.',
    workedExample: 'n1 = 352, X1 = 143 (p1 = 0.41); n2 = 417, X2 = 209 (p2 = 0.50). Pooled P_hat = 352/769 = 0.46. z = -2.5. At alpha=0.05, -2.5 < -1.645, reject H0.',
    datasetConnection: 'Day, Network_State'
  },
  {
    id: 'hyp-ftest-variances',
    title: 'Test for Equality of Two Variances (F-Test)',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: 'F = \\frac{\\text{Larger Sample Variance}}{\\text{Smaller Sample Variance}} = \\frac{s_1^2}{s_2^2} \\quad (s_1^2 > s_2^2), \\qquad s^2 = \\frac{\\sum x^2 - (\\sum x)^2/n}{n - 1}',
    whatItCalculates: 'Tests null hypothesis H0: sigma_1^2 = sigma_2^2 of equal variances across two independent normal populations.',
    variables: [
      { symbol: 's_1^2', meaning: 'Larger sample variance (numerator)' },
      { symbol: 's_2^2', meaning: 'Smaller sample variance (denominator)' },
      { symbol: 'd_1', meaning: 'Numerator degrees of freedom: d1 = n1 - 1' },
      { symbol: 'd_2', meaning: 'Denominator degrees of freedom: d2 = n2 - 1' },
    ],
    conditions: [
      'Two independent random samples drawn from normally distributed populations.',
      'Ratio X = (U1 / d1) / (U2 / d2) where U1, U2 are independent chi-square variables follows F-distribution.',
      'Reject H0 if F_calculated > F_critical from F-distribution table.'
    ],
    wifiApplication: 'Tests whether active user variance differs significantly between weekday peak hours and weekend hours.',
    workedExample: 'Machine A: n1 = 12, s1^2 = 36; Machine B: n2 = 10, s2^2 = 16. d1 = 11, d2 = 9. F = 36/16 = 2.25. Table F_{0.025}(11,9) = 4.03. Since 2.25 < 4.03, fail to reject H0.',
    datasetConnection: 'Day, Active_Users'
  },
  {
    id: 'hyp-oneway-anova',
    title: 'One-Way Analysis of Variance (One-Way ANOVA)',
    section: 'C',
    sectionLabel: 'Section C: Hypothesis Testing & Decision Making',
    formula: 'F = \\frac{MSC}{MSE} = \\frac{SSC / (C - 1)}{SSE / (N - C)}, \\qquad C.F. = \\frac{T^2}{N}, \\quad SST = \\sum X^2 - C.F., \\quad SSE = SST - SSC',
    whatItCalculates: 'Tests equality of three or more population means: H0: mu_1 = mu_2 = ... = mu_k without inflating Type I error.',
    variables: [
      { symbol: 'T', meaning: 'Grand total sum of all observations: sum X1 + sum X2 + ... + sum Xk' },
      { symbol: 'C.F.', meaning: 'Correction factor: T^2 / N' },
      { symbol: 'SST', meaning: 'Total sum of squares with df = N - 1' },
      { symbol: 'SSC', meaning: 'Sum of squares between samples (treatments): sum (sum X_i)^2 / n_i - C.F., df1 = C - 1' },
      { symbol: 'SSE', meaning: 'Sum of squares within samples (errors): SST - SSC, df2 = N - C' },
      { symbol: 'MSC, MSE', meaning: 'Mean squares between (SSC/df1) and within (SSE/df2)' },
    ],
    conditions: [
      'Samples are randomly selected and independent.',
      'Each population is normally distributed.',
      'Population variances are equal (homogeneity of variance).'
    ],
    wifiApplication: 'Tests whether average Wi-Fi user load differs significantly across 8 distinct daily observation hours.',
    workedExample: '12 observations across 3 groups (n_i = 4): T = 116, C.F. = 1121.33, SST = 118.67, SSC = 32.67, SSE = 86. df1 = 2, df2 = 9. MSC = 16.33, MSE = 9.55, F = 1.71 < F_{0.05}(2,9) = 4.26 -> Fail to reject H0.',
    datasetConnection: 'Hour, Active_Users'
  },

  // ==========================================
  // SECTION D: CHI-SQUARE TEST
  // ==========================================
  {
    id: 'chi-distribution-pdf',
    title: 'Chi-Square Distribution Density Function',
    section: 'D',
    sectionLabel: 'Section D: Chi-Square Test',
    formula: 'f(\\chi^2) = c (\\chi^2)^{(\\nu/2) - 1} e^{-\\chi^2/2}, \\qquad \\nu = n - k',
    whatItCalculates: 'Continuous sampling distribution of the chi-square statistic for large sample sizes.',
    variables: [
      { symbol: '\\nu', meaning: 'Degrees of freedom: n - k, where k is number of independent constraints' },
      { symbol: 'e', meaning: 'Euler constant: 2.71828' },
      { symbol: 'c', meaning: 'Constant depending only on degrees of freedom nu' },
    ],
    conditions: [
      'Degrees of freedom rule: df = n - 1 for series of numbers.',
      'Fitting Binomial distribution: df = n - 1 (1 parameter estimated).',
      'Fitting Poisson distribution: df = n - 2 (mean lambda estimated).',
      'Fitting Normal distribution: df = n - 3 (mean and standard deviation estimated).'
    ],
    wifiApplication: 'Provides theoretical reference curves for goodness-of-fit testing of Wi-Fi traffic distributions.',
    workedExample: 'When testing Poisson arrival fit with 7 classes and estimated lambda, df = 7 - 1 - 1 = 5 (or after class pooling).',
    datasetConnection: 'New_Connections_Per_10min'
  },
  {
    id: 'chi-goodness-of-fit',
    title: 'Chi-Square Goodness-of-Fit Test',
    section: 'D',
    sectionLabel: 'Section D: Chi-Square Test',
    formula: '\\chi^2 = \\sum_{i=1}^n \\frac{(O_i - E_i)^2}{E_i}, \\qquad df = n - 1',
    whatItCalculates: 'Measures magnitude of discrepancy between observed experimental frequencies and theoretical frequencies.',
    variables: [
      { symbol: 'O_i', meaning: 'Observed frequency in class i' },
      { symbol: 'E_i', meaning: 'Expected (theoretical or hypothetical) frequency in class i' },
      { symbol: 'N', meaning: 'Total frequency: sum O_i = sum E_i = N' },
      { symbol: 'df', meaning: 'Degrees of freedom: n - 1 (less constraints)' },
    ],
    conditions: [
      'Sample observations must be independent.',
      'Linear constraints: sum O_i = sum E_i = N.',
      'Total sample size N should be reasonably large (N >= 50).',
      'No theoretical cell frequency should be small (minimum E_i >= 5, 10 is better; group small adjacent classes).',
      'Yates correction: if any theoretical frequency is < 5, add 0.5 to small cells.',
      'Decision: If chi^2_calc < chi^2_table, fit is good (accept H0); if chi^2_calc > chi^2_table, fit is poor (reject H0).'
    ],
    wifiApplication: 'Tests whether daily active user occurrences are uniformly distributed across days of the week.',
    workedExample: 'Industry accidents over 6 days (N = 84, E_i = 14 each): sum (O_i - E_i)^2 = 30. chi^2 = 30/14 = 2.143. df = 6 - 1 = 5. Table chi^2_{0.05, 5} = 11.07. Since 2.143 < 11.07, fail to reject H0 (good uniform fit).',
    datasetConnection: 'Day, Network_State'
  },
  {
    id: 'chi-independence-test',
    title: 'Chi-Square Test for Independence of Attributes',
    section: 'D',
    sectionLabel: 'Section D: Chi-Square Test',
    formula: '\\chi^2 = \\sum_{i=1}^n \\frac{(O_i - E_i)^2}{E_i}, \\qquad E_{ij} = \\frac{(\\text{Row } i \\text{ sum}) \\times (\\text{Column } j \\text{ sum})}{\\text{Grand total } n}, \\quad df = (r - 1)(c - 1)',
    whatItCalculates: 'Investigates whether two categorical attributes in an r x c contingency table are independent or associated.',
    variables: [
      { symbol: 'E_{ij}', meaning: 'Expected frequency for cell in row i and column j' },
      { symbol: 'r, c', meaning: 'Number of rows and number of columns in contingency table' },
      { symbol: 'df', meaning: 'Degrees of freedom: (r - 1)(c - 1)' },
    ],
    conditions: [
      'Null hypothesis H0: The two attributes are independent.',
      'Alternative hypothesis H1: The two attributes are not independent (associated).',
      'Reject H0 if chi^2 > chi^2_{alpha, df}.'
    ],
    wifiApplication: 'Tests whether Wi-Fi Network_State (Low, Med, High, Congested) is associated with Day (Weekday vs Weekend).',
    workedExample: '2x3 contingency table (n = 200, df = (2-1)(3-1) = 2): calculated chi^2 = 17.11. Critical table chi^2_{0.01, 2} = 9.21. Since 17.11 > 9.21, reject H0 (attributes are significantly associated).',
    datasetConnection: 'Day, Network_State'
  },

  // ==========================================
  // SECTION E: NON-PARAMETRIC TESTS
  // ==========================================
  {
    id: 'nonparam-overview',
    title: 'Parametric vs Non-Parametric Model Foundations',
    section: 'E',
    sectionLabel: 'Section E: Non-Parametric Tests',
    formula: '\\text{Parametric: } n \\ge 30, \\text{ Normality, Equal Var.} \\quad \\longleftrightarrow \\quad \\text{Non-Parametric: Distribution-free, Ranks/Counts}',
    whatItCalculates: 'Formal criteria distinguishing distribution-free rank/counting tests from parametric model frameworks.',
    variables: [
      { symbol: '\\text{Parametric}', meaning: 'Assumes specific distribution (normal), interval/ratio scale, n >= 30, equal variances' },
      { symbol: '\\text{Non-Parametric}', meaning: 'Distribution-free, nominal/ordinal/interval, small sample sizes (n < 30), ranking/counting based' },
    ],
    conditions: [
      'Sample should be selected randomly from the population.',
      'Each observation should be independent of the others.',
      'Sample should adequately represent the target population.',
      'Data should be nominal or ordinal.'
    ],
    wifiApplication: 'Used when Wi-Fi connection quality ratings or small-sample peak latency values violate normality assumptions.',
    workedExample: 'Comparing medians or ordered ranks across small campus trials without assuming normal underlying errors.',
    datasetConnection: 'Network_State ordered ranks'
  },
  {
    id: 'nonparam-run-test',
    title: 'The Run Test for Randomness (Wald-Wolfowitz Test)',
    section: 'E',
    sectionLabel: 'Section E: Non-Parametric Tests',
    formula: 'Z = \\frac{G - \\mu_G}{\\sigma_G} \\sim N(0, 1), \\qquad \\mu_G = \\frac{2n_1 n_2}{n_1 + n_2} + 1, \\quad \\sigma_G = \\sqrt{\\frac{(2n_1 n_2)(2n_1 n_2 - n_1 - n_2)}{(n_1 + n_2)^2(n_1 + n_2 - 1)}}',
    whatItCalculates: 'Tests whether sequence of observations occurs in random order or exhibits non-random clustering / alternation.',
    variables: [
      { symbol: 'G', meaning: 'Observed number of runs (sequence of like elements surrounded by unlike elements)' },
      { symbol: 'n_1, n_2', meaning: 'Counts of elements with characteristic 1 and characteristic 2' },
      { symbol: '\\mu_G', meaning: 'Expected mean number of runs under randomness H0' },
      { symbol: '\\sigma_G', meaning: 'Standard deviation of number of runs' },
    ],
    conditions: [
      'Small Samples (n1 <= 20 and n2 <= 20, alpha = 0.05): Test statistic is G; reject H0 if G <= lower critical or G >= upper critical from table.',
      'Large Samples (n1 > 20 or n2 > 20 or alpha != 0.05): Use normal approximation Z-test. Reject H0 if z <= -z_{alpha/2} or z >= z_{alpha/2}.'
    ],
    wifiApplication: 'Tests whether sequence of Congested vs Normal network states occurs randomly over time or in bursts/clusters.',
    workedExample: 'Sequence with n1 = 28, n2 = 22, G = 12 runs: mu_G = 2(28)(22)/50 + 1 = 25.64, sigma_G = 3.448. Z = (12 - 25.64)/3.448 = -3.96. Since -3.96 < -1.96, reject H0 (sequence is not random).',
    datasetConnection: 'Network_State chronological sequence'
  },
  {
    id: 'nonparam-wilcoxon-test',
    title: 'Wilcoxon Signed-Rank Test',
    section: 'E',
    sectionLabel: 'Section E: Non-Parametric Tests',
    formula: 'W_s = \\min(|T^+|, |T^-|), \\qquad Z = \\frac{W_s - \\frac{n(n + 1)}{4}}{\\sqrt{\\frac{n(n + 1)(2n + 1)}{24}}} \\quad (n > 30)',
    whatItCalculates: 'Nonparametric test for two dependent/paired samples considering differences in magnitude using signed ranks.',
    variables: [
      { symbol: 'D = X_B - X_A', meaning: 'Paired difference between before (XB) and after (XA) observations' },
      { symbol: 'n', meaning: 'Number of pairs where difference D != 0' },
      { symbol: 'T^+, T^-', meaning: 'Sum of positive ranks and sum of negative ranks' },
      { symbol: 'W_s', meaning: 'Test statistic: smaller of absolute values of rank sums min(|T^+|, |T^-|)' },
    ],
    conditions: [
      'Paired data obtained from a random sample.',
      'Population of differences has an approximately symmetric distribution.',
      'Small samples (n <= 30): Reject H0 if W_s <= critical value from Wilcoxon table.',
      'Large samples (n > 30): Use standard normal approximation Z-statistic.'
    ],
    wifiApplication: 'Tests whether router reconfiguration significantly reduces active user load by comparing paired before/after measurements.',
    workedExample: 'Sample n = 7 pairs: positive rank sum T+ = 25, negative rank sum T- = -3. W_s = |-3| = 3. At alpha = 0.05 (critical value = 2): since 3 > 2, fail to reject H0.',
    datasetConnection: 'Active_Users paired comparisons'
  },
];
