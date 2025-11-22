import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Package, 
  Settings, 
  TrendingUp, 
  Truck,
  Wrench,
  Shield,
  RefreshCw,
  Bell,
  User,
  MessageSquare
} from 'lucide-react';
import AgentChat from './AgentChat';

/**
 * Smart Factory Dashboard - Green & Grey Theme
 * 
 * Color Scheme:
 * - Background: Green and Grey gradients
 * - Header: Dark grey to green gradient
 * - Cards: White with grey borders
 * - Accents: Green highlights
 * - Text: Dark grey on light backgrounds
 */

const GreenGreyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const [agentData, setAgentData] = useState({
    production: { status: 'operational', alerts: 2, efficiency: 87 },
    inventory: { status: 'warning', alerts: 1, efficiency: 92 },
    logistics: { status: 'operational', alerts: 0, efficiency: 95 },
    maintenance: { status: 'critical', alerts: 3, efficiency: 78 },
    quality: { status: 'operational', alerts: 1, efficiency: 94 }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const agents = ['production', 'inventory', 'logistics', 'maintenance', 'quality'];
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      
      setAgentData(prev => ({
        ...prev,
        [randomAgent]: {
          ...prev[randomAgent],
          efficiency: Math.min(100, Math.max(70, prev[randomAgent].efficiency + (Math.random() - 0.5) * 5))
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-100 to-green-100">
      {/* Header - Dark Grey to Green Gradient */}
      <header className="bg-gradient-to-r from-gray-800 to-green-900 shadow-lg border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Smart Factory MAS</h1>
                <p className="text-sm text-green-200">LLM-Enhanced Multi-Agent System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Chat Toggle Button */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all shadow-md ${
                  showChat 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Agent Chat</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 shadow-md"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button className="relative p-2 text-gray-200 hover:bg-green-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors shadow-md">
                <User className="w-5 h-5 text-gray-200" />
                <span className="text-sm font-medium text-gray-200">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Grey Background */}
      <nav className="bg-gray-200 border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'agents', 'analytics', 'alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${showChat ? 'mr-96' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <OverviewTab agentData={agentData} />}
          {activeTab === 'agents' && <AgentsTab agentData={agentData} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'alerts' && <AlertsTab />}
        </div>
      </main>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-300 shadow-2xl z-50">
          <div className="h-full flex flex-col">
            <div className="p-4 bg-gradient-to-r from-gray-700 to-green-800 border-b border-green-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">Agent Chat</h2>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-green-700 rounded transition-colors"
              >
                <span className="text-2xl text-white">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AgentChat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Overview Tab with Green & Grey Theme
const OverviewTab = ({ agentData }) => {
  const agents = [
    { id: 'production', name: 'Production Agent', icon: Settings, color: 'green' },
    { id: 'inventory', name: 'Inventory Agent', icon: Package, color: 'green' },
    { id: 'logistics', name: 'Logistics Agent', icon: Truck, color: 'gray' },
    { id: 'maintenance', name: 'Maintenance Agent', icon: Wrench, color: 'gray' },
    { id: 'quality', name: 'Quality Control Agent', icon: Shield, color: 'green' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Agents"
          value="5"
          subtitle="All systems active"
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Active Alerts"
          value="7"
          subtitle="3 critical, 4 warnings"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Avg Efficiency"
          value="89%"
          subtitle="+2.3% from yesterday"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="System Uptime"
          value="99.7%"
          subtitle="Last 30 days"
          icon={CheckCircle}
          color="gray"
        />
      </div>

      {/* Agent Status Grid */}
      <div className="bg-white rounded-lg shadow-md border border-gray-300">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-300 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">Agent Status Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-white to-gray-50">
          {agents.map((agent) => {
            const data = agentData[agent.id];
            const Icon = agent.icon;
            const bgColor = agent.color === 'green' ? 'bg-green-50' : 'bg-gray-50';
            const borderColor = agent.color === 'green' ? 'border-green-200' : 'border-gray-300';
            const iconBg = agent.color === 'green' ? 'bg-green-100' : 'bg-gray-200';
            const iconColor = agent.color === 'green' ? 'text-green-700' : 'text-gray-700';
            const barColor = agent.color === 'green' ? 'bg-green-500' : 'bg-gray-500';
            
            return (
              <div 
                key={agent.id}
                className={`${bgColor} border ${borderColor} rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  {getStatusIcon(data.status)}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{agent.name}</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(data.status)}`}>
                      {data.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-medium text-gray-900">{Math.round(data.efficiency)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className={`${barColor} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${data.efficiency}%` }}
                    ></div>
                  </div>
                  
                  {data.alerts > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{data.alerts} active alert{data.alerts > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-md border border-gray-300">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800">Recent Agent Activity</h2>
        </div>
        <div className="p-6 bg-gradient-to-br from-white to-green-50">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const bgGradient = color === 'green' 
    ? 'from-green-50 to-white' 
    : color === 'red'
    ? 'from-red-50 to-white'
    : 'from-gray-50 to-white';
    
  const iconBg = color === 'green' 
    ? 'bg-green-100' 
    : color === 'red'
    ? 'bg-red-100'
    : 'bg-gray-200';
    
  const iconColor = color === 'green' 
    ? 'text-green-700' 
    : color === 'red'
    ? 'text-red-700'
    : 'text-gray-700';

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-lg shadow-md border border-gray-300 p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  );
};

const ActivityTimeline = () => {
  const activities = [
    { agent: 'Maintenance', action: 'Scheduled preventive maintenance for M001', time: '2 min ago', type: 'info' },
    { agent: 'Production', action: 'Optimized production schedule for next shift', time: '15 min ago', type: 'success' },
    { agent: 'Quality', action: 'Detected elevated defect rate on M003', time: '22 min ago', type: 'warning' },
    { agent: 'Inventory', action: 'Reorder triggered for Steel Plate material', time: '45 min ago', type: 'info' },
    { agent: 'Logistics', action: 'Shipment #LS-1142 marked as delivered', time: '1 hour ago', type: 'success' }
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-start space-x-4">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            activity.type === 'success' ? 'bg-green-500' :
            activity.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{activity.agent} Agent</span>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const AgentsTab = ({ agentData }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Agents Overview</h2>
    <p className="text-gray-600">Detailed agent information will be displayed here...</p>
  </div>
);

const AnalyticsTab = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics Dashboard</h2>
    <p className="text-gray-600">Production analytics and metrics will be displayed here...</p>
  </div>
);

const AlertsTab = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Alerts</h2>
    <p className="text-gray-600">System alerts and notifications will be displayed here...</p>
  </div>
);

export default GreenGreyDashboard;