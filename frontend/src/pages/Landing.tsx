import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '../services/auth';
import { Zap, Shield, Key, LineChart } from 'lucide-react';

export default function Landing() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">SecureAI</span>
          </div>
          <div className="flex gap-4 items-center">
            {token ? (
              <Link to="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 border border-indigo-200 dark:border-indigo-500/20"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            SecureAI Gateway 1.0 is now live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8"
          >
            One API to rule them all.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
              Securely.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
          >
            The enterprise-grade LLM gateway. Route requests to OpenAI, Gemini, and Ollama with a single API. Built-in rate limiting, security guards, and cost tracking.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={token ? "/dashboard" : "/register"}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 text-base w-full sm:w-auto shadow-lg shadow-indigo-500/25">
                Start Building for Free
              </Button>
            </Link>
            <a href="#features" className="text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white px-6 py-3 transition-colors">
              Explore features &rarr;
            </a>
          </motion.div>
        </div>
      </section>

      {/* Code Switcher Section */}
      <section className="py-20 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Zero code changes.
                <br />
                Just change the base URL.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                SecureAI Gateway is 100% compatible with the OpenAI SDK. Simply update your BASE_URL and API Key, and you instantly get load balancing, fallbacks, and security logging for free.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Drop-in replacement for OpenAI SDK",
                  "Unified API for Gemini, Anthropic & local models",
                  "Automatic caching & retry logic"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-[#0d1117]">
              <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-gray-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="mx-auto text-xs font-mono text-gray-500">app.py</div>
              </div>
              <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                <span className="text-purple-400">import</span> <span className="text-gray-300">OpenAI</span><br/><br/>
                <span className="text-gray-300">client = OpenAI(</span><br/>
                <span className="text-green-400">  base_url="https://api.secureai.dev/v1",</span> <span className="text-gray-500"># 👈 Just change this</span><br/>
                <span className="text-green-400">  api_key="sk-secureai-...",</span> <span className="text-gray-500">               # 👈 And your key</span><br/>
                <span className="text-gray-300">)</span><br/><br/>
                <span className="text-gray-300">response = client.chat.completions.create(</span><br/>
                <span className="text-green-400">  model="gemini-1.5-flash",</span> <span className="text-gray-500">              # 👈 Works with any model!</span><br/>
                <span className="text-gray-300">  messages=[...]<br/>
                )</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to scale AI</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Enterprise features packed into a developer-friendly platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Prompt Security Guard</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Automatically scan all incoming prompts for jailbreak attempts, PII leaks, and malicious content before they ever reach the LLM provider.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Blazing Fast Cache</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Save up to 80% on LLM costs and reduce latency with our intelligent semantic caching layer.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
              <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">API Key Management</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Issue secure API keys to your team with granular rate limits and budget caps.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center mb-6">
                  <LineChart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track token usage, cost, latency, and errors across all models and providers in one unified dashboard. Never get a surprise bill again.
                </p>
              </div>
              <div className="w-full md:w-1/2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4 shadow-inner">
                {/* Mock Chart */}
                <div className="h-32 flex items-end gap-2 px-2">
                  {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-500/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-900 dark:text-white">SecureAI Gateway</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2026 SecureAI. Open-source enterprise LLM platform.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
