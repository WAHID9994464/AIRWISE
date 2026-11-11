import { WiFiObservation, NetworkState, MATLABVerificationItem } from '../types';

export function exportObservationsToCSV(observations: WiFiObservation[], filename = 'wifi_dataset.csv') {
  const headers = ['Day', 'Hour', 'Active_Users', 'Bandwidth_Utilization_Percent', 'New_Connections_Per_10min', 'Network_State'];
  const rows = observations.map((obs) => [
    obs.Day,
    obs.Hour,
    obs.Active_Users,
    obs.Bandwidth_Utilization_Percent,
    obs.New_Connections_Per_10min,
    obs.Network_State,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface CSVParseResult {
  data: WiFiObservation[];
  errors: string[];
}

export function parseObservationsCSV(csvText: string): CSVParseResult {
  const errors: string[] = [];
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return { data: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const header = lines[0].split(',').map((h) => h.trim());
  const requiredCols = ['Day', 'Hour', 'Active_Users', 'Bandwidth_Utilization_Percent', 'New_Connections_Per_10min', 'Network_State'];

  for (const col of requiredCols) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: "${col}".`);
    }
  }

  if (errors.length > 0) {
    return { data: [], errors };
  }

  const colIdx = {
    Day: header.indexOf('Day'),
    Hour: header.indexOf('Hour'),
    Active_Users: header.indexOf('Active_Users'),
    Bandwidth_Utilization_Percent: header.indexOf('Bandwidth_Utilization_Percent'),
    New_Connections_Per_10min: header.indexOf('New_Connections_Per_10min'),
    Network_State: header.indexOf('Network_State'),
  };

  const validStates: NetworkState[] = ['Low', 'Medium', 'High', 'Congested'];
  const observations: WiFiObservation[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim());
    if (row.length < requiredCols.length) {
      errors.push(`Row ${i + 1} has insufficient columns.`);
      continue;
    }

    const day = row[colIdx.Day];
    const hour = row[colIdx.Hour];
    const activeUsers = parseFloat(row[colIdx.Active_Users]);
    const bandwidth = parseFloat(row[colIdx.Bandwidth_Utilization_Percent]);
    const newConns = parseFloat(row[colIdx.New_Connections_Per_10min]);
    let state = row[colIdx.Network_State] as NetworkState;

    if (!day || !hour) {
      errors.push(`Row ${i + 1}: Day or Hour cannot be blank.`);
    }

    if (isNaN(activeUsers) || activeUsers < 0) {
      errors.push(`Row ${i + 1}: Active_Users must be a non-negative number.`);
    }

    if (isNaN(bandwidth) || bandwidth < 0 || bandwidth > 100) {
      errors.push(`Row ${i + 1}: Bandwidth_Utilization_Percent must be between 0 and 100.`);
    }

    if (isNaN(newConns) || newConns < 0) {
      errors.push(`Row ${i + 1}: New_Connections_Per_10min must be a non-negative number.`);
    }

    if (!validStates.includes(state)) {
      // Auto-classify if unknown
      if (activeUsers < 60) state = 'Low';
      else if (activeUsers < 110) state = 'Medium';
      else if (activeUsers < 145) state = 'High';
      else state = 'Congested';
    }

    observations.push({
      id: `row-${i}-${Date.now()}`,
      Day: day,
      Hour: hour,
      Active_Users: activeUsers,
      Bandwidth_Utilization_Percent: bandwidth,
      New_Connections_Per_10min: newConns,
      Network_State: state,
    });
  }

  return { data: observations, errors };
}

export function parseMatlabResultsCSV(csvText: string): {
  results: Record<string, number>;
  errors: string[];
} {
  const errors: string[] = [];
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return { results: {}, errors: ['MATLAB results CSV is empty.'] };
  }

  const header = lines[0].split(',').map((h) => h.trim());
  const metricIdx = header.indexOf('Metric');
  const valueIdx = header.indexOf('Value');

  if (metricIdx === -1 || valueIdx === -1) {
    return { results: {}, errors: ['CSV must contain "Metric" and "Value" headers.'] };
  }

  const results: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim());
    if (row.length > Math.max(metricIdx, valueIdx)) {
      const metric = row[metricIdx];
      const val = parseFloat(row[valueIdx]);
      if (metric && !isNaN(val)) {
        results[metric] = val;
      }
    }
  }

  return { results, errors };
}
