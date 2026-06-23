/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MONOREPO_FILES, downloadMonorepoZip } from '../../monorepoGenerator';
import { 
  FileCode, Terminal, HelpCircle, HardDrive, Download, CheckCircle, 
  ArrowRight, Key, Sparkles, AlertCircle, Copy, Check
} from 'lucide-react';

interface ExportSuiteProps {
  onNotify: (msg: string) => void;
}

export default function ExportSuite({ onNotify }: ExportSuiteProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedFileIndex, setCopiedFileIndex] = useState<number | null>(null);

  const activeFile = MONOREPO_FILES[selectedFileIndex] || MONOREPO_FILES[0];

  const handleDownloadZip = () => {
    setDownloading(true);
    setDownloadSuccess(false);

    // Run the JSZip compiler asynchronously
    downloadMonorepoZip(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      onNotify('ORRIS Production Monorepo compiled and downloaded successfully!');
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    });
  };

  const handleCopyCode = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedFileIndex(idx);
    onNotify('Codeblock copied to dashboard clipboard!');
    setTimeout(() => {
      setCopiedFileIndex(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 selection:bg-[#C9A96E] selection:text-black">
      
      {/* Header Area */}
      <div className="mb-10 pb-6 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded font-bold uppercase tracking-widest inline-block mb-3.5">
            Full-Stack Next.js 15 Monorepo Code Hub
          </span>
          <h1 className="text-3xl font-light tracking-tight font-serif text-neutral-900 leading-tight">
            The ORRIS Export Studio
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed max-w-2xl">
            We formulated the exact Next.js 15 App Router architecture you requested. All files are fully implemented with Prisma ORM database entities and ready for direct local deployment.
          </p>
        </div>

        {/* Dynamic primary exporter trigger */}
        <button 
          onClick={handleDownloadZip}
          disabled={downloading}
          className={`px-8 py-4 ${
            downloadSuccess 
              ? 'bg-emerald-600 text-white' 
              : 'bg-black hover:bg-[#C9A96E] hover:text-[#0c0c0c] text-[#C9A96E]'
          } font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50`}
          id="export-trigger-primary-btn"
        >
          {downloading ? (
            <>
              <Terminal className="w-4 h-4 animate-spin" />
              <span>Building ZIP Bundle...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>ZIP Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Monorepo ZIP</span>
            </>
          )}
        </button>
      </div>

      {/* Side-By-Side Code Hub Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Left Hand: Monorepo files file structure hierarchy selection */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-neutral-150 p-5 rounded-lg shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-[#737373] block mb-4 font-mono font-bold flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-[#C9A96E]" />
            Workspace Repository Tree
          </span>

          <div className="flex flex-col gap-1.5">
            {MONOREPO_FILES.map((file, idx) => {
              const active = idx === selectedFileIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`text-left text-xs px-3.5 py-3 rounded font-mono truncate transition-all flex items-center justify-between border ${
                    active 
                      ? 'bg-neutral-50 border-[#C9A96E] text-black font-semibold' 
                      : 'bg-white border-transparent text-[#52525B] hover:bg-neutral-50/50'
                  }`}
                  id={`export-file-spec-${idx}`}
                >
                  <span className="flex items-center gap-2">
                    <FileCode className={`w-3.5 h-3.5 ${active ? 'text-[#C9A96E]' : 'text-neutral-400'}`} />
                    <span>{file.path}</span>
                  </span>
                  <span className="text-[9px] text-[#A1A1AA]">
                    {file.content.split('\n').length} lines
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick instructions panel details */}
          <div className="mt-6 pt-5 border-t border-neutral-150 text-[11px] text-neutral-500 leading-relaxed font-sans">
            <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-900 block mb-2 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              Database Alignment Info
            </span>
            <p className="mb-3">
              This code defines complete SQL tables in Prisma which connect securely into your PostgreSQL database.
            </p>
            <div className="bg-neutral-50 border border-neutral-100 p-2.5 rounded font-mono text-[10px] text-neutral-700/80">
              User ID UUIDs, featured items indexing, billing schema tables, and order cascade deletions are configured correctly and securely.
            </div>
          </div>
        </div>

        {/* Right Hand: Code Highlighting and Viewer */}
        <div className="lg:col-span-8 bg-[#0F0F0F] text-neutral-100 rounded-lg overflow-hidden border border-neutral-800 shadow-2xl relative">
          
          {/* Header viewport info */}
          <div className="bg-[#1C1C1E] px-5 py-4 flex justify-between items-center border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span className="text-xs font-mono text-neutral-400 border-l border-neutral-800 pl-3.5 ml-2">
                {activeFile.path}
              </span>
            </div>

            <button
              onClick={() => handleCopyCode(activeFile.content, selectedFileIndex)}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
              title="Copy code Block to Clipboard"
              id="copy-code-btn"
            >
              {copiedFileIndex === selectedFileIndex ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Textarea viewing code viewport */}
          <div className="p-6 overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre className="font-mono text-xs text-[#E4E4E7] leading-relaxed select-text cursor-text">
              <code>{activeFile.content}</code>
            </pre>
          </div>

          <div className="bg-[#1C1C1E] border-t border-neutral-800 px-5 py-2.5 text-[10px] text-neutral-450 font-mono flex justify-between">
            <span>Encoding: UTF-8</span>
            <span>Lines Count: {activeFile.content.split('\n').length}</span>
          </div>
        </div>

      </div>

      {/* local deployment step by step guide */}
      <div className="bg-white border border-neutral-150 p-6 md:p-8 rounded-lg shadow-sm">
        <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-900 border-b border-neutral-200 pb-3.5 mb-6 font-mono flex items-center gap-2">
          <Terminal className="w-4.5 h-4.5 text-[#C9A96E]" />
          <span>Local Deployment Sledgehammer Guidelines</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans text-xs">
          
          <div className="p-4 bg-neutral-50 rounded border border-neutral-100 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-full flex items-center justify-center font-mono mb-3">01</span>
              <p className="font-bold text-neutral-900 mb-1 leading-none uppercase tracking-wide text-[10px]">Unpack ZIP</p>
              <p className="text-neutral-500 font-light text-[11px] leading-relaxed mt-1.5">Extract the downloaded ZIP package onto your local developer folder.</p>
            </div>
            <code className="block bg-[#1a1a1a] text-amber-500 p-2 text-[9px] rounded font-mono mt-4">unzip orris-premium-monorepo.zip</code>
          </div>

          <div className="p-4 bg-neutral-50 rounded border border-neutral-100 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-full flex items-center justify-center font-mono mb-3">02</span>
              <p className="font-bold text-neutral-900 mb-1 leading-none uppercase tracking-wide text-[10px]">Install Yarns</p>
              <p className="text-neutral-500 font-light text-[11px] leading-relaxed mt-1.5">Run npm install to populate your node dependencies in strict mode.</p>
            </div>
            <code className="block bg-[#1a1a1a] text-amber-500 p-2 text-[9px] rounded font-mono mt-4">npm install</code>
          </div>

          <div className="p-4 bg-neutral-50 rounded border border-neutral-100 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-full flex items-center justify-center font-mono mb-3">03</span>
              <p className="font-bold text-neutral-900 mb-1 leading-none uppercase tracking-wide text-[10px]">Prisma Align</p>
              <p className="text-neutral-500 font-light text-[11px] leading-relaxed mt-1.5">Push SQL schemas into local or cloud databases (e.g. Supabase, AWS).</p>
            </div>
            <code className="block bg-[#1a1a1a] text-amber-500 p-2 text-[9px] rounded font-mono mt-4">npx prisma db push</code>
          </div>

          <div className="p-4 bg-neutral-50 rounded border border-neutral-100 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-full flex items-center justify-center font-mono mb-3">04</span>
              <p className="font-bold text-neutral-900 mb-1 leading-none uppercase tracking-wide text-[10px]">Seed & Drive</p>
              <p className="text-neutral-500 font-light text-[11px] leading-relaxed mt-1.5">Inject mockup products and launch hot development environment.</p>
            </div>
            <code className="block bg-[#1a1a1a] text-amber-500 p-2 text-[9px] rounded font-mono mt-4">npm run seed && npm run dev</code>
          </div>

        </div>

        <div className="mt-8 p-3 bg-neutral-50 border border-neutral-150 rounded flex items-center gap-2 text-[11px] text-neutral-500">
          <AlertCircle className="w-4.5 h-4.5 text-[#C9A96E] flex-shrink-0" />
          <span>Note: After deploying correctly on Vercel, Stripe webhooks must be linked back to `/api/webhooks` endpoint for real-time payments automation.</span>
        </div>
      </div>

    </div>
  );
}
