%% MAIN.M - Central Execution Script for College Wi-Fi Load & Congestion Prediction
% Subject: Applied Statistics and Stochastic Processes (ASSP)
% Academic Software Prototype Companion Implementation

clc;
clear;
close all;

fprintf('=================================================================\n');
fprintf('  COLLEGE WI-FI LOAD & CONGESTION PREDICTION SYSTEM (ASSP)\n');
fprintf('  MATLAB Analytical Engine Execution\n');
fprintf('=================================================================\n\n');

%% 1. Load Dataset
dataFilePath = fullfile('..', 'data', 'wifi_sample_dataset.csv');
if ~exist(dataFilePath, 'file')
    error('Dataset file not found at: %s', dataFilePath);
end

fprintf('Loading shared dataset from: %s\n', dataFilePath);
opts = detectImportOptions(dataFilePath);
dataTable = readtable(dataFilePath, opts);

days = dataTable.Day;
hours = dataTable.Hour;
activeUsers = double(dataTable.Active_Users);
bandwidth = double(dataTable.Bandwidth_Utilization_Percent);
arrivals = double(dataTable.New_Connections_Per_10min);
states = cellstr(dataTable.Network_State);

N = height(dataTable);
fprintf('Successfully loaded %d observations across 7 days.\n\n', N);

%% 2. Run Module I: Descriptive Statistics
statsRes = data_analysis(activeUsers);

%% 3. Run Module I / Probability Analysis
probRes = probability_analysis(states);

%% 4. Run Module II: One-Way ANOVA across Hours
anovaRes = anova_analysis(activeUsers, hours);

%% 5. Run Module III: Chi-Square Goodness-of-Fit
chiRes = chi_square_analysis(states);

%% 6. Run Module IV: Correlation and Linear Regression
regRes = correlation_regression(activeUsers, bandwidth);

%% 7. Run Module V: Poisson Process
poisRes = poisson_process(arrivals, 20, 1000);

%% 8. Run Module V: Markov Chain (DTMC)
mcRes = markov_chain(states, days);

%% 9. Run Module V: Monte Carlo Congestion Simulation
mcSimRes = monte_carlo(mcRes.P, 2, 3, 2000);

%% 10. Run Congestion Prediction Multi-Model
predRes = congestion_prediction(activeUsers, bandwidth, mcRes.P, 2);

%% 11. Export Results to CSV for React Verification
resultsDir = fullfile('..', 'results');
if ~exist(resultsDir, 'dir')
    mkdir(resultsDir);
end
resultsFilePath = fullfile(resultsDir, 'matlab_results.csv');

% Prepare structured result records matching React verification keys
metricNames = {
    'Mean';
    'Variance';
    'Standard_Deviation';
    'Correlation';
    'Regression_R2';
    'ANOVA_F_Statistic';
    'Chi_Square_Statistic';
    'Congestion_Probability'
};

metricValues = [
    statsRes.mean;
    statsRes.variance;
    statsRes.std;
    regRes.r;
    regRes.R2;
    anovaRes.F_stat;
    chiRes.chi2_stat;
    probRes.congestionProb
];

categories = {
    'Statistics';
    'Statistics';
    'Statistics';
    'Regression';
    'Regression';
    'HypothesisTesting';
    'ChiSquare';
    'Probability'
};

descriptions = {
    'Sample mean of active connected Wi-Fi users';
    'Sample variance of active connected Wi-Fi users (s^2)';
    'Sample standard deviation of active connected Wi-Fi users (s)';
    'Pearson correlation coefficient between active users and bandwidth';
    'OLS regression coefficient of determination (R-squared)';
    'One-way ANOVA F-statistic across observation time groups';
    'Chi-Square goodness-of-fit test statistic on network states';
    'Empirical probability of network entering Congested state'
};

resultsTable = table(metricNames, metricValues, categories, descriptions, ...
    'VariableNames', {'Metric', 'Value', 'Category', 'Description'});

writetable(resultsTable, resultsFilePath);
fprintf('Results exported to: %s\n', resultsFilePath);
fprintf('Verification file is ready for import in the React application!\n\n');
fprintf('=================================================================\n');
fprintf('  MATLAB EXECUTION COMPLETE\n');
fprintf('=================================================================\n');
