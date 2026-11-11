function predRes = congestion_prediction(activeUsers, bandwidth, P, currentStateIdx)
% CONGESTION_PREDICTION Multi-model prediction framework
% 1. Historical moving average / trend
% 2. Linear regression model
% 3. Markov chain next-step transition probability
% 4. Monte Carlo stochastic simulation

    if nargin < 4 || isempty(currentStateIdx)
        currentStateIdx = 2; % default Medium
    end

    n = length(activeUsers);

    % 1. Historical Moving Trend (last 3 points average)
    window = min(3, n);
    trendActive = mean(activeUsers(end-window+1:end));

    % 2. Linear Regression Bandwidth Projection
    x_mean = mean(activeUsers);
    y_mean = mean(bandwidth);
    b = sum((activeUsers - x_mean) .* (bandwidth - y_mean)) / sum((activeUsers - x_mean).^2);
    a = y_mean - b * x_mean;
    projectedBandwidth = max(0, min(100, a + b * trendActive));

    % 3. Markov Next-Step Transition
    stateNames = {'Low', 'Medium', 'High', 'Congested'};
    nextStateProbs = P(currentStateIdx, :);
    [maxP, maxIdx] = max(nextStateProbs);
    predictedNextState = stateNames{maxIdx};
    markovCongestionProb = nextStateProbs(4);

    % Risk Category Classification
    if markovCongestionProb >= 0.50 || trendActive >= 145
        riskCategory = 'Critical';
    elseif markovCongestionProb >= 0.25 || trendActive >= 110
        riskCategory = 'High';
    elseif markovCongestionProb >= 0.10 || trendActive >= 60
        riskCategory = 'Moderate';
    else
        riskCategory = 'Low';
    end

    predRes.trendActive = trendActive;
    predRes.projectedBandwidth = projectedBandwidth;
    predRes.nextStateProbs = nextStateProbs;
    predRes.predictedNextState = predictedNextState;
    predRes.markovCongestionProb = markovCongestionProb;
    predRes.riskCategory = riskCategory;

    fprintf('--- CONGESTION PREDICTION MULTI-MODEL REPORT ---\n');
    fprintf('Trend Forecasted Active Users:   %.1f\n', trendActive);
    fprintf('OLS Projected Bandwidth Util:    %.2f%%\n', projectedBandwidth);
    fprintf('Predicted Most Likely State:     %s (P = %.2f%%)\n', predictedNextState, maxP * 100);
    fprintf('Congestion Probability:          %.4f\n', markovCongestionProb);
    fprintf('Assigned Congestion Risk Level:  %s\n\n', riskCategory);
end
