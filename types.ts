// FIX: Import `ComponentType` from 'react' to fix "Cannot find namespace 'React'".
import type { ComponentType } from 'react';

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface PromptAnalysis {
  persona: string;
  task: string;
  domain: string;
  tone: string;
  constraints: string;
  outputFormat: string;
}

export interface PromptTemplate {
  title: string;
  prompt: string;
}

export interface PromptCategory {
  name: string;
  icon: ComponentType<{ className?: string }>;
  templates: PromptTemplate[];
}
