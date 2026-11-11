import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { MainLayout } from './layouts/MainLayout';

// 13 Pages
import { Dashboard } from './pages/Dashboard';
import { CoreConcepts } from './pages/CoreConcepts';
import { DataManagement } from './pages/DataManagement';
import { StatisticsAnalysis } from './pages/StatisticsAnalysis';
import { ProbabilityAnalysis } from './pages/ProbabilityAnalysis';
import { HypothesisTestingANOVA } from './pages/HypothesisTestingANOVA';
import { ChiSquareTest } from './pages/ChiSquareTest';
import { PoissonProcess } from './pages/PoissonProcess';
import { MarkovChainDTMC } from './pages/MarkovChainDTMC';
import { MonteCarloSimulation } from './pages/MonteCarloSimulation';
import { CongestionPrediction } from './pages/CongestionPrediction';
import { MatlabVerification } from './pages/MatlabVerification';
import { ReportsSettings } from './pages/ReportsSettings';

export const App: React.FC = () => {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="concepts" element={<CoreConcepts />} />
            <Route path="data" element={<DataManagement />} />
            <Route path="statistics" element={<StatisticsAnalysis />} />
            <Route path="probability" element={<ProbabilityAnalysis />} />
            <Route path="anova" element={<HypothesisTestingANOVA />} />
            <Route path="chi-square" element={<ChiSquareTest />} />
            <Route path="poisson" element={<PoissonProcess />} />
            <Route path="markov" element={<MarkovChainDTMC />} />
            <Route path="monte-carlo" element={<MonteCarloSimulation />} />
            <Route path="prediction" element={<CongestionPrediction />} />
            <Route path="matlab" element={<MatlabVerification />} />
            <Route path="reports-settings" element={<ReportsSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
};

export default App;
