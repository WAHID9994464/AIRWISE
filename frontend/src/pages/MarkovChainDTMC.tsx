import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { computeMarkovTransitions, MARKOV_STATES } from '../calculations/markov';
import { NetworkState } from '../types';
import { Layers, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

export const MarkovChainDTMC: React.FC = () => {
  const { observations } = useData();

  const markov = computeMarkovTransitions(observations);
  const [selectedInitialState, setSelectedInitialState] = useState<NetworkState>('Medium');
  const [selectedHorizon, setSelectedHorizon] = useState<'1' | '2' | '3'>('1');

  const stateIndexMap: Record<NetworkState, number> = {
    Low: 0,
    Medium: 1,
    High: 2,
    Congested: 3,
  };

  const initIdx = stateIndexMap[selectedInitialState];

  // Active matrix depending on selected horizon
  const activeMatrix =
    selectedHorizon === '1'
      ? markov.transitionMatrix
      : selectedHorizon === '2'
      ? markov.p2
      : markov.p3;

  const currentProbs = activeMatrix[initIdx] || [0, 0, 0, 0];
  const maxProbVal = Math.max(...currentProbs);
  const mostLikelyIdx = currentProbs.indexOf(maxProbVal);
  const mostLikelyState = MARKOV_STATES[mostLikelyIdx];

  const STATE_COLORS: Record<NetworkState, string> = {
    Low: '#00C853',
    Medium: '#D4AF37',
    High: '#FF9800',
    Congested: '#E53935',
  };

  // Heatmap color generator
  const getHeatmapColor = (prob: number) => {
    if (prob === 0) return 'bg-[#151515] text-neutral-600';
    if (prob < 0.25) return 'bg-[#66531C]/30 text-neutral-300';
    if (prob < 0.50) return 'bg-[#D4AF37]/25 text-[#D4AF37] font-semibold';
    if (prob < 0.75) return 'bg-[#D4AF37]/50 text-white font-bold';
    return 'bg-[#D4AF37] text-black font-extrabold';
  };

  return (
    <div className="space-y-6">
      {/* Top Transition Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Total Chronological Transitions</div>
          <div className="text-2xl font-bold text-white mt-1">{markov.totalTransitions}</div>
          <div className="text-[10px] text-neutral-400">Within-day consecutive steps</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Current Initial State (X₀)</div>
          <div className="text-2xl font-bold text-[#D4AF37] mt-1">{selectedInitialState}</div>
          <div className="text-[10px] text-neutral-400">Selectable starting condition</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">
            Forecast Horizon ({selectedHorizon}-Step)
          </div>
          <div className="text-2xl font-bold text-[#00C853] mt-1">
            {selectedHorizon === '1' ? 'Next Interval' : `${selectedHorizon} Steps Ahead`}
          </div>
          <div className="text-[10px] text-neutral-400">Matrix power P^{selectedHorizon}</div>
        </div>

        <div className="bg-[#202020] p-4 rounded-xl border border-[#66531C] shadow-md">
          <div className="text-xs uppercase font-semibold text-[#BDBDBD]">Most Likely Future State</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center space-x-2">
            <span style={{ color: STATE_COLORS[mostLikelyState] }}>{mostLikelyState}</span>
            <span className="text-xs font-normal text-neutral-400">
              ({(maxProbVal * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="text-[10px] text-neutral-400">Highest transition probability</div>
        </div>
      </div>

      {/* State Prediction Selector & Next State Odds */}
      <Card
        title="Interactive Future State Forecasting"
        subtitle="Select starting state and step horizon to evaluate Markov n-step probabilities"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Select Starting State (X₀):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MARKOV_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedInitialState(st)}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    selectedInitialState === st
                      ? 'bg-[#D4AF37] text-black shadow'
                      : 'bg-[#181818] text-neutral-300 hover:bg-[#252525] border border-[#66531C]/40'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Forecast Horizon (n-step):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1', '2', '3'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    selectedHorizon === h
                      ? 'bg-[#00C853] text-black shadow'
                      : 'bg-[#181818] text-neutral-300 hover:bg-[#252525] border border-[#66531C]/40'
                  }`}
                >
                  {h}-Step ({h === '1' ? 'P' : `P^${h}`})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Next State Probabilities from X₀ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MARKOV_STATES.map((st, idx) => {
            const prob = currentProbs[idx];
            const isHighest = idx === mostLikelyIdx;
            return (
              <div
                key={st}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHighest
                    ? 'bg-[#252525] border-[#D4AF37] shadow-md'
                    : 'bg-[#151515] border-[#66531C]/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{st}</span>
                  {isHighest && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-bold">
                      TOP
                    </span>
                  )}
                </div>
                <div
                  className="text-2xl font-extrabold mt-1"
                  style={{ color: STATE_COLORS[st] }}
                >
                  {(prob * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                  P({selectedInitialState} → {st}) = {prob.toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4x4 Transition Probability Matrix Heatmap */}
      <Card
        title={`Transition Probability Heatmap Matrix (${selectedHorizon}-Step Matrix P^${selectedHorizon})`}
        subtitle="Row stochastic matrix: Each valid row sums to 1.0000"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-[#66531C]/60 text-neutral-300 uppercase">
                <th className="py-2.5 px-3 text-left font-bold text-[#D4AF37]">From \ To</th>
                {MARKOV_STATES.map((toSt) => (
                  <th key={toSt} className="py-2.5 px-3 font-bold" style={{ color: STATE_COLORS[toSt] }}>
                    {toSt}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right">Row Sum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]">
              {MARKOV_STATES.map((fromSt, rIdx) => {
                const isValid = markov.validRows[rIdx];
                const rowProbs = activeMatrix[rIdx] || [0, 0, 0, 0];
                const rSum = rowProbs.reduce((a, b) => a + b, 0);

                return (
                  <tr key={fromSt} className="hover:bg-[#1a1a1a]">
                    <td className="py-3 px-3 text-left font-bold text-white flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATE_COLORS[fromSt] }} />
                      <span>{fromSt}</span>
                    </td>
                    {rowProbs.map((p, cIdx) => (
                      <td key={cIdx} className="py-3 px-3">
                        {isValid ? (
                          <div className={`py-1.5 px-2 rounded font-mono ${getHeatmapColor(p)}`}>
                            {p.toFixed(4)}
                          </div>
                        ) : (
                          <span className="text-neutral-500 italic">No Data</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-300">
                      {isValid ? rSum.toFixed(4) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transition Graph Diagram Visualization */}
      <Card
        title="Network State Transition Topology Diagram"
        subtitle="Visual representation of directed stochastic state progressions"
      >
        <div className="p-6 bg-[#121212] rounded-xl border border-[#66531C]/40">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            {MARKOV_STATES.map((st, i) => (
              <div
                key={st}
                className="bg-[#181818] p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2"
                style={{ borderColor: STATE_COLORS[st] }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold text-black"
                  style={{ backgroundColor: STATE_COLORS[st] }}
                >
                  S{i + 1}
                </div>
                <div className="font-bold text-white text-sm">{st}</div>
                <div className="text-[10px] text-neutral-400">
                  Self-loop: P = {(markov.transitionMatrix[i][i] * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 text-xs text-center text-neutral-400 leading-relaxed">
            Directional transitions indicate that load typically escalates monotonically from{' '}
            <strong className="text-[#00C853]">Low</strong> →{' '}
            <strong className="text-[#D4AF37]">Medium</strong> →{' '}
            <strong className="text-[#FF9800]">High</strong> →{' '}
            <strong className="text-[#E53935]">Congested</strong> during peak afternoon lectures, and de-escalates gradually into late evening.
          </div>
        </div>
      </Card>

      {/* Markov Limitations Disclaimer */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#66531C]/50 space-y-2 text-xs text-[#BDBDBD]">
        <div className="flex items-center space-x-2 font-bold text-white">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          <span>Markovian Memoryless Property & Estimation Bounds:</span>
        </div>
        <p className="leading-relaxed">
          The Discrete-Time Markov Chain assumes the <em>Markovian property</em>: P(X_{'{n+1}'} = j | X_n, X_{'{n-1}'}, \dots) = P(X_{'{n+1}'} = j | X_n).
          This model provides estimated transition probabilities rather than guaranteed future deterministic states.
          Actual university networks exhibit temporal non-homogeneity caused by scheduled class bell times.
        </p>
      </div>
    </div>
  );
};
