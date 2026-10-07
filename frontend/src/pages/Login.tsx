import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects username
      formData.append('password', password);
      
      const { data } = await api.post('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(data.access_token, { id: 'dummy', email, role: 'user' }); // In a real app, you'd decode the JWT or fetch user details
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Sign in to SecureAI</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:bg-gray-700 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:bg-gray-700 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}
