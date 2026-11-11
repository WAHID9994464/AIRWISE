function mcRes = markov_chain(states, days)
% MARKOV_CHAIN Constructs Discrete-Time Markov Chain (DTMC) transition probability matrix
% States: 1=Low, 2=Medium, 3=High, 4=Congested
% Respects chronological continuity within each day.

    stateNames = {'Low', 'Medium', 'High', 'Congested'};
    numStates = 4;

    % Map state strings to indices 1..4
    stateIdx = zeros(length(states), 1);
    for i = 1:numStates
        stateIdx(strcmp(states, stateNames{i})) = i;
    end

    counts = zeros(numStates, numStates);
    totalTransitions = 0;

    % Count consecutive chronological transitions within the same day
    for i = 1:(length(states) - 1)
        if strcmp(days{i}, days{i + 1})
            fromS = stateIdx(i);
            toS = stateIdx(i + 1);
            if fromS >= 1 && fromS <= 4 && toS >= 1 && toS <= 4
                counts(fromS, toS) = counts(fromS, toS) + 1;
                totalTransitions = totalTransitions + 1;
            end
        end
    end

    % Transition Probability Matrix P (row-normalized)
    P = zeros(numStates, numStates);
    rowSums = sum(counts, 2);
    validRows = false(numStates, 1);

    for r = 1:numStates
        if rowSums(r) > 0
            P(r, :) = counts(r, :) / rowSums(r);
            validRows(r) = true;
        else
            % If no transitions observed from this state, leave as zeros / mark unavailable
            P(r, :) = 0;
        end
    end

    % 2-step and 3-step transition matrices: P^2, P^3
    P2 = P * P;
    P3 = P2 * P;

    mcRes.stateNames = stateNames;
    mcRes.transitionCounts = counts;
    mcRes.P = P;
    mcRes.P2 = P2;
    mcRes.P3 = P3;
    mcRes.validRows = validRows;
    mcRes.totalTransitions = totalTransitions;

    fprintf('--- MODULE V: MARKOV CHAIN (DTMC) TRANSITIONS ---\n');
    fprintf('Total Valid Within-Day Transitions: %d\n', totalTransitions);
    fprintf('1-Step Transition Probability Matrix P:\n');
    fprintf('%-10s %-10s %-10s %-10s %-10s\n', 'From \ To', 'Low', 'Medium', 'High', 'Congested');
    for r = 1:numStates
        if validRows(r)
            fprintf('%-10s %-10.4f %-10.4f %-10.4f %-10.4f\n', ...
                stateNames{r}, P(r, 1), P(r, 2), P(r, 3), P(r, 4));
        else
            fprintf('%-10s (No transitions observed)\n', stateNames{r});
        end
    end
    fprintf('\n');
end
