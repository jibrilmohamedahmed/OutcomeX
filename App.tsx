import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Dashboard } from './components/Dashboard';
import { MissionControl } from './components/MissionControl';
import { NetworkViz } from './components/NetworkViz';
import { KanbanBoard } from './components/KanbanBoard';

const OAEApp = () => {
    const { agents, tasks } = useSystem();
    
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
            {/* Top Navigation */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/20">
                                    O
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-2">
                                    <NavLink to="/" className={({isActive}) => `px-4 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-slate-800 text-cyan-400 shadow-inner' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                        Dashboard
                                    </NavLink>
                                    <NavLink to="/kanban" className={({isActive}) => `px-4 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-slate-800 text-cyan-400 shadow-inner' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                        Task Board
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-xs text-slate-500 hidden sm:block">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                System Operational
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                 {/* Top Control Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                         <MissionControl />
                    </div>
                    <div className="lg:col-span-1">
                        <NetworkViz agents={agents} tasks={tasks} />
                    </div>
                </div>

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/kanban" element={<KanbanBoard />} />
                </Routes>
            </main>
        </div>
    );
};

const App = () => (
    <HashRouter>
        <SystemProvider>
            <OAEApp />
        </SystemProvider>
    </HashRouter>
);

export default App;