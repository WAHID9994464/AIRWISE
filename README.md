# College Wi-Fi Load & Congestion Prediction System
### Applied Statistics and Stochastic Processes (ASSP) Academic Software Prototype

A comprehensive, fully functional academic software prototype combining an interactive React + TypeScript analytics platform with a companion MATLAB analytical suite for stochastic network modeling, congestion prediction, and cross-platform mathematical verification.

---

## 1. Project Overview

- **Project Title:** College Wi-Fi Load & Congestion Prediction System
- **Subject:** Applied Statistics and Stochastic Processes (ASSP)
- **Project Type:** Software Prototype & Mathematical Validation Engine
- **Objectives:**
  1. Analyze connected device distributions and campus bandwidth saturation.
  2. Characterize central tendency, dispersion, quartiles, and IQR (Module I).
  3. Formulate empirical PMFs, CDFs, and state score expectations (Module I).
  4. Perform One-Way ANOVA across observation hours to test schedule effects (Module II).
  5. Run Chi-Square Goodness-of-Fit tests against uniform distributions with Cochran assumption checks (Module III).
  6. Model active users vs. bandwidth utilization via Pearson correlation and OLS Linear Regression (Module IV).
  7. Simulate Wi-Fi connection arrivals via a counting Poisson process (Module V).
  8. Construct Discrete-Time Markov Chain (DTMC) transition probability matrices (Module V).
  9. Run Monte Carlo stochastic trajectory simulations to estimate congestion probabilities (Module V).
  10. Deliver independent multi-model congestion predictions with risk bounds.
  11. Independently verify calculations across React and MATLAB companion scripts.

> **Academic Notice:** This software is an educational prototype and does not connect to live university production infrastructure. All generated and uploaded data are transparently identified.

---

## 2. Technology Stack

### Frontend Application
- **Framework:** React 18 / 19 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Custom Black, Gold, Green, Red, Orange theme)
- **Routing:** React Router DOM (Single Page App with 13 functional pages)
- **Visualizations:** Recharts (responsive line charts, bar charts, step curves, and donut distributions)
- **Icons:** Lucide React

### MATLAB Companion
- **Version:** MATLAB R2018b or later
- **Dependency Policy:** Zero required external toolboxes (pure mathematical implementations of F-distribution and Chi-Square CDF approximations are included as fallbacks)
- **Data Exchange:** Standard CSV format (`data/wifi_sample_dataset.csv` and `results/matlab_results.csv`)

---

## 3. Project Directory Structure

```text
College-WiFi-Analytics/
│
├── frontend/                     # React + TypeScript interactive web app
│   ├── src/
│   │   ├── calculations/        # Pure TypeScript mathematical engines
│   │   │   ├── anova.ts         # One-Way ANOVA & F-distribution p-values
│   │   │   ├── chiSquare.ts     # Chi-Square test & Cochran checks
│   │   │   ├── markov.ts        # DTMC transition matrix & n-step forecast
│   │   │   ├── mathUtils.ts     # Lanczos log-gamma, incomplete gamma & beta
│   │   │   ├── monteCarlo.ts    # Monte Carlo realization generator
│   │   │   ├── poisson.ts       # Poisson PMF & arrival generator
│   │   │   ├── probability.ts   # Discrete PMF, CDF, expected value
│   │   │   ├── regression.ts    # Pearson r & OLS linear regression
│   │   │   └── stats.ts         # Descriptive statistics (Mean, Var, Quartiles)
│   │   ├── components/          # Reusable UI cards, headers, formula cards
│   │   ├── context/             # DataContext (data persistence, thresholds)
│   │   ├── layouts/             # MainLayout with responsive sidebar & navbar
│   │   ├── pages/               # 13 dedicated, functional application pages
│   │   ├── types/               # TypeScript interfaces & types
│   │   ├── utils/               # CSV parser/exporter & sample dataset
│   │   ├── App.tsx              # Router setup
│   │   ├── index.css            # Custom theme scrollbars and print CSS
│   │   └── main.tsx             # Application mount point
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js       # Black, Gold, Green, Red palette config
│   └── vite.config.ts
│
├── matlab/                      # Independent MATLAB companion implementation
│   ├── main.m                   # Central orchestrator & CSV result exporter
│   ├── data_analysis.m          # Descriptive statistics
│   ├── probability_analysis.m   # Discrete state probabilities & PMF
│   ├── anova_analysis.m         # One-Way ANOVA across hours
│   ├── chi_square_analysis.m    # Goodness-of-fit test
│   ├── correlation_regression.m # Pearson r & OLS regression
│   ├── poisson_process.m        # Poisson arrival modeling
│   ├── markov_chain.m           # DTMC row-normalized transition matrix
│   ├── monte_carlo.m            # Monte Carlo simulation paths
│   ├── congestion_prediction.m  # Multi-model prediction engine
│   └── README.md                # MATLAB execution guide
│
├── data/
│   └── wifi_sample_dataset.csv  # 56 observations across 7 days
│
├── results/
│   └── matlab_results.csv       # Verified MATLAB numerical output
│
└── README.md                    # Project documentation
```

---

## 4. Theme & Color Palette

Designed according to a premium Black, Gold, Green, and Red aesthetic:

| Element | Hex Code | Usage |
|---|---|---|
| Main Background | `#080808` | Primary page canvas |
| Secondary Background | `#151515` | Navigation & side panels |
| Card Background | `#202020` | Analytical containers |
| Gold | `#D4AF37` | Branding, formulas, active navigation, key metrics |
| Green | `#00C853` | Low/nominal state, verified status, successes |
| Orange | `#FF9800` | High load warnings, intermediate indicators |
| Red | `#E53935` | Critical congestion alerts, test rejections, errors |
| Subtle Border | `#66531C` | Card and component borders |

---

## 5. Overview of the 13 Application Pages

1. **Dashboard (`/`):** 7 dynamic KPI cards, 5 charts (Active Users, Bandwidth %, State Distribution, Hourly Usage, Connection Arrivals), and a real-time Operational Status panel.
2. **Core ASSP Concepts (`/concepts`):** Academic curriculum guide spanning Modules I–V with theoretical formulas, variable definitions, worked examples, and interactive calculators.
3. **Data Management (`/data`):** CSV upload & export, manual CRUD operations, inline row editing, search/filter, and one-click sample reset.
4. **Statistics Analysis (`/statistics`):** 11 measures (Count, Mean, Median, Mode, Variance, Std Dev, Min, Max, Range, Q1, Q3, IQR), frequency histograms, daily mean comparisons, and box-plot schematics.
5. **Probability Analysis (`/probability`):** Discrete state PMF, cumulative distribution function (CDF), state score expected values, and congestion probability analysis.
6. **Hypothesis Testing & ANOVA (`/anova`):** One-Way ANOVA across observation hours/days, partitioning SS into between/within groups, F-statistic, p-value, decision, and assumption checks.
7. **Chi-Square Test (`/chi-square`):** Goodness-of-Fit test comparing observed state frequencies against theoretical distributions, featuring Cochran cell count checks ($E_i \ge 5$).
8. **Poisson Process (`/poisson`):** Wi-Fi connection arrival modeling with configurable $\lambda$, single-point $P(X=k)$ calculations, and Monte Carlo theoretical comparisons.
9. **Markov Chain & DTMC (`/markov`):** Row-normalized $4 \times 4$ transition matrix, transition heatmap, 1-step, 2-step ($P^2$), and 3-step ($P^3$) forecasts, and directed state transition diagrams.
10. **Monte Carlo Simulation (`/monte-carlo`):** Repeated random trajectory simulator (up to 10,000 runs) tracking asymptotic convergence and future congestion probabilities via the Law of Large Numbers.
11. **Congestion Prediction (`/prediction`):** Decoupled multi-model forecasting featuring historical moving trends, OLS bandwidth projection, 1-step Markov transition, and 3-step Monte Carlo risk estimation.
12. **MATLAB Verification (`/matlab`):** Side-by-side numerical comparison table checking React computations against MATLAB outputs within floating-point tolerance bands ($| \text{React} - \text{MATLAB} | \le \text{tolerance}$).
13. **Reports & Settings (`/reports-settings`):** Printable/PDF academic report generation, CSV report export, configurable network state thresholds (Low/Medium/High/Congested), and theme configuration.

---

## 6. How to Run the Project

### A. Running the React Web Application

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Start the local development server
npm.cmd run dev
```

Open your browser at `http://localhost:5173`.

To verify the production build:
```bash
npm.cmd run build
npm.cmd run preview
```

### B. Running the MATLAB Companion

1. Open MATLAB.
2. Set the working directory to `matlab/`:
   ```matlab
   cd('c:\Users\awahi\Downloads\College-WiFi-Analytics\matlab')
   ```
3. Run the central pipeline:
   ```matlab
   main
   ```
4. `main.m` will load `data/wifi_sample_dataset.csv`, execute all 5 modules, and output `results/matlab_results.csv`.
5. In the React web application, open the **MATLAB Verification** page and click **"Upload MATLAB CSV"** (or **"Load Baseline"**) to observe the verified status.

---

## 7. Mathematical Equivalences Verified

| Metric | React Equation | MATLAB Implementation | Status |
|---|---|---|---|
| **Sample Mean** | $\bar{x} = \frac{1}{n} \sum x_i$ | `sum(x)/n` | **Verified** |
| **Sample Variance** | $s^2 = \frac{1}{n-1} \sum (x_i - \bar{x})^2$ | `sum((x-mean).^2)/(n-1)` | **Verified** |
| **Correlation** | $r = \frac{\text{Cov}(X,Y)}{s_x s_y}$ | `corr(x,y)` / OLS covariance | **Verified** |
| **ANOVA F-stat** | $F = \frac{MS_{between}}{MS_{within}}$ | `anova1` / regularized incomplete beta | **Verified** |
| **Chi-Square** | $\chi^2 = \sum \frac{(O-E)^2}{E}$ | Incomplete regularized gamma | **Verified** |
| **Poisson PMF** | $P(X=k) = \frac{e^{-\lambda} \lambda^k}{k!}$ | `poissnpdf` / log-gamma formulation | **Verified** |
| **Markov DTMC** | $P_{ij} = \frac{N_{ij}}{\sum_k N_{ik}}$ | Row-normalized transition counts | **Verified** |

---

## 8. Academic Integrity & Prototype Rules

- **Zero Fabricated Results:** Verification flags are rendered strictly from imported MATLAB output CSV records.
- **Independent Calculations:** TypeScript and MATLAB scripts contain independent formula implementations.
- **Realistic Dataset:** 56 observations across Monday–Sunday modeling diurnal campus academic routines.
