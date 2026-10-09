import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '../components/AnimatedCounter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import confetti from 'canvas-confetti';
import { Key, Bot, LayoutDashboard } from 'lucide-react';


interface UsageSummary {
  total_cost: number;
  total_requests: number;
  avg_latency_ms: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Onboarding Wizard State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(1);

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
    const onboarded = localStorage.getItem('secureai-onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }

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

  const finishOnboarding = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    localStorage.setItem('secureai-onboarded', 'true');
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="dark:bg-gray-800 border-none shadow">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 border-none shadow hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-white">
              <AnimatedNumber value={summary?.total_requests || 0} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 border-none shadow hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-white">
              $<AnimatedNumber value={summary?.total_cost || 0} format={(n) => n.toFixed(2)} />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-none shadow hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-white">
              <AnimatedNumber value={summary?.avg_latency_ms || 0} />ms
            </div>
          </CardContent>
        </Card>
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

      {/* Onboarding Wizard */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-2">Welcome to SecureAI Gateway! 🎉</DialogTitle>
            <DialogDescription className="text-center text-base">
              Let's get you set up in less than a minute.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 relative min-h-[180px] flex items-center justify-center">
            {step === 1 && (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <Key className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium">1. Generate an API Key</h3>
                <p className="text-muted-foreground text-sm">
                  Head over to the API Keys tab to create your first gateway key. This will replace your OpenAI/Gemini keys in your app.
                </p>
              </div>
            )}
            {step === 2 && (
              <div className="text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium">2. Test in Playground</h3>
                <p className="text-muted-foreground text-sm">
                  Use the Playground to test out your new key and see how the Gateway routes requests transparently.
                </p>
              </div>
            )}
            {step === 3 && (
              <div className="text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium">3. Monitor Everything</h3>
                <p className="text-muted-foreground text-sm">
                  Come back to this dashboard to see real-time analytics, cost tracking, and latency metrics across all your models.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex sm:justify-between items-center w-full mt-4">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step === s ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
              )}
              {step < 3 ? (
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep(step + 1)}>Next</Button>
              ) : (
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={finishOnboarding}>Get Started!</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
