# MATLAB Companion Implementation: College Wi-Fi Load & Congestion Prediction System
Applied Statistics and Stochastic Processes (ASSP) Software Prototype

This directory contains the independent MATLAB companion scripts that perform statistical, regression, hypothesis testing, stochastic modeling (Poisson and Markov Chains), and Monte Carlo simulations on the shared College Wi-Fi dataset.

---

## 1. Directory Structure

```text
matlab/
├── main.m                      # Central execution script & CSV exporter
├── data_analysis.m             # Descriptive statistics & distribution metrics
├── probability_analysis.m      # Probability Mass & Cumulative distributions
├── anova_analysis.m            # One-Way ANOVA across time groups
├── chi_square_analysis.m       # Chi-Square Goodness-of-Fit test
├── correlation_regression.m    # Pearson correlation & OLS Linear Regression
├── poisson_process.m           # Poisson arrival modeling & verification
├── markov_chain.m              # DTMC transition probability matrix & n-step forecast
├── monte_carlo.m               # Monte Carlo simulation of network congestion
├── congestion_prediction.m     # Multi-model prediction framework
└── README.md                   # Setup and execution instructions
```

---

## 2. Prerequisites & Toolboxes

- **MATLAB Version**: Compatible with MATLAB R2018b or later.
- **Toolbox Policy**: Built using standard MATLAB base functions wherever possible.
  - Optional: *Statistics and Machine Learning Toolbox* (`anova1`, `chi2gof`, `fitlm`).
  - **Zero-Dependency Fallbacks**: Every script contains built-in pure mathematical implementations of F-distributions, Chi-Square CDF approximations, and OLS regressions, so the entire pipeline runs successfully even on vanilla base MATLAB installations without optional toolboxes.

---

## 3. How to Run

1. Open MATLAB and set the Current Working Directory to the `matlab/` folder:
   ```matlab
   cd('c:\Users\awahi\Downloads\College-WiFi-Analytics\matlab')
   ```
2. Run the main execution pipeline:
   ```matlab
   main
   ```
3. What `main.m` performs:
   - Reads the shared dataset at `../data/wifi_sample_dataset.csv`.
   - Executes all mathematical and stochastic models sequentially.
   - Generates and saves analytical plots in a figure window.
   - Exports the verified numerical output to `../results/matlab_results.csv`.
4. Upload `../results/matlab_results.csv` into the **MATLAB Verification** page of the React web application to verify mathematical equivalence.

---

## 4. Verification Exchange Format

The exported `matlab_results.csv` contains standard header columns:
- `Metric`: Standardized metric identifier (e.g. `Mean`, `Variance`, `Standard_Deviation`, `Correlation`, `Regression_R2`, `ANOVA_F_Statistic`, `Chi_Square_Statistic`, `Congestion_Probability`).
- `Value`: High-precision floating-point computed value.
- `Category`: Mathematical module categorization.
- `Description`: Academic explanation of the computed metric.
