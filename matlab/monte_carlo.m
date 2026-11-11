function mcSimRes = monte_carlo(P, initialStateIdx, numSteps, numSims)
% MONTE_CARLO Simulates Markov chain trajectories to estimate future congestion probability
% P: 4x4 transition probability matrix
% initialStateIdx: 1 (Low), 2 (Medium), 3 (High), 4 (Congested)
% numSteps: number of future time transitions to simulate (horizon)
% numSims: number of Monte Carlo realization paths

    if nargin < 2 || isempty(initialStateIdx)
        initialStateIdx = 2; % default Medium
    end
    if nargin < 3 || isempty(numSteps)
        numSteps = 3;
    end
    if nargin < 4 || isempty(numSims)
        numSims = 2000;
    end

    rng(101); % Seed for reproducible simulation
    finalStates = zeros(numSims, 1);
    congestedCount = 0;
    convergenceHistory = zeros(numSims, 1);

    for s = 1:numSims
        curr = initialStateIdx;
        for t = 1:numSteps
            rowProb = P(curr, :);
            if sum(rowProb) == 0
                % absorbing or dead-end, stay
                break;
            end
            % Draw next state according to row cumulative distribution
            u = rand();
            cumP = cumsum(rowProb);
            nextState = find(cumP >= u, 1, 'first');
            if isempty(nextState)
                nextState = curr;
            end
            curr = nextState;
        end
        finalStates(s) = curr;
        if curr == 4 % 4 = Congested
            congestedCount = congestedCount + 1;
        end
        convergenceHistory(s) = congestedCount / s;
    end

    finalDist = zeros(1, 4);
    for i = 1:4
        finalDist(i) = sum(finalStates == i) / numSims;
    end
    congestionProb = finalDist(4);

    mcSimRes.numSims = numSims;
    mcSimRes.numSteps = numSteps;
    mcSimRes.initialState = initialStateIdx;
    mcSimRes.finalDist = finalDist;
    mcSimRes.congestedCount = congestedCount;
    mcSimRes.congestionProb = congestionProb;
    mcSimRes.convergence = convergenceHistory;

    fprintf('--- MODULE V: MONTE CARLO CONGESTION SIMULATION ---\n');
    fprintf('Initial State:              %d\n', initialStateIdx);
    fprintf('Horizon (Steps):            %d\n', numSteps);
    fprintf('Simulations Run:            %d\n', numSims);
    fprintf('Congested Outcomes:         %d\n', congestedCount);
    fprintf('Estimated Congestion Prob:  %.4f (%.2f%%)\n', congestionProb, congestionProb * 100);
    fprintf('Final Distribution [L,M,H,C]: [%.3f, %.3f, %.3f, %.3f]\n\n', ...
        finalDist(1), finalDist(2), finalDist(3), finalDist(4));
end
