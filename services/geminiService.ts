import { GoogleGenAI, Type } from "@google/genai";
import { Agent, Task, Prediction } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const decomposeOutcomeToTasks = async (outcome: string, context: string): Promise<any[]> => {
  if (!apiKey) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the Central Intelligence Layer of an Autonomous Enterprise. 
      Analyze this strategic outcome: "${outcome}". 
      Context/Constraints: "${context}".
      Break this down into 3-5 distinct, actionable operational tasks that can be assigned to Humans, AI Agents, or Machines.
      Estimate realistic budgets (integer) and priorities.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              requiredCapabilities: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              budget: { type: Type.INTEGER },
              priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }
            },
            required: ["title", "description", "requiredCapabilities", "budget", "priority"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini decomposition failed:", error);
    return [];
  }
};

export const negotiateTaskAssignment = async (task: Task, agents: Agent[]): Promise<{ winnerId: string; reason: string; adjustedCost: number }> => {
  if (!apiKey) {
    // Fallback logic if no key
    const capableAgents = agents.filter(a => 
      task.requiredCapabilities.some(cap => a.capabilities.includes(cap))
    );
    const winner = capableAgents.length > 0 ? capableAgents[0] : agents[0];
    return { 
      winnerId: winner.id, 
      reason: "Fallback: First available agent selected (No API Key).", 
      adjustedCost: task.budget 
    };
  }

  // Filter agents that are somewhat relevant to save context window
  const candidates = agents.filter(a => a.status === 'IDLE' || a.status === 'NEGOTIATING');

  if (candidates.length === 0) {
    throw new Error("No available agents to negotiate with.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Task: ${JSON.stringify(task)}
      
      Available Agents: ${JSON.stringify(candidates.map(a => ({ 
        id: a.id, 
        name: a.name, 
        type: a.type, 
        efficiency: a.efficiency, 
        cost: a.costPerHour,
        capabilities: a.capabilities
      })))}

      Act as the Negotiation Engine. Select the best agent for this task based on:
      1. Capability match (MUST have at least one matching capability).
      2. Cost efficiency (Lower cost is better, but high efficiency justifies higher cost).
      3. Agent type suitability (e.g., Machines for repetitive physical tasks, AI for data, Humans for complex decisions).

      Return the winner ID and a short rationale.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winnerId: { type: Type.STRING },
            reason: { type: Type.STRING },
            adjustedCost: { type: Type.NUMBER }
          },
          required: ["winnerId", "reason", "adjustedCost"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from negotiation engine");
    return JSON.parse(text);

  } catch (error) {
    console.error("Negotiation failed", error);
     // Fallback
     return { 
      winnerId: candidates[0].id, 
      reason: "Negotiation AI failed, assigned to first candidate.", 
      adjustedCost: task.budget 
    };
  }
};

export const analyzeSystemHealth = async (metrics: any, logs: any[]): Promise<string> => {
    if(!apiKey) return "System online. API Key missing for advanced analytics.";
    
    try {
        const recentLogs = logs.slice(0, 10);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze these system metrics and logs. Provide a 2-sentence executive summary of the enterprise health.
            Metrics: ${JSON.stringify(metrics)}
            Logs: ${JSON.stringify(recentLogs)}`,
        });
        return response.text || "Analysis unavailable.";
    } catch (e) {
        return "Analysis unavailable due to error.";
    }
};

export const generatePredictiveInsights = async (tasks: Task[], agents: Agent[]): Promise<Prediction[]> => {
    if (!apiKey) return [];
    try {
        const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'NEGOTIATING');
        const activeAgents = agents.filter(a => a.status !== 'IDLE');
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this enterprise state.
            Active Tasks: ${activeTasks.length}
            Active Agents: ${activeAgents.length}
            Total Agents: ${agents.length}
            
            Identify 1-2 potential risks or optimization opportunities (e.g. bottlenecks, underutilized resources, cost risks, efficiency drops).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            message: { type: Type.STRING },
                            severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                            suggestedAction: { type: Type.STRING }
                        },
                        required: ['message', 'severity', 'suggestedAction']
                    }
                }
            }
        });
        
        const text = response.text;
        if (!text) return [];
        const items = JSON.parse(text);
        return items.map((i: any) => ({
            ...i,
            id: generateId(),
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error("Prediction failed", e);
        return [];
    }
};