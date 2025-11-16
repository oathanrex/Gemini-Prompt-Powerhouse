
import React from 'react';
import type { PromptAnalysis } from '../types';
import { SparklesIcon } from './Icons';

interface AnalysisPanelProps {
  analysis: PromptAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  currentPrompt: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading, error, onAnalyze, currentPrompt }) => {
  return (
    <div className="bg-gray-900 w-full h-full flex flex-col border-l border-gray-700 p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Prompt Analysis</h2>
      <button
        onClick={onAnalyze}
        disabled={isLoading || !currentPrompt.trim()}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed mb-4"
      >
        <SparklesIcon className="w-5 h-5" />
        Analyze Current Prompt
      </button>

      <div className="flex-grow overflow-y-auto bg-gray-800 rounded-lg p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <SparklesIcon className="mx-auto w-10 h-10 animate-spin text-green-400" />
              <p className="mt-2">Analyzing...</p>
            </div>
          </div>
        )}
        {error && <div className="text-red-400">{error}</div>}
        {!isLoading && !error && !analysis && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>Analysis of your prompt will appear here.</p>
              <p className="text-sm">Type a prompt and click "Analyze" to see a breakdown.</p>
            </div>
          </div>
        )}
        {analysis && !isLoading && (
          <div className="space-y-4">
            <AnalysisItem label="Persona" value={analysis.persona} />
            <AnalysisItem label="Task" value={analysis.task} />
            <AnalysisItem label="Domain" value={analysis.domain} />
            <AnalysisItem label="Tone" value={analysis.tone} />
            <AnalysisItem label="Constraints" value={analysis.constraints} />
            <AnalysisItem label="Output Format" value={analysis.outputFormat} />
          </div>
        )}
      </div>
    </div>
  );
};

interface AnalysisItemProps {
  label: string;
  value: string;
}

const AnalysisItem: React.FC<AnalysisItemProps> = ({ label, value }) => (
  <div>
    <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">{label}</h3>
    <p className="text-gray-300 bg-gray-700 p-2 rounded mt-1">{value || 'N/A'}</p>
  </div>
);
