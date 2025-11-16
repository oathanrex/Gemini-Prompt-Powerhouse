
import React, { useState } from 'react';
import type { ChatThread, PromptCategory } from '../types';
import { PlusIcon, TrashIcon, ChatBubbleLeftRightIcon, BookOpenIcon } from './Icons';
import { PROMPT_LIBRARY } from '../constants';

interface SidebarProps {
  chatHistory: ChatThread[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onSelectTemplate: (prompt: string) => void;
}

type ActiveTab = 'history' | 'library';

export const Sidebar: React.FC<SidebarProps> = ({
  chatHistory,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onSelectTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  
  const sortedHistory = [...chatHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-gray-900 text-white w-full h-full flex flex-col border-r border-gray-700">
      <div className="p-4 flex-shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>
      </div>
      
      <div className="flex justify-around border-b border-gray-700 flex-shrink-0">
        <TabButton
          Icon={ChatBubbleLeftRightIcon}
          label="History"
          isActive={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        />
        <TabButton
          Icon={BookOpenIcon}
          label="Library"
          isActive={activeTab === 'library'}
          onClick={() => setActiveTab('library')}
        />
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'history' && (
          <ChatHistoryList 
            history={sortedHistory}
            activeChatId={activeChatId}
            onSelectChat={onSelectChat}
            onDeleteChat={onDeleteChat}
          />
        )}
        {activeTab === 'library' && (
          <PromptLibrary onSelectTemplate={onSelectTemplate} />
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-indigo-400 border-b-2 border-indigo-400 bg-gray-800'
          : 'text-gray-400 hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
);


interface ChatHistoryListProps {
    history: ChatThread[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ history, activeChatId, onSelectChat, onDeleteChat }) => (
    <nav className="p-2 space-y-1">
        {history.length === 0 ? (
            <p className="text-center text-gray-500 text-sm mt-4">No chats yet.</p>
        ) : (
            history.map((chat) => (
                <a
                    key={chat.id}
                    href="#"
                    onClick={(e) => { e.preventDefault(); onSelectChat(chat.id); }}
                    className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                        activeChatId === chat.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <span className="truncate">{chat.title}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                        aria-label="Delete chat"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </a>
            ))
        )}
    </nav>
);

interface PromptLibraryProps {
    onSelectTemplate: (prompt: string) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelectTemplate }) => (
    <div className="p-2 space-y-4">
        {PROMPT_LIBRARY.map((category) => (
            <div key={category.name}>
                <h3 className="flex items-center gap-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <category.icon className="w-4 h-4" />
                    {category.name}
                </h3>
                <div className="mt-2 space-y-1">
                    {category.templates.map((template) => (
                        <button
                            key={template.title}
                            onClick={() => onSelectTemplate(template.prompt)}
                            className="w-full text-left block px-3 py-2 text-sm text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition-colors duration-150"
                        >
                            {template.title}
                        </button>
                    ))}
                </div>
            </div>
        ))}
    </div>
);
