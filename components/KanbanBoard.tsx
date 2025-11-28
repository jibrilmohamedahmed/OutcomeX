import React from 'react';
import { useSystem } from '../context/SystemContext';
import { TaskStatus, Task } from '../types';

export const KanbanBoard: React.FC = () => {
  const { tasks, deleteTask } = useSystem();

  const columns = [
    { id: TaskStatus.PENDING, title: 'Pending Allocation', color: 'border-slate-500' },
    { id: TaskStatus.NEGOTIATING, title: 'Negotiating', color: 'border-purple-500' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'border-cyan-500' },
    { id: TaskStatus.COMPLETED, title: 'Completed', color: 'border-green-500' },
  ];

  const getColumnTasks = (status: TaskStatus) => tasks.filter(t => t.status === status);

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4 overflow-x-auto pb-4">
      {columns.map(col => (
        <div key={col.id} className="flex-shrink-0 w-80 bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-full shadow-lg">
          <div className={`p-4 border-b-2 ${col.color} bg-slate-900/50 rounded-t-lg`}>
            <h3 className="font-bold text-white flex justify-between items-center">
              {col.title}
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                {getColumnTasks(col.id).length}
              </span>
            </h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {getColumnTasks(col.id).map(task => (
              <div key={task.id} className="bg-slate-900 p-3 rounded border border-slate-700 shadow-sm hover:border-slate-500 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border 
                        ${task.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-900' :
                          task.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-900' : 
                          'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        {task.priority}
                    </span>
                    {task.status === TaskStatus.PENDING && (
                        <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
                <h4 className="text-sm font-medium text-white mb-1 leading-snug">{task.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-2">
                    {task.requiredCapabilities.map(cap => (
                        <span key={cap} className="text-[9px] bg-slate-800 text-slate-500 px-1 rounded">
                            {cap}
                        </span>
                    ))}
                </div>

                {task.status === TaskStatus.IN_PROGRESS && (
                    <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(task.progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                        </div>
                        {task.assignedAgentId && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Assigned to Agent {task.assignedAgentId.substr(0,4)}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono">${task.budget}</span>
                </div>
              </div>
            ))}
            {getColumnTasks(col.id).length === 0 && (
                <div className="text-center py-8 text-slate-600 text-xs border-2 border-dashed border-slate-800 rounded">
                    No tasks
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};