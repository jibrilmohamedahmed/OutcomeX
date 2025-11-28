import React from 'react';
import { useSystem } from '../context/SystemContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { AgentStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { metrics, logs, agents, tasks, systemAnalysis, predictions, dismissPrediction } = useSystem();

  const taskStats = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length },
    { name: 'Negot.', value: tasks.filter(t => t.status === 'NEGOTIATING').length },
    { name: 'Active', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'COMPLETED').length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
          <div className="flex justify-between items-start">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Workforce Utilization</h3>
             <div className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">REALTIME</div>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{metrics.activeAgents} <span className="text-slate-500 text-lg">/ {agents.length}</span></p>
          <p className="text-xs text-slate-500 mt-1">Active Agents</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Throughput</h3>
          <p className="text-3xl font-bold text-cyan-400 mt-2">{metrics.completedTasks}</p>
          <p className="text-xs text-slate-500 mt-1">Tasks Delivered</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Network Efficiency</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">{Math.round(metrics.efficiency)}%</p>
          <p className="text-xs text-slate-500 mt-1">Global Average</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Burn</h3>
          <p className="text-3xl font-bold text-amber-400 mt-2">${metrics.totalCost.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Allocated Budget</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Analysis & Outcomes */}
        <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Enterprise Brain Analysis
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-purple-500 pl-3 bg-purple-500/5 p-2 rounded-r">
                    "{systemAnalysis}"
                </p>
            </div>

            {/* Predictive Analytics Panel */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md max-h-80 overflow-y-auto custom-scrollbar">
                 <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    Predictive Insights
                </h3>
                <div className="space-y-2">
                    {predictions.length === 0 && <p className="text-slate-500 text-sm">No critical insights generated yet.</p>}
                    {predictions.map(p => (
                        <div key={p.id} className={`p-3 rounded border text-sm relative group ${
                            p.severity === 'HIGH' ? 'bg-red-900/10 border-red-800' :
                            p.severity === 'MEDIUM' ? 'bg-amber-900/10 border-amber-800' : 'bg-blue-900/10 border-blue-800'
                        }`}>
                            <button 
                                onClick={() => dismissPrediction(p.id)}
                                className="absolute top-2 right-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Dismiss Insight"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div className="flex justify-between mb-1">
                                <span className={`font-bold text-xs px-1.5 rounded ${
                                    p.severity === 'HIGH' ? 'bg-red-500 text-white' : 
                                    p.severity === 'MEDIUM' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
                                }`}>{p.severity}</span>
                                <span className="text-slate-500 text-xs">{new Date(p.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-300 font-medium mb-1">{p.message}</p>
                            <p className="text-slate-400 text-xs">Recommended: {p.suggestedAction}</p>
                        </div>
                    ))}
                </div>
            </div>

             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-64 shadow-md">
                <h3 className="text-white font-bold mb-4">Task States</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskStats}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{fill: '#334155', opacity: 0.4}}
                        />
                        <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Middle/Right Column: Agent Grid & History */}
        <div className="lg:col-span-2 space-y-6">
            
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-72 shadow-md">
                <h3 className="text-white font-bold mb-4">Operational Efficiency & Cost History</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.history}>
                        <defs>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                        <Area type="monotone" dataKey="efficiency" stroke="#10b981" fillOpacity={1} fill="url(#colorEff)" name="Efficiency %" />
                        <Area type="monotone" dataKey="cost" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" name="Cum. Cost" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
                <h3 className="text-white font-bold mb-4">Enterprise Agent Network</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {agents.map(agent => (
                        <div key={agent.id} className={`border p-3 rounded flex items-center justify-between transition-colors
                            ${agent.status === AgentStatus.OFFLINE ? 'bg-slate-900/50 border-red-900/30 opacity-70' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg
                                    ${agent.type === 'HUMAN' ? 'bg-blue-600' : 
                                      agent.type === 'AI' ? 'bg-pink-600' : 
                                      agent.type === 'MACHINE' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                                    {agent.type[0]}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{agent.name}</p>
                                    <p className="text-xs text-slate-400">{agent.role}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full 
                                    ${agent.status === AgentStatus.WORKING ? 'bg-amber-500/20 text-amber-500' : 
                                      agent.status === AgentStatus.IDLE ? 'bg-slate-600/30 text-slate-400' : 
                                      agent.status === AgentStatus.OFFLINE ? 'bg-red-500/20 text-red-500' :
                                      'bg-purple-500/20 text-purple-400'}`}>
                                    {agent.status}
                                </span>
                                {agent.currentTask && (
                                    <p className="text-[10px] text-cyan-400 mt-1 max-w-[120px] truncate animate-pulse">Working: {agent.currentTask}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-[300px] overflow-hidden flex flex-col shadow-md">
                <h3 className="text-white font-bold mb-4 flex justify-between items-center">
                    <span>System Logs</span>
                    <span className="text-xs font-normal text-slate-500">Live Feed</span>
                </h3>
                <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                    {logs.map(log => (
                        <div key={log.id} className={`text-sm p-2 rounded border-l-2 font-mono
                            ${log.type === 'NEGOTIATION' ? 'border-purple-500 bg-purple-900/5' : 
                              log.type === 'SUCCESS' ? 'border-green-500 bg-green-900/5' :
                              log.type === 'ALERT' ? 'border-red-500 bg-red-900/10' : 
                              log.type === 'EXTERNAL' ? 'border-amber-500 bg-amber-900/5' :
                              'border-blue-500 bg-slate-900/50'}`}>
                            <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                                <span className="uppercase font-bold tracking-wider">{log.type}</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-300 text-xs">{log.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};