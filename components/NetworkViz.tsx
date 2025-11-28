import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Agent, Task, AgentStatus } from '../types';

interface NetworkVizProps {
  agents: Agent[];
  tasks: Task[];
}

export const NetworkViz: React.FC<NetworkVizProps> = ({ agents, tasks }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 400;
    
    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "w-full h-full");

    // Construct graph data
    // Central Node: The "Brain"
    const nodes: any[] = [{ id: 'BRAIN', type: 'BRAIN', r: 30 }];
    const links: any[] = [];

    // Agent Nodes
    agents.forEach(a => {
      nodes.push({ ...a, r: 20 });
      // Connect all agents to Brain initially
      links.push({ source: 'BRAIN', target: a.id, value: 1 });
    });

    // Task Nodes (only active ones)
    tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'NEGOTIATING').forEach(t => {
      nodes.push({ ...t, type: 'TASK', r: 10 });
      if (t.assignedAgentId) {
        links.push({ source: t.assignedAgentId, target: t.id, value: 2 });
      } else {
        links.push({ source: 'BRAIN', target: t.id, value: 1, type: 'negotiating' });
      }
    });

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.r + 5));

    const link = svg.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value) * 2)
      .attr("stroke-dasharray", (d: any) => d.type === 'negotiating' ? "5,5" : "none");

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) => d.r)
      .attr("fill", (d: any) => {
        if (d.type === 'BRAIN') return '#8b5cf6'; // Violet
        if (d.type === 'TASK') return '#eab308'; // Yellow
        if (d.type === 'HUMAN') return '#3b82f6'; // Blue
        if (d.type === 'AI') return '#ec4899'; // Pink
        if (d.type === 'MACHINE') return '#ef4444'; // Red
        return '#10b981'; // Software/Green
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulation) as any);

    node.append("title")
      .text((d: any) => d.name || d.title);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    function drag(sim: any) {
      function dragstarted(event: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [agents, tasks]);

  return (
    <div className="relative w-full h-[400px] bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-inner">
        <div className="absolute top-2 left-2 text-xs text-slate-400 z-10">
            <span className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-violet-500"></div>Brain</span>
            <span className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Human</span>
            <span className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div>AI</span>
            <span className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Machine</span>
            <span className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Task</span>
        </div>
        <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};
