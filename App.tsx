/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { CreationHistory, Creation } from './components/CreationHistory';
import { bringToLife } from './services/gemini';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { UserGroupIcon, CogIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Creation[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage or fetch examples on mount
  useEffect(() => {
    const initHistory = async () => {
      const saved = localStorage.getItem('phasmo_app_history');
      let loadedHistory: Creation[] = [];

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          loadedHistory = parsed.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp)
          }));
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }

      if (loadedHistory.length > 0) {
        setHistory(loadedHistory);
      }
    };

    initHistory();
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (history.length > 0) {
        try {
            localStorage.setItem('phasmo_app_history', JSON.stringify(history));
        } catch (e) {
            console.warn("Local storage full or error saving history", e);
        }
    }
  }, [history]);

  const handleGenerate = async (category: 'GHOSTS' | 'MECHANICS') => {
    setIsGenerating(true);
    setActiveCreation(null);

    let prompt = "";
    let name = "";

    if (category === 'GHOSTS') {
        prompt = "Generate the 'Ultimate Ghost Encyclopedia' Dashboard. Include an interactive Evidence Filter (checkboxes for EMF 5, Spirit Box, etc.) that filters a list of ghosts in real-time. Also include a 'Speed Chart' comparing normal speeds vs hunt speeds for Moroi, Hantu, Revenant, etc.";
        name = "Ghost Encyclopedia";
    } else {
        prompt = "Generate the 'Deep Mechanics Lab' Dashboard. Include interactive tools: A Sanity Drain Calculator (input time in dark/light -> result), a Smudge Stick Timer visualization, and a reference table for Hidden Equipment Stats (flashlight ranges, sensor widths).";
        name = "Deep Mechanics Lab";
    }

    try {
      const html = await bringToLife(prompt);
      
      if (html) {
        const newCreation: Creation = {
          id: crypto.randomUUID(),
          name: name,
          html: html,
          timestamp: new Date(),
        };
        setActiveCreation(newCreation);
        setHistory(prev => [newCreation, ...prev]);
      }

    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Something went wrong while accessing the knowledge base. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setActiveCreation(null);
    setIsGenerating(false);
  };

  const handleSelectCreation = (creation: Creation) => {
    setActiveCreation(creation);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const parsed = JSON.parse(json);
            
            // Basic validation
            if (parsed.html && parsed.name) {
                const importedCreation: Creation = {
                    ...parsed,
                    timestamp: new Date(parsed.timestamp || Date.now()),
                    id: parsed.id || crypto.randomUUID()
                };
                
                // Add to history if not already there (by ID check)
                setHistory(prev => {
                    const exists = prev.some(c => c.id === importedCreation.id);
                    return exists ? prev : [importedCreation, ...prev];
                });

                // Set as active immediately
                setActiveCreation(importedCreation);
            } else {
                alert("Invalid creation file format.");
            }
        } catch (err) {
            console.error("Import error", err);
            alert("Failed to import creation.");
        }
        // Reset input
        if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const isFocused = !!activeCreation || isGenerating;

  return (
    <div className="h-[100dvh] bg-zinc-950 bg-dot-grid text-zinc-50 selection:bg-purple-500/30 overflow-y-auto overflow-x-hidden relative flex flex-col">
      
      {/* Centered Content Container */}
      <div 
        className={`
          min-h-full flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 
          transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
          ${isFocused 
            ? 'opacity-0 scale-95 blur-sm pointer-events-none h-[100dvh] overflow-hidden' 
            : 'opacity-100 scale-100 blur-0'
          }
        `}
      >
        {/* Main Vertical Centering Wrapper */}
        <div className="flex-1 flex flex-col justify-center items-center w-full py-12 md:py-20">
          
          {/* 1. Hero Section */}
          <div className="w-full mb-10 md:mb-16">
              <Hero />
          </div>

          {/* 2. Dual Card Section */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="h-[350px]">
                <InputArea 
                  title="Ghosts" 
                  description="Access the comprehensive Ghost database. Interactive evidence filters, hidden traits, and speed thresholds."
                  icon={<UserGroupIcon />}
                  onClick={() => handleGenerate('GHOSTS')}
                  isGenerating={isGenerating} 
                  disabled={isFocused} 
                />
              </div>
              <div className="h-[350px]">
                <InputArea 
                  title="Mechanics" 
                  description="Explore the math behind the horror. Sanity calculators, looping geometry, and hidden item statistics."
                  icon={<CogIcon />}
                  onClick={() => handleGenerate('MECHANICS')}
                  isGenerating={isGenerating} 
                  disabled={isFocused} 
                />
              </div>
          </div>

        </div>
        
        {/* 3. History Section & Footer - Stays at bottom */}
        <div className="flex-shrink-0 pb-6 w-full mt-auto flex flex-col items-center gap-6">
            <div className="w-full px-2 md:px-0">
                <CreationHistory history={history} onSelect={handleSelectCreation} />
            </div>
            
            <a 
              href="https://x.com/ammaar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors pb-2"
            >
            </a>
        </div>
      </div>

      {/* Live Preview - Always mounted for smooth transition */}
      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        onReset={handleReset}
      />

      {/* Subtle Import Button (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
            onClick={handleImportClick}
            className="flex items-center space-x-2 p-2 text-zinc-500 hover:text-zinc-300 transition-colors opacity-60 hover:opacity-100"
            title="Import Artifact"
        >
            <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Import Guide</span>
            <ArrowUpTrayIcon className="w-5 h-5" />
        </button>
        <input 
            type="file" 
            ref={importInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
        />
      </div>
    </div>
  );
};

export default App;