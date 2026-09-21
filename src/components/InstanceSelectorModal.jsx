import React, { useState } from 'react';
import { X, Server, Check, Activity, ShieldCheck, RefreshCw, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INVIDIOUS_INSTANCES } from '../services/instances';
import api from '../services/api';

export default function InstanceSelectorModal() {
  const { isInstanceModalOpen, setIsInstanceModalOpen, activeInstance, switchInstance } = useApp();
  const [pings, setPings] = useState({});
  const [pinging, setPinging] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  if (!isInstanceModalOpen) return null;

  const handleTestLatencies = async () => {
    setPinging(true);
    const results = {};
    for (const inst of INVIDIOUS_INSTANCES) {
      const res = await api.pingInstance(inst.url);
      results[inst.url] = res;
    }
    setPings(results);
    setPinging(false);
  };

  const handleSelect = (url) => {
    switchInstance(url);
    setIsInstanceModalOpen(false);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    let url = customUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    url = url.replace(/\/+$/, '');
    switchInstance(url);
    setIsInstanceModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setIsInstanceModalOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111116] border border-white/[0.08] shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Invidious Network</h3>
              <p className="text-xs text-void-400">Select or test public Invidious instances</p>
            </div>
          </div>
          <button
            onClick={() => setIsInstanceModalOpen(false)}
            className="p-1.5 rounded-lg text-void-400 hover:text-white hover:bg-void-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action: Ping Test */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-void-400">Available Public Instances</span>
          <button
            onClick={handleTestLatencies}
            disabled={pinging}
            className="flex items-center gap-1.5 text-xs text-neon-purple hover:text-purple-300 font-semibold disabled:opacity-50"
          >
            <RefreshCw size={13} className={pinging ? 'animate-spin' : ''} />
            {pinging ? 'Testing Nodes...' : 'Test Latencies'}
          </button>
        </div>

        {/* Instance List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {INVIDIOUS_INSTANCES.map((inst) => {
            const isSelected = activeInstance === inst.url;
            const pingInfo = pings[inst.url];

            return (
              <div
                key={inst.url}
                onClick={() => handleSelect(inst.url)}
                className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-neon-purple/15 border-neon-purple/60 text-white shadow-sm'
                    : 'bg-[#15151c] hover:bg-[#1a1a24] border-white/[0.04] hover:border-white/10 text-void-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base">{inst.flag}</span>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-void-100">{inst.name}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded bg-neon-purple text-[10px] font-bold text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-void-500 truncate block">
                      {inst.url.replace('https://', '')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Latency badge if tested */}
                  {pingInfo && (
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      pingInfo.ok
                        ? pingInfo.latency < 500 ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'
                        : 'text-red-400 bg-red-950/40'
                    }`}>
                      {pingInfo.ok ? `${pingInfo.latency}ms` : 'Offline'}
                    </span>
                  )}

                  {isSelected ? (
                    <Check size={16} className="text-neon-purple" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-void-600 group-hover:border-void-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Instance Option */}
        <form onSubmit={handleAddCustom} className="pt-2 border-t border-white/[0.06]">
          <label className="block text-[11px] text-void-400 mb-1.5">
            Or connect to a Custom / Self-hosted instance:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://my-invidious-instance.org"
              className="flex-1 px-3 py-2 bg-void-900 text-xs rounded-xl border border-void-700 focus:border-neon-purple text-void-100 placeholder-void-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customUrl.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-void-800 hover:bg-neon-purple disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-all"
            >
              <Plus size={14} />
              Connect
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
