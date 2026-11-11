function chiRes = chi_square_analysis(states)
% CHI_SQUARE_ANALYSIS Goodness-of-fit test comparing observed network state
% frequencies against an expected equal distribution (or theoretical distribution).
% Formula: \chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}

    stateNames = {'Low', 'Medium', 'High', 'Congested'};
    k = length(stateNames);
    N = length(states);

    observed = zeros(1, k);
    for i = 1:k
        observed(i) = sum(strcmp(states, stateNames{i}));
    end

    % Null hypothesis: Network states are uniformly distributed across categories
    expected = ones(1, k) * (N / k);

    chi2_stat = sum(((observed - expected).^2) ./ expected);
    df = k - 1;

    % P-value computation via gammainc (base MATLAB regularized lower incomplete gamma)
    % For Chi2(df), CDF = gammainc(x/2, df/2), p_val = 1 - CDF
    p_val = 1 - gammainc(chi2_stat / 2, df / 2);

    alpha = 0.05;
    rejectH0 = (p_val < alpha);

    % Assumption check: Expected cell frequencies should be >= 5
    assumptionsMet = all(expected >= 5);

    chiRes.categories = stateNames;
    chiRes.observed = observed;
    chiRes.expected = expected;
    chiRes.chi2_stat = chi2_stat;
    chiRes.df = df;
    chiRes.p_val = p_val;
    chiRes.rejectH0 = rejectH0;
    chiRes.assumptionsMet = assumptionsMet;

    fprintf('--- MODULE III: CHI-SQUARE GOODNESS-OF-FIT ---\n');
    fprintf('H0: Network states follow a uniform distribution across all 4 categories\n');
    fprintf('H1: Network states deviate significantly from uniform distribution\n');
    for i = 1:k
        fprintf('  %-9s: Observed = %2d | Expected = %.2f\n', stateNames{i}, observed(i), expected(i));
    end
    fprintf('Chi-Square Statistic (chi^2): %.4f\n', chi2_stat);
    fprintf('Degrees of Freedom (df):     %d\n', df);
    fprintf('P-value:                     %.6f\n', p_val);
    fprintf('Expected cell check (E >= 5): %s\n', mat2str(assumptionsMet));
    if rejectH0
        fprintf('Decision: Reject H0 at alpha=%.2f (Observed distribution differs significantly from uniform)\n\n', alpha);
    else
        fprintf('Decision: Fail to reject H0 at alpha=%.2f (Observed distribution does not differ significantly)\n\n', alpha);
    end
end
