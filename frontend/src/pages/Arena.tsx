import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Zap, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

const MOCK_RESPONSES = {
  gemini: "Đây là phản hồi từ **Gemini 1.5 Pro**. \n\n```python\ndef hello_world():\n    print('Hello from Gemini!')\n```\n\nTốc độ xử lý khá nhanh và chính xác.",
  openai: "Xin chào! Tôi là **GPT-4o** từ OpenAI. \n\n```javascript\nfunction helloWorld() {\n  console.log('Hello from GPT-4o!');\n}\n```\n\nBạn cần tôi giúp gì thêm không?"
};

export default function Arena() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [responses, setResponses] = useState({ gemini: '', openai: '' });

  const handleSend = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResponses({ gemini: '', openai: '' });
    
    let geminiIndex = 0;
    let openaiIndex = 0;
    
    // Simulate streaming for Gemini
    const geminiInterval = setInterval(() => {
      if (geminiIndex <= MOCK_RESPONSES.gemini.length) {
        setResponses(prev => ({ ...prev, gemini: MOCK_RESPONSES.gemini.slice(0, geminiIndex) }));
        geminiIndex += Math.floor(Math.random() * 5) + 1;
      } else {
        clearInterval(geminiInterval);
      }
    }, 30);

    // Simulate streaming for OpenAI
    const openaiInterval = setInterval(() => {
      if (openaiIndex <= MOCK_RESPONSES.openai.length) {
        setResponses(prev => ({ ...prev, openai: MOCK_RESPONSES.openai.slice(0, openaiIndex) }));
        openaiIndex += Math.floor(Math.random() * 4) + 1; // Slightly slower
      } else {
        clearInterval(openaiInterval);
      }
    }, 40);

    // Stop generation state
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-h-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Model Arena</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Compare LLM outputs side-by-side in real-time</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        {/* Model 1: Gemini */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Gemini 1.5 Pro</span>
            {isGenerating && <span className="ml-auto flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none">
            {responses.gemini ? (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{responses.gemini}</ReactMarkdown>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">Waiting for prompt...</div>
            )}
          </div>
        </div>

        {/* Model 2: OpenAI */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50">
            <Bot className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">GPT-4o</span>
            {isGenerating && <span className="ml-auto flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none">
            {responses.openai ? (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{responses.openai}</ReactMarkdown>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">Waiting for prompt...</div>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <Textarea 
          placeholder="Ask both models simultaneously..."
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[80px] w-full resize-none bg-white dark:bg-[#111] pr-12 text-base shadow-sm focus-visible:ring-indigo-500"
        />
        <Button 
          size="icon" 
          onClick={handleSend}
          disabled={!prompt.trim() || isGenerating}
          className="absolute bottom-3 right-3 rounded-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Send className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
