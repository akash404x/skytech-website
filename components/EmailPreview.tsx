'use client';

import { useState } from 'react';
import { Monitor, Smartphone, Moon, Sun } from 'lucide-react';

interface EmailPreviewProps {
  htmlContent: string;
  subject: string;
}

type PreviewMode = 'desktop' | 'mobile';
type ThemeMode = 'light' | 'dark';

export default function EmailPreview({ htmlContent, subject }: EmailPreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const containerStyles = {
    desktop: 'max-w-4xl mx-auto',
    mobile: 'max-w-sm mx-auto',
  };

  const themeStyles = {
    light: 'bg-gray-100',
    dark: 'bg-gray-900',
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-900/50">
      {/* Preview Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Preview Mode:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded transition ${
                previewMode === 'desktop'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Desktop Preview"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded transition ${
                previewMode === 'mobile'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Mobile Preview"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Theme:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setThemeMode('light')}
              className={`p-2 rounded transition ${
                themeMode === 'light'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Light Mode"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`p-2 rounded transition ${
                themeMode === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Dark Mode"
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`p-4 ${themeStyles[themeMode]} transition-colors`}>
        <div className={containerStyles[previewMode]}>
          {/* Email Frame */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-colors">
            {/* Email Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="text-sm font-medium text-gray-900">{subject}</div>
              <div className="text-xs text-gray-500 mt-1">
                From: Sky Tech &lt;contact@theskytechnology.in&gt;
              </div>
            </div>

            {/* Email Body */}
            <div className="p-4">
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
