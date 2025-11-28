import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Agent, Task, Outcome, LogEntry, AgentType, AgentStatus, TaskStatus, SystemMetrics, Prediction } from '../types';
import { decomposeOutcomeToTasks, negotiateTaskAssignment, analyzeSystemHealth, generatePredictiveInsights } from '../services/geminiService';

interface SystemContextType {
  agents: Agent[];
  tasks: Task[];
  outcomes: Outcome[];
  logs: LogEntry[];
  metrics: SystemMetrics;
  predictions: Prediction[];
  isSimulating: boolean;
  systemAnalysis: string;
  addOutcome: (title: string, description: string) => Promise<void>;
  toggleSimulation: () => void;
  resetSystem: () => void;
  deleteTask: (id: string) => void;
  dismissPrediction: (id: string) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

// Mock Initial Agents
const INITIAL_AGENTS: Agent[] = [
  { id: 'a1', name: 'Strategic Planner Core', type: AgentType.AI, role: 'Planner', capabilities: ['Strategy', 'Analysis', 'Planning'], status: AgentStatus.IDLE, efficiency: 98, costPerHour: 5 },
  { id: 'h1', name: 'Sarah Chen', type: AgentType.HUMAN, role: 'Ops Director', capabilities: ['Approval', 'Complex Decision', 'Leadership'], status: AgentStatus.IDLE, efficiency: 85, costPerHour: 150 },
  { id: 'm1', name: 'Fab-Unit-09', type: AgentType.MACHINE, role: 'Assembler', capabilities: ['Assembly', 'Logistics', 'Heavy Lifting'], status: AgentStatus.IDLE, efficiency: 99, costPerHour: 20 },
  { id: 's1', name: 'Netsuite ERP Connector', type: AgentType.SOFTWARE, role: 'Data Pipe', capabilities: ['Finance', 'Inventory', 'Reporting'], status: AgentStatus.IDLE, efficiency: 100, costPerHour: 1 },
  { id: 'a2', name: 'Risk Eval Bot', type: AgentType.AI, role: 'Auditor', capabilities: ['Risk', 'Compliance', 'Security'], status: AgentStatus.IDLE, efficiency: 95, costPerHour: 2 },
  { id: 'h2', name: 'Marcus Thorne', type: AgentType.HUMAN, role: 'Lead Engineer', capabilities: ['Engineering', 'Maintenance', 'QC'], status: AgentStatus.IDLE, efficiency: 90, costPerHour: 120 },
  { id: 's2', name: 'Salesforce Sync', type: AgentType.SOFTWARE, role: 'CRM Integration', capabilities: ['Sales', 'Data', 'Reporting'], status: AgentStatus.IDLE, efficiency: 99, costPerHour: 1 },
];

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [systemAnalysis, setSystemAnalysis] = useState("System Initialized. Waiting for outcomes.");
  const [history, setHistory] = useState<{ time: string; cost: number; efficiency: number }[]>([]);
  
  // Computed metrics
  const metrics: SystemMetrics = {
    totalCost: tasks.reduce((acc, t) => acc + (t.status === TaskStatus.COMPLETED ? t.budget : 0), 0),
    efficiency: agents.reduce((acc, a) => acc + a.efficiency, 0) / (agents.length || 1),
    activeAgents: agents.filter(a => a.status !== AgentStatus.IDLE && a.status !== AgentStatus.OFFLINE).length,
    completedTasks: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    history
  };

  const addLog = (type: LogEntry['type'], message: string, details?: string) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      message,
      details
    }, ...prev].slice(0, 50));
  };

  const addOutcome = async (title: string, description: string) => {
    const newOutcome: Outcome = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      targetDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'ACTIVE',
      progress: 0
    };
    setOutcomes(prev => [...prev, newOutcome]);
    addLog('INFO', `New Strategic Outcome Registered: ${title}`);

    // Call Gemini to decompose
    try {
      const generatedTasks = await decomposeOutcomeToTasks(title, description);
      const newTasks: Task[] = generatedTasks.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        status: TaskStatus.PENDING,
        outcomeId: newOutcome.id,
        progress: 0
      }));

      setTasks(prev => [...prev, ...newTasks]);
      addLog('SUCCESS', `Outcome decomposed into ${newTasks.length} operational tasks.`);
    } catch (err) {
      addLog('ALERT', 'Failed to decompose outcome via AI.');
    }
  };

  const processNegotiations = useCallback(async () => {
    // Find pending tasks
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING);
    
    for (const task of pendingTasks) {
      // Set to negotiating
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: TaskStatus.NEGOTIATING } : t));
      addLog('NEGOTIATION', `Initiating bid protocol for task: ${task.title}`);

      try {
        const result = await negotiateTaskAssignment(task, agents);
        
        // Update Agent
        setAgents(prev => prev.map(a => a.id === result.winnerId ? { ...a, status: AgentStatus.WORKING, currentTask: task.title } : a));
        
        // Update Task
        setTasks(prev => prev.map(t => t.id === task.id ? { 
          ...t, 
          status: TaskStatus.IN_PROGRESS, 
          assignedAgentId: result.winnerId,
          budget: result.adjustedCost 
        } : t));

        addLog('SUCCESS', `Task assigned to ${agents.find(a => a.id === result.winnerId)?.name || 'Unknown Agent'}`, result.reason);

      } catch (e) {
        addLog('ALERT', `Negotiation failed for ${task.title}`);
        // Reset to pending if failed
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: TaskStatus.PENDING } : t));
      }
    }
  }, [tasks, agents]);

  const tickSimulation = useCallback(async () => {
    // Progress tasks that are in progress
    setTasks(prev => prev.map(t => {
      if (t.status === TaskStatus.IN_PROGRESS) {
        const newProgress = Math.min(100, t.progress + Math.random() * 20); // Random progress 0-20% per tick
        if (newProgress >= 100) {
           // Task Complete
           const agentId = t.assignedAgentId;
           // Free up agent
           setAgents(currAgents => currAgents.map(a => a.id === agentId ? { ...a, status: AgentStatus.IDLE, currentTask: undefined } : a));
           addLog('SUCCESS', `Task Completed: ${t.title}`);
           return { ...t, progress: 100, status: TaskStatus.COMPLETED };
        }
        return { ...t, progress: newProgress };
      }
      return t;
    }));

    // Update History
    setHistory(prev => {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newEntry = {
            time: timeStr,
            cost: tasks.reduce((acc, t) => acc + (t.status === TaskStatus.COMPLETED || t.status === TaskStatus.IN_PROGRESS ? t.budget : 0), 0),
            efficiency: agents.reduce((acc, a) => acc + a.efficiency, 0) / (agents.length || 1)
        };
        return [...prev, newEntry].slice(-20); // Keep last 20 ticks
    });

    // Randomly fluctuate agent efficiency
    if (Math.random() > 0.8) {
      setAgents(prev => prev.map(a => ({
        ...a,
        efficiency: Math.max(50, Math.min(100, a.efficiency + (Math.random() * 10 - 5)))
      })));
    }

    // Random Event: Agent Offline
    if (Math.random() > 0.98) {
        const onlineAgents = agents.filter(a => a.status !== AgentStatus.OFFLINE);
        if (onlineAgents.length > 0) {
            const victim = onlineAgents[Math.floor(Math.random() * onlineAgents.length)];
            setAgents(prev => prev.map(a => a.id === victim.id ? { ...a, status: AgentStatus.OFFLINE, currentTask: undefined } : a));
            addLog('EXTERNAL', `Agent ${victim.name} went OFFLINE due to unexpected error/leave.`);
            // If they had a task, fail it or reset it
            setTasks(prev => prev.map(t => t.assignedAgentId === victim.id && t.status === TaskStatus.IN_PROGRESS ? { ...t, status: TaskStatus.PENDING, assignedAgentId: undefined, progress: 0 } : t));
        }
    }

    // Random Event: External Signal
    if (Math.random() > 0.95) {
        addLog('EXTERNAL', `IoT Sensor Array 4 reporting nominal variance in production line.`);
    }

    // Generate Predictions occasionally
    if (Math.random() > 0.95) {
        const newPredictions = await generatePredictiveInsights(tasks, agents);
        if (newPredictions.length > 0) {
            setPredictions(prev => [...newPredictions, ...prev].slice(0, 5));
            addLog('INFO', 'New AI predictive insights available.');
        }
    }
    
    // Process Outcome progress based on tasks
    setOutcomes(prev => prev.map(o => {
      const relatedTasks = tasks.filter(t => t.outcomeId === o.id);
      if (relatedTasks.length === 0) return o;
      const progress = relatedTasks.reduce((acc, t) => acc + t.progress, 0) / relatedTasks.length;
      return { ...o, progress, status: progress >= 100 ? 'COMPLETED' : 'ACTIVE' };
    }));

  }, [tasks, agents]);

  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      processNegotiations();
      interval = setInterval(() => {
        tickSimulation();
        // Occasionally process new negotiations if pending tasks appeared
        processNegotiations();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, processNegotiations, tickSimulation]);

  // Periodic health check
  useEffect(() => {
      if (logs.length > 0 && logs.length % 5 === 0) {
          analyzeSystemHealth(metrics, logs).then(setSystemAnalysis);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs.length]);

  const toggleSimulation = () => setIsSimulating(!isSimulating);
  const resetSystem = () => {
    setTasks([]);
    setOutcomes([]);
    setLogs([]);
    setPredictions([]);
    setHistory([]);
    setAgents(INITIAL_AGENTS);
    setIsSimulating(false);
  };
  
  const deleteTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
  };
  
  const dismissPrediction = (id: string) => {
      setPredictions(prev => prev.filter(p => p.id !== id));
  };

  return (
    <SystemContext.Provider value={{
      agents,
      tasks,
      outcomes,
      logs,
      metrics,
      predictions,
      isSimulating,
      systemAnalysis,
      addOutcome,
      toggleSimulation,
      resetSystem,
      deleteTask,
      dismissPrediction
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};