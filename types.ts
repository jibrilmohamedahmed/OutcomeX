export enum AgentType {
  HUMAN = 'HUMAN',
  AI = 'AI',
  MACHINE = 'MACHINE',
  SOFTWARE = 'SOFTWARE'
}

export enum AgentStatus {
  IDLE = 'IDLE',
  NEGOTIATING = 'NEGOTIATING',
  WORKING = 'WORKING',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  role: string;
  capabilities: string[];
  status: AgentStatus;
  efficiency: number; // 0-100
  costPerHour: number;
  currentTask?: string;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  NEGOTIATING = 'NEGOTIATING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  requiredCapabilities: string[];
  budget: number;
  deadline: string; // ISO date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: TaskStatus;
  assignedAgentId?: string;
  outcomeId: string;
  progress: number; // 0-100
}

export interface Outcome {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'AT_RISK';
  progress: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'INFO' | 'NEGOTIATION' | 'ALERT' | 'SUCCESS' | 'EXTERNAL';
  message: string;
  details?: string;
}

export interface Prediction {
  id: string;
  timestamp: number;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedAction: string;
}

export interface SystemMetrics {
  totalCost: number;
  efficiency: number;
  activeAgents: number;
  completedTasks: number;
  history: { time: string; cost: number; efficiency: number }[];
}