import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface UsageSummary {
  total_cost: number;
  total_requests: number;
  avg_latency_ms: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for charts since backend analytics might need more complex setup
  const mockLineData = [
    { name: 'Mon', requests: 120 },
    { name: 'Tue', requests: 210 },
    { name: 'Wed', requests: 180 },
    { name: 'Thu', requests: 290 },
    { name: 'Fri', requests: 350 },
    { name: 'Sat', requests: 150 },
    { name: 'Sun', requests: 90 },
  ];

  const mockPieData = [
    { name: 'OpenAI', value: 400 },
    { name: 'Gemini', value: 300 },
    { name: 'Ollama', value: 100 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/api/v1/analytics/usage/summary');
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch summary", error);
        // Fallback for UI testing if backend is not ready
        setSummary({ total_cost: 12.50, total_requests: 1390, avg_latency_ms: 450 });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Requests</div>
          <div className="text-3xl font-bold dark:text-white">{summary?.total_requests}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Cost</div>
          <div className="text-3xl font-bold dark:text-white">${summary?.total_cost.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Latency</div>
          <div className="text-3xl font-bold dark:text-white">{Math.round(summary?.avg_latency_ms || 0)}ms</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Requests over time</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
              <Line type="monotone" dataKey="requests" stroke="#6366F1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Cost by Provider</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={mockPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {mockPieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
