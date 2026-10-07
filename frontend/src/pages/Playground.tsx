import { useState } from 'react';
import { api } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Playground() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-3.8-flash');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(''); // To test the gateway, we need a valid gateway API key

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // In a real app we'd stream, but for simplicity we'll just do a standard call
      const { data } = await api.post('/api/v1/chat/completions', {
        model,
        provider,
        messages: newMessages,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      }]);
    } catch (error: any) {
      console.error(error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: `Error: ${error.response?.data?.detail || error.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Playground</h1>
        <div className="flex space-x-4">
          <input 
            type="text" 
            placeholder="Gateway API Key..." 
            className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <select 
            value={provider} 
            onChange={e => setProvider(e.target.value)}
            className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="ollama">Ollama</option>
          </select>
          <input 
            type="text" 
            value={model}
            onChange={e => setModel(e.target.value)}
            className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Model name"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 dark:text-gray-400">Assistant is typing...</div>}
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
        <button 
          type="submit" 
          disabled={loading || !apiKey}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
