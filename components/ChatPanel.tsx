
import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../types';
import { SparklesIcon, PaperAirplaneIcon, PaperClipIcon, XCircleIcon } from './Icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (prompt: string, image?: { data: string; mimeType: string }) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onSendMessage }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const data = result.split(',')[1];
        resolve({ data, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === '' && !image) return;

    let imagePayload;
    if (image) {
      imagePayload = await fileToBase64(image.file);
    }

    onSendMessage(prompt, imagePayload);
    setPrompt('');
    setImage(null);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 pt-16">
              <SparklesIcon className="mx-auto w-12 h-12 text-indigo-400" />
              <h2 className="mt-4 text-2xl font-bold">Gemini Prompt Powerhouse</h2>
              <p className="mt-2 text-gray-500">Start a new conversation or select one from your history.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-xl rounded-xl px-4 py-3 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}>
                  {msg.parts.map((part, partIndex) => (
                    <div key={partIndex}>
                      {part.inlineData && (
                        <img
                          src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                          alt="Uploaded content"
                          className="rounded-lg mb-2 max-w-xs"
                        />
                      )}
                      {part.text && <p className="whitespace-pre-wrap">{part.text}</p>}
                    </div>
                  ))}
                  <div className="text-xs text-gray-400 mt-2 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="max-w-xl rounded-xl px-4 py-3 shadow-md bg-gray-700 text-gray-200 rounded-bl-none animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 p-4 bg-gray-900/50 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {image && (
            <div className="relative inline-block mb-2">
              <img src={image.preview} alt="Upload preview" className="h-20 w-20 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-gray-800 rounded-full text-white hover:bg-red-500"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          <div className="relative flex items-end bg-gray-700 rounded-lg p-2">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your prompt here, or use Shift+Enter for a new line..."
              className="w-full bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none resize-none max-h-48"
              rows={1}
              disabled={isLoading}
            />
            <label className="cursor-pointer p-2 text-gray-400 hover:text-white transition-colors">
              <PaperClipIcon className="w-6 h-6" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
            </label>
            <button
              type="submit"
              disabled={isLoading || (prompt.trim() === '' && !image)}
              className="p-2 text-white bg-indigo-600 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
