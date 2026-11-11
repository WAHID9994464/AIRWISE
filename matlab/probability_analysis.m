function probStats = probability_analysis(states)
% PROBABILITY_ANALYSIS Calculates empirical PMF, CDF, expected value, and variance
% for discrete network state random variables.
% States: Low (1), Medium (2), High (3), Congested (4)

    stateNames = {'Low', 'Medium', 'High', 'Congested'};
    n = length(states);

    counts = zeros(1, 4);
    for i = 1:4
        counts(i) = sum(strcmp(states, stateNames{i}));
    end

    pmf = counts / n;
    cdf = cumsum(pmf);

    % Numerical mapping: Low=1, Medium=2, High=3, Congested=4
    x = 1:4;
    expectedVal = sum(x .* pmf);
    varianceVal = sum(((x - expectedVal).^2) .* pmf);

    probStats.stateNames = stateNames;
    probStats.counts = counts;
    probStats.pmf = pmf;
    probStats.cdf = cdf;
    probStats.expectedVal = expectedVal;
    probStats.varianceVal = varianceVal;
    probStats.congestionProb = pmf(4); % Congested is state 4

    fprintf('--- MODULE I/PROBABILITY: EMPIRICAL DISTRIBUTION ---\n');
    for i = 1:4
        fprintf('  State %-9s: Count = %2d | P(X=x) = %.4f | CDF = %.4f\n', ...
            stateNames{i}, counts(i), pmf(i), cdf(i));
    end
    fprintf('Expected State Score (1=Low..4=Cong): %.4f\n', expectedVal);
    fprintf('Variance of State Score:              %.4f\n', varianceVal);
    fprintf('Congestion Probability P(Congested):  %.4f\n\n', probStats.congestionProb);
end
