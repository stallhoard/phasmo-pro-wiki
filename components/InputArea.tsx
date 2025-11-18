/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ArrowRightIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onClick, 
  isGenerating, 
  disabled = false,
  title,
  description,
  icon
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && !isGenerating) {
        onClick();
    }
  };

  return (
    <div className="w-full h-full min-h-[280px] perspective-1000">
      <div 
        className={`relative h-full group transition-all duration-500 ${isHovered ? 'scale-[1.02]' : ''}`}
      >
        <button
          className={`
            relative flex flex-col items-center justify-center
            h-full w-full
            bg-zinc-900/30 
            backdrop-blur-sm
            rounded-xl border
            cursor-pointer overflow-hidden
            transition-all duration-300
            p-6 text-left
            ${isHovered 
              ? 'border-purple-500 bg-zinc-900/50 shadow-[inset_0_0_30px_rgba(168,85,247,0.15)]' 
              : 'border-zinc-800 hover:border-zinc-600'
            }
            ${isGenerating || disabled ? 'opacity-50 pointer-events-none grayscale' : ''}
          `}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
            {/* Technical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            {/* Corner Brackets for technical feel */}
            <div className={`absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 transition-colors duration-300 ${isHovered ? 'border-purple-500' : 'border-zinc-700'}`}></div>
            <div className={`absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 transition-colors duration-300 ${isHovered ? 'border-purple-500' : 'border-zinc-700'}`}></div>
            <div className={`absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 transition-colors duration-300 ${isHovered ? 'border-purple-500' : 'border-zinc-700'}`}></div>
            <div className={`absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 transition-colors duration-300 ${isHovered ? 'border-purple-500' : 'border-zinc-700'}`}></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 w-full">
                <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-500 ${isHovered ? 'scale-110 -translate-y-2' : ''}`}>
                    <div className={`absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-2xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                        {isGenerating ? (
                            <CpuChipIcon className="w-10 h-10 text-purple-400 animate-spin-slow" />
                        ) : (
                           <div className={`w-10 h-10 text-zinc-300 transition-all duration-300 ${isHovered ? 'text-purple-400' : ''}`}>
                               {icon}
                           </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2 w-full">
                    <h3 className="text-3xl text-zinc-100 font-bold tracking-tight">
                        {title}
                    </h3>
                    <p className="text-zinc-500 text-base font-light tracking-wide max-w-xs mx-auto leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className={`
                    flex items-center space-x-2 text-xs font-mono uppercase tracking-widest
                    transition-all duration-300
                    ${isHovered ? 'text-purple-400 translate-y-0 opacity-100' : 'text-zinc-600 translate-y-4 opacity-0'}
                `}>
                   <span>Access Terminal</span>
                   <ArrowRightIcon className="w-3 h-3" />
                </div>
            </div>
        </button>
      </div>
    </div>
  );
};