import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Search,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { ShimmerButton } from '../components/ShimmerButton';
import { exportObservationsToCSV } from '../utils/csvUtils';
import { WiFiObservation, NetworkState } from '../types';

export const DataManagement: React.FC = () => {
  const {
    observations,
    dataSource,
    addObservation,
    updateObservation,
    deleteObservation,
    clearDataset,
    resetToSample,
    importCSV,
    classifyState,
  } = useData();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('All');
  const [filterState, setFilterState] = useState('All');

  // Manual entry modal / form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDay, setNewDay] = useState('Monday');
  const [newHour, setNewHour] = useState('12:00');
  const [newUsers, setNewUsers] = useState<number>(75);
  const [newBw, setNewBw] = useState<number>(45.0);
  const [newArrivals, setNewArrivals] = useState<number>(18);

  // Edit record state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsers, setEditUsers] = useState<number>(0);
  const [editBw, setEditBw] = useState<number>(0);
  const [editArrivals, setEditArrivals] = useState<number>(0);

  // CSV upload state & errors
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadErrors([]);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importCSV(text);
      if (res.success) {
        setUploadSuccess(`Successfully imported dataset from "${file.name}"!`);
      } else {
        setUploadErrors(res.errors);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const state = classifyState(newUsers);
    addObservation({
      Day: newDay,
      Hour: newHour,
      Active_Users: Number(newUsers),
      Bandwidth_Utilization_Percent: Number(newBw),
      New_Connections_Per_10min: Number(newArrivals),
      Network_State: state,
    });
    setShowAddForm(false);
  };

  const handleSaveEdit = (id: string) => {
    const state = classifyState(editUsers);
    updateObservation(id, {
      Active_Users: editUsers,
      Bandwidth_Utilization_Percent: editBw,
      New_Connections_Per_10min: editArrivals,
      Network_State: state,
    });
    setEditingId(null);
  };

  // Filtered observations
  const filtered = observations.filter((obs) => {
    const matchesSearch =
      obs.Day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.Hour.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.Network_State.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = filterDay === 'All' || obs.Day === filterDay;
    const matchesState = filterState === 'All' || obs.Network_State === filterState;
    return matchesSearch && matchesDay && matchesState;
  });

  const STATE_BADGES: Record<NetworkState, string> = {
    Low: 'bg-[#00C853]/20 text-[#00C853] border-[#00C853]/40',
    Medium: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40',
    High: 'bg-[#FF9800]/20 text-[#FF9800] border-[#FF9800]/40',
    Congested: 'bg-[#E53935]/20 text-[#E53935] border-[#E53935]/40',
  };

  return (
    <div className="space-y-6">
      {/* Upload and Validation Messages */}
      {uploadSuccess && (
        <div className="p-3 bg-[#00C853]/15 border border-[#00C853]/40 rounded-lg flex items-center space-x-2 text-xs text-[#00C853]">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadErrors.length > 0 && (
        <div className="p-4 bg-[#E53935]/15 border border-[#E53935]/50 rounded-lg text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-[#E53935]">
            <AlertCircle className="w-4 h-4" />
            <span>CSV Import Validation Errors:</span>
          </div>
          <ul className="list-disc pl-5 text-neutral-300 space-y-0.5">
            {uploadErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Dataset Controls Card */}
      <Card
        title="Dataset Management & Operations"
        subtitle={`Current active source: ${dataSource} (${observations.length} records in memory)`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ShimmerButton
              variant="gold"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <span>Add Record</span>
            </ShimmerButton>

            <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-white border border-[#66531C] text-xs font-semibold cursor-pointer transition shadow-sm hover:border-[#D4AF37]/50">
              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <ShimmerButton
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-[#00C853]" />}
              onClick={() => exportObservationsToCSV(observations, 'wifi_dataset.csv')}
            >
              <span>Export CSV</span>
            </ShimmerButton>

            <ShimmerButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />}
              onClick={() => {
                if (window.confirm('Reset dataset to default 56 simulated sample observations?')) {
                  resetToSample();
                }
              }}
            >
              <span>Reset Sample</span>
            </ShimmerButton>

            <ShimmerButton
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all observations from memory?')) {
                  clearDataset();
                }
              }}
            >
              <span>Clear</span>
            </ShimmerButton>
          </div>
        }
      >
        {/* Manual Add Record Drawer Form with Framer Motion AnimatePresence */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleCreateRecord}
              className="mb-6 p-4 bg-[#151515] rounded-2xl border border-[#D4AF37]/50 space-y-4 overflow-hidden shadow-lg"
            >
            <div className="flex items-center justify-between border-b border-[#66531C]/40 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Manual Wi-Fi Load Observation</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Day of Week:</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full bg-[#202020] border border-[#66531C] rounded px-2.5 py-1.5 text-white"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Observation Hour:</label>
                <input
                  type="text"
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  placeholder="e.g. 14:00"
                  className="w-full bg-[#202020] border border-[#66531C] rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Active Users:</label>
                <input
                  type="number"
                  min="0"
                  value={newUsers}
                  onChange={(e) => setNewUsers(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#202020] border border-[#66531C] rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Bandwidth Utilization (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newBw}
                  onChange={(e) => setNewBw(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#202020] border border-[#66531C] rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">New Conns / 10min:</label>
                <input
                  type="number"
                  min="0"
                  value={newArrivals}
                  onChange={(e) => setNewArrivals(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#202020] border border-[#66531C] rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <ShimmerButton
                type="submit"
                variant="gold"
                size="sm"
              >
                Save Observation
              </ShimmerButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Day, Hour, or State..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#66531C]/60 rounded-lg text-xs text-white placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full px-3 py-2 bg-[#121212] border border-[#66531C]/60 rounded-lg text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="All">All Days</option>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full px-3 py-2 bg-[#121212] border border-[#66531C]/60 rounded-lg text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="All">All Network States</option>
              {['Low', 'Medium', 'High', 'Congested'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dataset Table */}
        <div className="overflow-x-auto rounded-lg border border-[#66531C]/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151515] border-b border-[#66531C]/50 text-neutral-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Hour</th>
                <th className="py-2.5 px-3 text-right">Active Users</th>
                <th className="py-2.5 px-3 text-right">Bandwidth (%)</th>
                <th className="py-2.5 px-3 text-right">Arrivals (10m)</th>
                <th className="py-2.5 px-3 text-center">Network State</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828] text-neutral-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    No observations found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filtered.map((obs, idx) => {
                  const isEditing = editingId === (obs.id || `idx-${idx}`);

                  if (isEditing) {
                    return (
                      <tr key={obs.id || idx} className="bg-[#1e1e1e]">
                        <td className="py-2 px-3 text-neutral-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-white">{obs.Day}</td>
                        <td className="py-2 px-3 font-mono">{obs.Hour}</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editUsers}
                            onChange={(e) => setEditUsers(parseInt(e.target.value) || 0)}
                            className="w-20 bg-[#101010] border border-[#D4AF37] rounded px-1.5 py-0.5 text-right text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.1"
                            value={editBw}
                            onChange={(e) => setEditBw(parseFloat(e.target.value) || 0)}
                            className="w-20 bg-[#101010] border border-[#D4AF37] rounded px-1.5 py-0.5 text-right text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editArrivals}
                            onChange={(e) => setEditArrivals(parseInt(e.target.value) || 0)}
                            className="w-20 bg-[#101010] border border-[#D4AF37] rounded px-1.5 py-0.5 text-right text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[10px] text-neutral-400">Auto-calc</span>
                        </td>
                        <td className="py-2 px-3 text-center space-x-1">
                          <button
                            onClick={() => handleSaveEdit(obs.id || '')}
                            className="px-2 py-0.5 rounded bg-[#00C853] text-black font-bold text-[11px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-0.5 rounded bg-neutral-700 text-white text-[11px]"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={obs.id || idx}
                      className="hover:bg-[#1a1a1a] transition-colors"
                    >
                      <td className="py-2 px-3 text-neutral-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-white">{obs.Day}</td>
                      <td className="py-2 px-3 font-mono text-neutral-300">{obs.Hour}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-[#D4AF37]">
                        {obs.Active_Users}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#00C853]">
                        {obs.Bandwidth_Utilization_Percent.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#FF9800]">
                        {obs.New_Connections_Per_10min}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            STATE_BADGES[obs.Network_State] || 'bg-neutral-800 text-white'
                          }`}
                        >
                          {obs.Network_State}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center space-x-1.5">
                        <button
                          onClick={() => {
                            setEditingId(obs.id || `idx-${idx}`);
                            setEditUsers(obs.Active_Users);
                            setEditBw(obs.Bandwidth_Utilization_Percent);
                            setEditArrivals(obs.New_Connections_Per_10min);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-[#D4AF37] hover:bg-neutral-800 transition"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (obs.id) deleteObservation(obs.id);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-[#E53935] hover:bg-neutral-800 transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
