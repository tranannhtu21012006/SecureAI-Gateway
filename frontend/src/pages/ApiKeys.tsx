import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Copy, Trash2, Plus } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  is_active: boolean;
  rate_limit: number;
  created_at: string;
  last_used_at: string | null;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const { data } = await api.get('/api/v1/auth/api-keys');
      setKeys(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/v1/auth/api-keys', { name: newKeyName, rate_limit: rateLimit });
      setCreatedKey(data.plain_key);
      setNewKeyName('');
      fetchKeys();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await api.delete(`/api/v1/auth/api-keys/${id}`);
      fetchKeys();
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">API Keys</h1>
      
      {/* Create Key Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Create New Key</h2>
        <form onSubmit={createKey} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Name</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate Limit (/min)</label>
            <input 
              type="number" 
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={rateLimit} onChange={e => setRateLimit(Number(e.target.value))}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Create
          </button>
        </form>
        
        {createdKey && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded flex justify-between items-center">
            <div>
              <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">Please copy your key now. It will not be shown again.</p>
              <code className="text-lg dark:text-white font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">{createdKey}</code>
            </div>
            <button onClick={() => copyToClipboard(createdKey)} className="p-2 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 rounded">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Keys List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{key.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(key.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => deleteKey(key.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
