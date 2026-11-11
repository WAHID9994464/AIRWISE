function poisRes = poisson_process(arrivals, targetK, numSims)
% POISSON_PROCESS Models Wi-Fi connection arrival counts in 10-minute intervals
% Formula: P(X = k) = (e^{-\lambda} * \lambda^k) / k!
% Evaluates theoretical probabilities and generates synthetic arrivals.

    if nargin < 2 || isempty(targetK)
        targetK = 20;
    end
    if nargin < 3 || isempty(numSims)
        numSims = 1000;
    end

    % Empirical mean arrival rate per 10min interval
    lambdaVal = mean(arrivals);

    % Theoretical distribution from k=0 to max(targetK*2, 40)
    maxK = max(ceil(targetK * 1.8), 40);
    kRange = 0:maxK;
    theoreticalP = zeros(size(kRange));

    for i = 1:length(kRange)
        k = kRange(i);
        % Use log-gamma to avoid factorial overflow for larger k: log(k!) = gammaln(k+1)
        logP = -lambdaVal + k * log(lambdaVal) - gammaln(k + 1);
        theoreticalP(i) = exp(logP);
    end

    % Target k probability
    logTargetP = -lambdaVal + targetK * log(lambdaVal) - gammaln(targetK + 1);
    targetProb = exp(logTargetP);

    % Simulated arrivals via inverse transform / Poisson random generation
    rng(42); % Fixed seed for reproducibility
    simArrivals = zeros(numSims, 1);
    cumP = cumsum(theoreticalP);
    for s = 1:numSims
        u = rand();
        idx = find(cumP >= u, 1, 'first');
        if isempty(idx)
            simArrivals(s) = maxK;
        else
            simArrivals(s) = kRange(idx);
        end
    end

    simMean = mean(simArrivals);
    simVar = var(simArrivals);

    poisRes.lambda = lambdaVal;
    poisRes.targetK = targetK;
    poisRes.targetProb = targetProb;
    poisRes.kRange = kRange;
    poisRes.theoreticalP = theoreticalP;
    poisRes.simArrivals = simArrivals;
    poisRes.simMean = simMean;
    poisRes.simVar = simVar;

    fprintf('--- MODULE V: POISSON PROCESS MODELING ---\n');
    fprintf('Empirical Arrival Rate (lambda): %.4f arrivals / 10-min interval\n', lambdaVal);
    fprintf('Theoretical P(X = %d):          %.6f (%.2f%%)\n', targetK, targetProb, targetProb * 100);
    fprintf('Monte Carlo Simulated Mean:      %.4f\n', simMean);
    fprintf('Monte Carlo Simulated Variance:  %.4f (Theoretical = %.4f)\n\n', simVar, lambdaVal);
end
