import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ROUTE_TITLES: Record<string, string> = {
  '/': '1. Network Intelligence Dashboard',
  '/concepts': '2. Core ASSP Mathematical Concepts',
  '/data': '3. Dataset Management & Validation',
  '/statistics': '4. Descriptive Statistics Analysis',
  '/probability': '5. Discrete Probability & Distribution Analysis',
  '/anova': '6. Hypothesis Testing & One-Way ANOVA',
  '/chi-square': '7. Chi-Square Goodness-of-Fit Test',
  '/poisson': '8. Poisson Connection Arrival Process',
  '/markov': '9. Markov Chain & DTMC Transitions',
  '/monte-carlo': '10. Monte Carlo Congestion Simulation',
  '/prediction': '11. Multi-Model Congestion Prediction',
  '/matlab': '12. MATLAB Companion Verification',
  '/reports-settings': '13. Academic Reports & Settings',
};

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'College Wi-Fi Analytics';

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300 min-w-0">
        <Header
          title={currentTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary fallbackTitle="Page Display Diagnostic">
            <motion.div
              key={location.pathname}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
