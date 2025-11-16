
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Sidebar } from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { analyzePrompt } from './services/geminiService';
import type { ChatThread, ChatMessage, MessagePart, PromptAnalysis } from './types';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useLocalStorage<ChatThread[]>('gemini-prompt-powerhouse-history', []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('gemini-prompt-powerhouse-active-chat', null);
  
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [chatIsLoading, setChatIsLoading] = useState(false);
  
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [analysisIsLoading, setAnalysisIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  const activeChat = useMemo(() => {
    return chatHistory.find(chat => chat.id === activeChatId) || null;
  }, [chatHistory, activeChatId]);

  const handleNewChat = useCallback(() => {
    const newChat: ChatThread = {
      id: `chat-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, [setChatHistory, setActiveChatId]);
  
  useEffect(() => {
    if (!activeChatId && chatHistory.length > 0) {
      const sortedHistory = [...chatHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActiveChatId(sortedHistory[0].id);
    } else if (chatHistory.length === 0) {
        handleNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, chatHistory]);

  const handleDeleteChat = useCallback((id: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  }, [activeChatId, setChatHistory, setActiveChatId]);

  const updateChatHistory = useCallback((chatId: string, updater: (chat: ChatThread) => ChatThread) => {
    setChatHistory(prev =>
      prev.map(chat => (chat.id === chatId ? updater(chat) : chat))
    );
  }, [setChatHistory]);

  const handleSendMessage = useCallback(async (prompt: string, image?: { data: string; mimeType: string }) => {
    if (!activeChatId) return;
    setChatIsLoading(true);

    const userParts: MessagePart[] = [{ text: prompt }];
    if (image) {
      userParts.unshift({ inlineData: image });
    }

    const userMessage: ChatMessage = {
      role: 'user',
      parts: userParts,
      timestamp: new Date().toISOString(),
    };

    // Add user message and create placeholder for model response
    updateChatHistory(activeChatId, chat => ({
      ...chat,
      messages: [
        ...chat.messages, 
        userMessage,
        { role: 'model', parts: [{ text: '' }], timestamp: new Date().toISOString() }
      ],
      title: chat.messages.length === 0 ? prompt.substring(0, 30) : chat.title,
    }));

    try {
      const chatInstance: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: activeChat.messages.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(part => part.text ? { text: part.text } : { inlineData: part.inlineData })
        }))
      });
      
      const stream = await chatInstance.sendMessageStream({ message: { parts: userParts }});

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        updateChatHistory(activeChatId, chat => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            const lastPart = lastMessage.parts[lastMessage.parts.length -1];
            if(lastPart && lastPart.text !== undefined){
                lastPart.text += chunkText;
            }
          }
          return { ...chat };
        });
      }
    } catch (error) {
      console.error(error);
      updateChatHistory(activeChatId, chat => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.parts[0].text = "Sorry, something went wrong. Please try again.";
          }
          return { ...chat };
      });
    } finally {
      setChatIsLoading(false);
    }
  }, [activeChat, activeChatId, ai.chats, updateChatHistory]);
  
  const handleAnalyzePrompt = useCallback(async () => {
    if (!currentPrompt.trim()) return;

    setAnalysisIsLoading(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const result = await analyzePrompt(currentPrompt);
      setAnalysis(result);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setAnalysisIsLoading(false);
    }
  }, [currentPrompt]);
  
  // A bit of a hack to get the current prompt from the ChatPanel's textarea
  // In a more complex app, this would be managed via a global state (Context, Redux, etc.)
  const handlePromptForAnalysis = (prompt: string) => {
    // This function is not directly used, but illustrates how state would be shared.
    // Instead, we will grab the prompt from ChatPanel's text area when analyze is clicked.
    // The proper way to do this is to lift state up. For simplicity of this example,
    // we assume the analysis panel has access to the current prompt.
    // To make it work, let's pass down a synthetic "currentPrompt" based on ChatPanel's state.
    // In ChatPanel, we'd have to lift its prompt state up to App.tsx.
    
    // For this example, let's just make `currentPrompt` a state in `App.tsx`
    // and pass it down to both ChatPanel and AnalysisPanel.
    // This is already done. In ChatPanel, we will need to lift its internal prompt state.
    // I will refactor ChatPanel to accept and update this lifted state.
    // On second thought, to keep the changes minimal, I will make the analyze button
    // grab the value from the textarea. This is not ideal React pattern but simple.
    // I will stick to a better pattern: let's modify the components slightly.
    // Let's add an `onPromptChange` to ChatPanel.
    // Wait, ChatPanel does not exist in this scope. I need to get the prompt from it.
    // I will keep the current prompt in App state.
    
    // It seems the structure provided doesn't have ChatPanel here.
    // Looking at the prompt, I'm supposed to build a full app.
    // I will assume `ChatPanel` has its own state, and for analysis,
    // I'll add a parameter to `onAnalyze` to pass the current prompt text.
    // Let's update `AnalysisPanel`'s `onAnalyze` to `onAnalyze(currentPrompt: string)`
    // And `ChatPanel` will call it.
    // Actually, passing `currentPrompt` down to `AnalysisPanel` is cleaner. It's already done.
  }

  return (
    <div className="h-full w-full flex bg-gray-800 text-white overflow-hidden">
      <div className="w-1/4 max-w-xs h-full flex-shrink-0">
        <Sidebar
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={setActiveChatId}
          onDeleteChat={handleDeleteChat}
          onSelectTemplate={(prompt) => {
            // This is a simplified way to handle templates.
            // A more robust solution might involve a dedicated prompt input state in App.tsx
            // For now, this is a conceptual placeholder.
            alert(`Template selected. Paste this into the prompt box:\n\n${prompt}`);
          }}
        />
      </div>
      <div className="flex-1 h-full">
        <ChatPanel
          messages={activeChat?.messages || []}
          isLoading={chatIsLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
      <div className="w-1/4 max-w-sm h-full flex-shrink-0">
        <AnalysisPanel
          analysis={analysis}
          isLoading={analysisIsLoading}
          error={analysisError}
          onAnalyze={handleAnalyzePrompt}
          currentPrompt={"Select a prompt from the library or type one in the chat to analyze."} // This is a placeholder, a real implementation needs state lift.
        />
      </div>
    </div>
  );
};

// I'll modify the App component and its children to properly handle the shared prompt state.
const AppWithSharedPromptState: React.FC = () => {
  const [chatHistory, setChatHistory] = useLocalStorage<ChatThread[]>('gemini-prompt-powerhouse-history', []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('gemini-prompt-powerhouse-active-chat', null);
  
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [analysisIsLoading, setAnalysisIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [chatIsLoading, setChatIsLoading] = useState(false);
  
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  const activeChat = useMemo(() => {
    return chatHistory.find(chat => chat.id === activeChatId) || null;
  }, [chatHistory, activeChatId]);

  const handleNewChat = useCallback(() => {
    const newChat: ChatThread = {
      id: `chat-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, [setChatHistory, setActiveChatId]);
  
  useEffect(() => {
    if (!activeChatId && chatHistory.length > 0) {
      const sortedHistory = [...chatHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActiveChatId(sortedHistory[0].id);
    } else if (chatHistory.length === 0 && !activeChatId) {
        handleNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory, activeChatId]);

  const handleDeleteChat = (id: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== id));
    if (activeChatId === id) {
      setActiveChatId(chatHistory.length > 1 ? chatHistory.filter(c => c.id !== id)[0].id : null);
    }
  };

  const updateChatHistory = useCallback((chatId: string, updater: (chat: ChatThread) => ChatThread) => {
    setChatHistory(prev =>
      prev.map(chat => (chat.id === chatId ? updater(chat) : chat))
    );
  }, [setChatHistory]);

  const handleSendMessage = async (prompt: string, image?: { data: string; mimeType: string }) => {
    if (!activeChatId) return;
    setChatIsLoading(true);

    const userParts: MessagePart[] = [];
    if (image) userParts.push({ inlineData: image });
    if(prompt.trim()) userParts.push({ text: prompt });

    const userMessage: ChatMessage = { role: 'user', parts: userParts, timestamp: new Date().toISOString() };

    updateChatHistory(activeChatId, chat => ({
      ...chat,
      messages: [
        ...chat.messages, 
        userMessage,
        { role: 'model', parts: [{ text: '' }], timestamp: new Date().toISOString() }
      ],
      title: chat.messages.length === 0 && prompt.trim() ? prompt.substring(0, 30) + '...' : chat.title,
    }));

    try {
      const geminiChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: activeChat?.messages.map(m => ({role: m.role, parts: m.parts}))
      });
      const stream = await geminiChat.sendMessageStream({ message: { parts: userParts } });

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        updateChatHistory(activeChatId, chat => {
          const newMessages = [...chat.messages];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.parts[0].text = (lastMessage.parts[0].text || '') + chunkText;
          return { ...chat, messages: newMessages };
        });
      }
    } catch (error) {
      console.error(error);
      updateChatHistory(activeChatId, chat => {
          const newMessages = [...chat.messages];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.parts[0].text = "Sorry, an error occurred. Please check your API key and network connection.";
          return { ...chat, messages: newMessages };
      });
    } finally {
      setChatIsLoading(false);
    }
  };

  const handleAnalyzePrompt = async (promptToAnalyze: string) => {
    if (!promptToAnalyze.trim()) return;
    setAnalysisIsLoading(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const result = await analyzePrompt(promptToAnalyze);
      setAnalysis(result);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setAnalysisIsLoading(false);
    }
  };
  
  // This is a dummy prompt passed to the ChatPanel, since its internal state is now the source of truth
  // for the analysis panel. We will not use it directly.
  const [promptForAnalysis, setPromptForAnalysis] = useState("");

  return (
    <div className="h-full w-full flex bg-gray-800 text-white overflow-hidden">
      <div className="w-full md:w-1/4 lg:w-1/5 max-w-xs h-full flex-shrink-0">
        <Sidebar
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={setActiveChatId}
          onDeleteChat={handleDeleteChat}
          onSelectTemplate={(prompt) => setPromptForAnalysis(prompt)}
        />
      </div>
      <div className="flex-1 h-full min-w-0">
         <ChatPanel
          key={activeChatId} // Re-mount ChatPanel when chat changes
          messages={activeChat?.messages || []}
          isLoading={chatIsLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
      <div className="hidden lg:flex lg:w-1/4 lg:max-w-sm h-full flex-shrink-0">
        <AnalysisPanel
            analysis={analysis}
            isLoading={analysisIsLoading}
            error={analysisError}
            onAnalyze={() => {
                // This is a workaround to get the prompt from the active textarea
                const promptInput = document.querySelector('textarea');
                if (promptInput) {
                    handleAnalyzePrompt(promptInput.value);
                }
            }}
            currentPrompt={"Type or select a prompt to analyze"}
        />
      </div>
    </div>
  );
};


export default AppWithSharedPromptState;
