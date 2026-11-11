function stats = data_analysis(activeUsers)
% DATA_ANALYSIS Calculates descriptive statistics for Wi-Fi active users
% Module I: Random Variables & Descriptive Statistics
% ASSP Project - College Wi-Fi Load & Congestion Prediction System

    n = length(activeUsers);
    if n == 0
        error('Data vector is empty.');
    end

    % Mean: \bar{x} = \sum x / n
    meanVal = sum(activeUsers) / n;

    % Median
    sorted = sort(activeUsers);
    if mod(n, 2) == 1
        medianVal = sorted((n + 1) / 2);
    else
        medianVal = (sorted(n/2) + sorted(n/2 + 1)) / 2;
    end

    % Mode (using frequency table)
    [uVals, ~, idx] = unique(sorted);
    counts = accumarray(idx, 1);
    [maxCount, maxIdx] = max(counts);
    modeVal = uVals(maxIdx);

    % Sample Variance: s^2 = \sum (x - \bar{x})^2 / (n - 1)
    varVal = sum((activeUsers - meanVal).^2) / (n - 1);

    % Sample Standard Deviation: s = \sqrt{s^2}
    stdVal = sqrt(varVal);

    % Min, Max, Range
    minVal = sorted(1);
    maxVal = sorted(end);
    rangeVal = maxVal - minVal;

    % Quartiles (method: linear interpolation / percentiles)
    q1 = sorted(max(1, round(0.25 * n)));
    q3 = sorted(min(n, round(0.75 * n)));
    iqrVal = q3 - q1;

    % Package results in struct
    stats.count = n;
    stats.mean = meanVal;
    stats.median = medianVal;
    stats.mode = modeVal;
    stats.variance = varVal;
    stats.std = stdVal;
    stats.min = minVal;
    stats.max = maxVal;
    stats.range = rangeVal;
    stats.q1 = q1;
    stats.q3 = q3;
    stats.iqr = iqrVal;

    fprintf('--- MODULE I: DESCRIPTIVE STATISTICS ---\n');
    fprintf('Count:               %d\n', n);
    fprintf('Mean Active Users:   %.4f\n', meanVal);
    fprintf('Median Active Users: %.4f\n', medianVal);
    fprintf('Mode Active Users:   %.4f\n', modeVal);
    fprintf('Sample Variance:     %.4f\n', varVal);
    fprintf('Sample Std Dev:      %.4f\n', stdVal);
    fprintf('Min / Max / Range:   %d / %d / %d\n', minVal, maxVal, rangeVal);
    fprintf('Q1 / Q3 / IQR:       %.2f / %.2f / %.2f\n\n', q1, q3, iqrVal);
end
