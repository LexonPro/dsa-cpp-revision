import React from 'react';

const ControlPill = ({ onResetTree, onToggleView, viewMode, droppedCount }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 animate-[slideUpFade_0.5s_ease-out]">
      <div className="rounded-full glass bg-white/5 backdrop-blur-md flex flex-row gap-1 p-1.5 shadow-lg shadow-black/30 border border-white/10">
        
        {/* Reset Tree Button */}
        <div className="relative group">
          <button 
            onClick={onResetTree}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 transition-colors flex items-center justify-center text-white/80 hover:text-white"
            aria-label="Reset Tree"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Badge */}
          {droppedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-black pointer-events-none">
              {droppedCount}
            </span>
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#090d16] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity delay-200 pointer-events-none whitespace-nowrap border border-white/10">
            Reset Tree
          </div>
        </div>

        {/* Toggle View Mode Button */}
        <div className="relative group">
          <button 
            onClick={onToggleView}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 transition-colors flex items-center justify-center text-white/80 hover:text-white"
            aria-label="Toggle View Mode"
          >
            {viewMode === 'canvas' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#090d16] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity delay-200 pointer-events-none whitespace-nowrap border border-white/10">
            Toggle View Mode
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ControlPill;
