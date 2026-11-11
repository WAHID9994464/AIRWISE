import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WiFiObservation,
  NetworkThresholds,
  DataSourceType,
  NetworkState,
} from '../types';
import { DEFAULT_SAMPLE_DATA } from '../utils/sampleData';
import { parseObservationsCSV, parseMatlabResultsCSV } from '../utils/csvUtils';

interface DataContextType {
  observations: WiFiObservation[];
  thresholds: NetworkThresholds;
  dataSource: DataSourceType;
  matlabResults: Record<string, number> | null;
  matlabTimestamp: string | null;
  setThresholds: (thresholds: NetworkThresholds, reclassify?: boolean) => void;
  addObservation: (obs: Omit<WiFiObservation, 'id'>) => void;
  updateObservation: (id: string, obs: Partial<WiFiObservation>) => void;
  deleteObservation: (id: string) => void;
  clearDataset: () => void;
  resetToSample: () => void;
  importCSV: (csvText: string) => { success: boolean; errors: string[] };
  importMatlabCSV: (csvText: string) => { success: boolean; errors: string[]; count: number };
  classifyState: (activeUsers: number) => NetworkState;
}

const DEFAULT_THRESHOLDS: NetworkThresholds = {
  lowMax: 59,
  mediumMax: 109,
  highMax: 144,
  congestedMin: 145,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [thresholds, setThresholdsState] = useState<NetworkThresholds>(() => {
    const saved = localStorage.getItem('wifi_thresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_THRESHOLDS;
  });

  const [dataSource, setDataSource] = useState<DataSourceType>(() => {
    const saved = localStorage.getItem('wifi_data_source');
    return (saved as DataSourceType) || 'SIMULATED SAMPLE DATA';
  });

  const [observations, setObservations] = useState<WiFiObservation[]>(() => {
    const saved = localStorage.getItem('wifi_observations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_SAMPLE_DATA;
  });

  const [matlabResults, setMatlabResults] = useState<Record<string, number> | null>(() => {
    const saved = localStorage.getItem('wifi_matlab_results');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  const [matlabTimestamp, setMatlabTimestamp] = useState<string | null>(() => {
    return localStorage.getItem('wifi_matlab_timestamp');
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('wifi_observations', JSON.stringify(observations));
    localStorage.setItem('wifi_data_source', dataSource);
  }, [observations, dataSource]);

  useEffect(() => {
    localStorage.setItem('wifi_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  useEffect(() => {
    if (matlabResults) {
      localStorage.setItem('wifi_matlab_results', JSON.stringify(matlabResults));
    } else {
      localStorage.removeItem('wifi_matlab_results');
    }
    if (matlabTimestamp) {
      localStorage.setItem('wifi_matlab_timestamp', matlabTimestamp);
    } else {
      localStorage.removeItem('wifi_matlab_timestamp');
    }
  }, [matlabResults, matlabTimestamp]);

  const classifyState = (activeUsers: number): NetworkState => {
    if (activeUsers <= thresholds.lowMax) return 'Low';
    if (activeUsers <= thresholds.mediumMax) return 'Medium';
    if (activeUsers <= thresholds.highMax) return 'High';
    return 'Congested';
  };

  const setThresholds = (newThresholds: NetworkThresholds, reclassify = false) => {
    setThresholdsState(newThresholds);
    if (reclassify) {
      setObservations((prev) =>
        prev.map((obs) => ({
          ...obs,
          Network_State:
            obs.Active_Users <= newThresholds.lowMax
              ? 'Low'
              : obs.Active_Users <= newThresholds.mediumMax
              ? 'Medium'
              : obs.Active_Users <= newThresholds.highMax
              ? 'High'
              : 'Congested',
        }))
      );
    }
  };

  const addObservation = (obs: Omit<WiFiObservation, 'id'>) => {
    const newRecord: WiFiObservation = {
      ...obs,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setObservations((prev) => [...prev, newRecord]);
    setDataSource('USER MODIFIED DATA');
  };

  const updateObservation = (id: string, updatedFields: Partial<WiFiObservation>) => {
    setObservations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    setDataSource('USER MODIFIED DATA');
  };

  const deleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((item) => item.id !== id));
    setDataSource('USER MODIFIED DATA');
  };

  const clearDataset = () => {
    setObservations([]);
    setDataSource('USER MODIFIED DATA');
  };

  const resetToSample = () => {
    setObservations(DEFAULT_SAMPLE_DATA);
    setDataSource('SIMULATED SAMPLE DATA');
  };

  const importCSV = (csvText: string) => {
    const { data, errors } = parseObservationsCSV(csvText);
    if (errors.length > 0 || data.length === 0) {
      return { success: false, errors };
    }
    setObservations(data);
    setDataSource('UPLOADED CSV DATA');
    return { success: true, errors: [] };
  };

  const importMatlabCSV = (csvText: string) => {
    const { results, errors } = parseMatlabResultsCSV(csvText);
    const keysCount = Object.keys(results).length;
    if (errors.length > 0 || keysCount === 0) {
      return { success: false, errors: errors.length > 0 ? errors : ['No valid numerical results found in CSV.'], count: 0 };
    }
    setMatlabResults(results);
    const ts = new Date().toLocaleString();
    setMatlabTimestamp(ts);
    return { success: true, errors: [], count: keysCount };
  };

  return (
    <DataContext.Provider
      value={{
        observations,
        thresholds,
        dataSource,
        matlabResults,
        matlabTimestamp,
        setThresholds,
        addObservation,
        updateObservation,
        deleteObservation,
        clearDataset,
        resetToSample,
        importCSV,
        importMatlabCSV,
        classifyState,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
