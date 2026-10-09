import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [apiKey, setApiKey] = useState('');
  
  // Streaming state
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const simulateStream = async (fullText: string) => {
    setIsStreaming(true);
    setStreamingContent('');
    
    // Simulate streaming word by word or chunk by chunk
    const chunks = fullText.split(/(\s+)/);
    let currentText = '';
    
    for (let i = 0; i < chunks.length; i++) {
      currentText += chunks[i];
      setStreamingContent(currentText);
      await new Promise(r => setTimeout(r, Math.random() * 20 + 10)); // Random delay 10-30ms
    }
    
    setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
    setIsStreaming(false);
    setStreamingContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/v1/chat/completions', {
        model,
        provider,
        messages: newMessages,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const fullContent = data.choices[0]?.message?.content || '';
      await simulateStream(fullContent);
      
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
        <div className="flex space-x-2">
          <Input 
            type="text" 
            placeholder="Gateway API Key..." 
            className="w-48 dark:bg-gray-800"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <div className="w-32">
            <Select value={provider} onValueChange={v => v && setProvider(v)}>
              <SelectTrigger className="dark:bg-gray-800">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input 
            type="text" 
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-40 dark:bg-gray-800"
            placeholder="Model name"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4 backdrop-blur-sm">
        <div className="space-y-6 max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-tl-sm text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}

            {(loading || isStreaming) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-tl-sm text-gray-800 dark:text-gray-200 min-h-[44px] flex items-center max-w-[85%]">
                  {loading && !isStreaming ? (
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {streamingContent + ' ▍'}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto w-full">
        <Input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={apiKey ? "Message AI Gateway..." : "Enter API Key above first..."}
          className="flex-1 rounded-full px-6 bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 h-12"
          disabled={loading || isStreaming || !apiKey}
        />
        <Button 
          type="submit" 
          disabled={loading || isStreaming || !apiKey || !input.trim()}
          className="rounded-full w-12 h-12 p-0 shrink-0 shadow-sm bg-indigo-600 hover:bg-indigo-700 transition-all"
        >
          {loading && !isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
}
