import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  Zap,
  RefreshCw,
  Cpu,
  Target,
  Clock,
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  MessageSquareText,
  Package, // Used for Inventory
  Truck, // Used for Logistics
} from 'lucide-react';

// --- MANDATORY FIREBASE/ENV SETUP (Required for Canvas Environment) ---
// Note: While this simulation doesn't use Firestore, these global variables must be present.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'smart-mas-default';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
// const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
// --- END MANDATORY SETUP ---

// --- Configuration Constants ---
const AGENTS = [
  { name: 'Production Planner', role: 'Optimizing Schedule', icon: LayoutGrid, color: 'sky' },
  { name: 'Quality Control', role: 'Defect Analysis', icon: Target, color: 'emerald' },
  { name: 'Maintenance Scheduler', role: 'Predictive Faults', icon: Clock, color: 'rose' },
  // ADDED AGENTS:
  { name: 'Inventory Manager', role: 'Material Flow Optimization', icon: Package, color: 'amber' },
  { name: 'Logistics Optimizer', role: 'Supply Chain Routing', icon: Truck, color: 'violet' },
];

const initialMetrics = {
  OEE: 85.2,
  Throughput: 1250,
  Uptime: 98.7,
  AnomalyRate: 0.15,
};

const initialAgentStatuses = AGENTS.reduce((acc, agent) => ({
  ...acc,
  [agent.name]: { status: 'Idle', activity: 'Awaiting Command' }
}), {});

// Utility to get a responsive background color class
const getStatusColor = (status) => {
  switch (status) {
    case 'Online': return 'bg-emerald-600/20 text-emerald-300 ring-emerald-600';
    case 'Anomaly Detected': return 'bg-red-600/20 text-red-400 ring-red-600';
    case 'Optimizing': return 'bg-sky-600/20 text-sky-400 ring-sky-600';
    case 'Checking': return 'bg-yellow-600/20 text-yellow-400 ring-yellow-600';
    case 'Monitoring': return 'bg-amber-600/20 text-amber-400 ring-amber-600'; // New color for Inventory
    case 'Routing': return 'bg-violet-600/20 text-violet-400 ring-violet-600'; // New color for Logistics
    default: return 'bg-gray-700/20 text-gray-400 ring-gray-700';
  }
};

// --- Component Definitions ---

/**
 * Displays the overall System Health Status.
 */
const SystemHealthCard = ({ status }) => {
  const isHealthy = status === 'Online';
  const Icon = isHealthy ? ShieldCheck : AlertTriangle;
  const statusClass = isHealthy ? 'text-emerald-400 bg-emerald-900/50' : 'text-red-400 bg-red-900/50';

  return (
    <div className="p-6 md:p-8 rounded-xl shadow-lg border border-gray-700/50 bg-gray-800/80 transition duration-300 hover:shadow-2xl">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${statusClass}`}>
          <Icon size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">System Health</h2>
          <p className="text-lg font-mono tracking-wider" style={{ color: isHealthy ? '#4ADE80' : '#F87171' }}>
            {status}
          </p>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Status reflects real-time analysis across LLM reasoning, LSTM predictions, and MCP synchronization.
      </div>
    </div>
  );
};

/**
 * Displays a single key manufacturing metric.
 */
const MetricCard = ({ title, value, unit, icon: Icon, color }) => (
  <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-sky-500 transition duration-200">
    <div className={`flex items-center space-x-3 p-2 rounded-lg ${color}`}>
      <Icon size={20} />
      <h3 className="text-sm font-semibold text-gray-300 uppercase">{title}</h3>
    </div>
    <div className="mt-2 pl-2">
      <p className="text-3xl font-extrabold text-white">
        {value.toFixed(unit === '%' || unit === '' ? 2 : 0)}
      </p>
      <p className="text-sm text-gray-400">{unit}</p>
    </div>
  </div>
);

/**
 * Displays the current status and activity of a single agent.
 */
const AgentStatusCard = ({ agent, status }) => {
  const Icon = agent.icon;
  const colorClass = getStatusColor(status.activity);

  return (
    <div className={`p-4 rounded-xl border border-gray-700/50 ${colorClass} transition duration-300`}>
      <div className="flex items-center space-x-3">
        <Icon size={24} className={`text-${agent.color}-400`} />
        <h4 className="text-lg font-bold text-white">{agent.name}</h4>
      </div>
      <div className="mt-2 pl-1">
        <p className="text-xs text-gray-400 font-mono uppercase">Status: {status.status}</p>
        <p className="text-sm text-gray-200 truncate">Activity: {status.activity}</p>
      </div>
    </div>
  );
};

/**
 * Displays the simulated MCP Communication Log.
 */
const ContextLog = ({ log }) => (
  <div className="h-72 overflow-y-auto bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700">
    <div className="flex items-center text-lg font-bold text-sky-400 mb-3">
      <MessageSquareText size={20} className="mr-2" />
      Model Context Protocol (MCP) Log
    </div>
    <div className="space-y-2">
      {log.map((entry, index) => (
        <div key={index} className="text-xs font-mono p-2 rounded-lg bg-gray-700/50 border-l-4 border-sky-600">
          <span className="text-gray-500 mr-2">[{entry.timestamp}]</span>
          <span className="text-white font-semibold">{entry.agent}:</span>
          <span className="text-gray-300 ml-1">{entry.message}</span>
        </div>
      )).reverse()}
    </div>
  </div>
);


// --- Main Application Component ---
const App = () => {
  const [systemStatus, setSystemStatus] = useState('Online');
  const [metrics, setMetrics] = useState(initialMetrics);
  const [agentStatuses, setAgentStatuses] = useState(initialAgentStatuses);
  const [contextLog, setContextLog] = useState([]);
  const [simulationIteration, setSimulationIteration] = useState(0);

  // Function to add a message to the context log
  const addLogEntry = useCallback((agent, message) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setContextLog(prevLog => {
      // Keep only the last 15 entries
      return [{ timestamp, agent, message }, ...prevLog].slice(0, 15);
    });
  }, []);

  // Effect 1: Handles the simulation clock (runs every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationIteration(prev => prev + 1);
    }, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Effect 2: Handles the simulation logic (runs on every clock tick)
  useEffect(() => {
    const iteration = simulationIteration;

    // 1. Simulate Metric Fluctuation (LSTM Data)
    // Generate new metrics locally first
    const newMetrics = {
      OEE: parseFloat((80 + Math.random() * 15).toFixed(2)), // 80-95%
      Throughput: Math.floor(1200 + Math.random() * 200),
      Uptime: parseFloat((95 + Math.random() * 4).toFixed(2)), // 95-99%
      AnomalyRate: parseFloat((0.05 + Math.random() * 0.5).toFixed(2)),
    };
    // Update metrics state once per tick
    setMetrics(newMetrics);

    // 2. Simulate System Anomaly Detection (LLM/LSTM)
    const isAnomaly = newMetrics.AnomalyRate > 0.45;

    // Use functional update for systemStatus to check previous state and update only when necessary
    setSystemStatus(prevStatus => {
      if (isAnomaly && prevStatus === 'Online') {
        addLogEntry('System Monitor', 'HIGH Anomaly Rate detected. Alerting Agents.');
        return 'Anomaly Detected';
      }
      if (!isAnomaly && prevStatus === 'Anomaly Detected') {
        addLogEntry('System Monitor', 'Anomaly resolved. Returning to standard operations.');
        return 'Online';
      }
      return prevStatus; // Return previous status if no status change is needed
    });

    // 3. Simulate Agent Actions (LLM Agentic Reasoning)
    const updateAgentStatus = (agentName, newStatus, newActivity, logMessage = null) => {
      // Use functional update to ensure we read the latest agentStatuses state
      setAgentStatuses(prev => ({
        ...prev,
        [agentName]: { status: newStatus, activity: newActivity }
      }));
      if (logMessage) addLogEntry(agentName, logMessage);
    };

    // Cycle through 5 agents now using iteration % 5
    if (iteration % 5 === 0) {
      // Production Planner (Optimizing)
      const action = isAnomaly ? 'Adjusting schedule due to component quality issue' : 'Optimizing Batch Size based on demand forecast (LLM)';
      updateAgentStatus('Production Planner', 'Active', action, `MCP: Pushing optimized schedule (OEE: ${newMetrics.OEE.toFixed(1)}%)`);
    } else if (iteration % 5 === 1) {
      // Quality Control (Checking/Analyzing)
      const action = isAnomaly ? 'Analyzing sensor data for defect root cause (LSTM)' : 'Running real-time quality check on throughput';
      updateAgentStatus('Quality Control', 'Active', action, `MCP: Sharing Quality Report (Anomaly Rate: ${newMetrics.AnomalyRate}%)`);
    } else if (iteration % 5 === 2) {
      // Maintenance Scheduler (Predictive/Scheduling)
      const action = isAnomaly ? 'Scheduling immediate intervention for machine Z' : 'Predictive maintenance check for machine Y (LSTM)';
      updateAgentStatus('Maintenance Scheduler', 'Active', action, `MCP: Confirming intervention schedule with Production Planner`);
    } else if (iteration % 5 === 3) {
      // Inventory Manager (New Agent)
      const stockLevel = Math.floor(Math.random() * 50) + 50;
      const activity = isAnomaly ? 'Initiating urgent reorder based on production anomaly' : `Checking raw material stock levels (${stockLevel} units)`;
      updateAgentStatus('Inventory Manager', 'Active', activity, `MCP: Broadcasted current stock levels to Logistics Optimizer.`);
    } else if (iteration % 5 === 4) {
      // Logistics Optimizer (New Agent)
      const deliveryTime = (Math.random() * 0.5 + 1.5).toFixed(1); // 1.5 to 2.0 hours
      const activity = isAnomaly ? 'Rerouting inbound materials to avoid congestion' : `Calculating optimal delivery route (ETA: ${deliveryTime} hrs)`;
      updateAgentStatus('Logistics Optimizer', 'Active', activity, `MCP: Updated delivery ETA to Production Planner.`);
    }

    // Agents return to Idle after a small delay
    const idleTimeout = setTimeout(() => {
      setAgentStatuses(prev => {
        const newState = { ...prev };
        for (const name in newState) {
          // Only switch back to Idle if the agent isn't currently mid-activity
          if (newState[name].status === 'Active') {
             newState[name] = { status: 'Idle', activity: 'Awaiting Command' };
          }
        }
        return newState;
      });
    }, 1500);

    return () => clearTimeout(idleTimeout);
    
  }, [simulationIteration, addLogEntry]);


  const agentList = useMemo(() => {
    return AGENTS.map(agent => (
      <AgentStatusCard
        key={agent.name}
        agent={agent}
        status={agentStatuses[agent.name] || { status: 'Unknown', activity: 'Initializing' }}
      />
    ));
  }, [agentStatuses]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-200">
          Smart Manufacturing MAS Control Panel
        </h1>
        <p className="mt-2 text-gray-400 text-lg">
          Project ID: {appId} | Real-Time Agentic AI & Data Streaming Simulation
        </p>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: System Health & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <SystemHealthCard status={systemStatus} />

          {/* Key Metrics Dashboard */}
          <div className="p-6 bg-gray-800/80 rounded-xl shadow-lg border border-gray-700/50">
            <h2 className="text-xl font-bold text-sky-300 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2" /> Key Performance Indicators (KPIs)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                title="OEE (Overall Efficiency)"
                value={metrics.OEE}
                unit="%"
                icon={ShieldCheck}
                color="text-emerald-400 bg-emerald-900/50"
              />
              <MetricCard
                title="Throughput"
                value={metrics.Throughput}
                unit="Units/Hr"
                icon={Zap}
                color="text-cyan-400 bg-cyan-900/50"
              />
              <MetricCard
                title="Machine Uptime"
                value={metrics.Uptime}
                unit="%"
                icon={RefreshCw}
                color="text-indigo-400 bg-indigo-900/50"
              />
              <MetricCard
                title="Anomaly Rate (LSTM)"
                value={metrics.AnomalyRate}
                unit="%"
                icon={AlertTriangle}
                color="text-red-400 bg-red-900/50"
              />
            </div>
          </div>
        </div>

        {/* Column 2: Agent Status */}
        <div className="space-y-6">
          <div className="p-6 bg-gray-800/80 rounded-xl shadow-lg border border-gray-700/50">
            <h2 className="text-xl font-bold text-sky-300 mb-4 flex items-center">
              <Cpu size={20} className="mr-2" /> LLM Agent States
            </h2>
            <div className="space-y-3">
              {agentList}
            </div>
          </div>
        </div>
      </div>

      {/* Context Log Section */}
      <div className="mt-6">
        <ContextLog log={contextLog} />
      </div>

      {/* Footer / Tech Stack */}
      <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
        <p>
          Simulating real-time data from: <span className="font-semibold text-gray-400">LLM (Agentic AI)</span>, <span className="font-semibold text-gray-400">LSTM (PyTorch)</span>, <span className="font-semibold text-gray-400">MCP (Custom Protocol)</span>, <span className="font-semibold text-gray-400">Kafka</span>, and <span className="font-semibold text-gray-400">TimescaleDB</span>.
        </p>
      </div>

    </div>
  );
};

export default App;
