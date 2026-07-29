import React, { useEffect, useRef } from 'react';
import { rootContent } from '../data/treeData.js';

/* ── Inline SVG Icons ── */
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const ZapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

const RootDrawer = ({ isOpen, onClose, onShockwave, onTriggerShockwave }) => {
  const drawerRef = useRef(null);
  const shockwaveFn = onShockwave || onTriggerShockwave;

  // Trigger shockwave when drawer opens
  useEffect(() => {
    if (isOpen && shockwaveFn) {
      shockwaveFn();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-[420px] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'rgba(9, 13, 22, 0.97)',
          borderLeft: '1px solid rgba(59, 130, 246, 0.15)',
          backdropFilter: 'blur(30px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Core Foundations & STL"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative overflow-hidden" style={{ background: 'rgba(59, 130, 246, 0.04)' }}>
          {/* Animated top accent line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-xl bg-blue-500/15">
              <ZapIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'Syne, sans-serif' }}>
              Core Foundations & STL
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative z-10"
            aria-label="Close drawer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {rootContent?.sections?.map((section, idx) => (
            <div
              key={idx}
              className="rounded-xl p-5 relative group overflow-hidden transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: '4px solid #3b82f6',
              }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <h3 className="text-base font-semibold text-white mb-4 inline-block relative" style={{ fontFamily: 'Syne, sans-serif' }}>
                {section.heading}
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
              </h3>

              <ul className="space-y-2.5 relative z-10">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 group/item">
                    <CheckIcon className="w-4 h-4 text-blue-500/60 shrink-0 mt-0.5 group-hover/item:text-blue-400 transition-colors" />
                    <span className="text-slate-300 text-sm leading-relaxed group-hover/item:text-white transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {(!rootContent || !rootContent.sections) && (
            <div className="text-center text-slate-400 p-10 border border-dashed border-slate-700 rounded-xl">
              <p>No content available.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10" style={{ background: 'rgba(9,13,22,0.9)' }}>
          <button
            className="w-full py-3.5 rounded-xl font-semibold text-white btn-gradient shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
            onClick={onClose}
          >
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default RootDrawer;
