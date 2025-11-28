import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';

export const MissionControl: React.FC = () => {
  const { addOutcome, isSimulating, toggleSimulation, resetSystem } = useSystem();
  const [outcome, setOutcome] = useState('');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim()) return;
    setIsSubmitting(true);
    await addOutcome(outcome, context);
    setOutcome('');
    setContext('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mission Control
        </h2>
        <div className="flex gap-2">
            <button
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                isSimulating 
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500 hover:bg-amber-500/30' 
                : 'bg-green-500/20 text-green-500 border border-green-500 hover:bg-green-500/30'
            }`}
            >
            {isSimulating ? 'PAUSE SIMULATION' : 'START SIMULATION'}
            </button>
            <button 
                onClick={resetSystem}
                className="px-4 py-2 rounded font-bold text-sm bg-red-500/10 text-red-500 border border-red-900 hover:bg-red-500/20"
            >
                RESET
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-1">
            Desired Strategic Outcome
          </label>
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="e.g., Launch new product line in EMEA by Q4"
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-1">
            Constraints & Context
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Budget cap $50k, adhere to GDPR, prioritize speed over cost."
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-3 text-white h-24 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !outcome}
          className={`w-full py-3 rounded font-bold transition-all ${
            isSubmitting
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]'
          }`}
        >
          {isSubmitting ? 'Decomposing Strategy...' : 'INJECT OUTCOME TO ENTERPRISE BRAIN'}
        </button>
      </form>
    </div>
  );
};
