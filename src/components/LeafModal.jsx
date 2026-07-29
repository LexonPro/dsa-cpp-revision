import React, { useState, useEffect, useRef } from 'react';
import { BRANCH_COLORS } from '../data/treeData';

/* ── Inline SVG Icons (no lucide dependency) ── */
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const TreeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l-7 7h4v4h6v-4h4L12 3zM9 17v4h6v-4" /></svg>
);
const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

/* ── Visualizer SVGs per topic type ── */
const ArrayVisualizer = () => (
  <svg width="280" height="80" viewBox="0 0 280 80" className="opacity-90">
    <defs>
      <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </linearGradient>
    </defs>
    {[0,1,2,3,4,5,6].map(i => (
      <g key={i}>
        <rect x={10+i*38} y={20} width={32} height={40} rx={4} fill="#1e293b" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={26+i*38} y={45} textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="JetBrains Mono">{i}</text>
      </g>
    ))}
    <rect x="0" y="15" width="40" height="50" fill="url(#scanGrad)" rx={4}>
      <animateTransform attributeName="transform" type="translate" values="0,0;250,0;0,0" dur="3s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const TreeVisualizer = () => (
  <svg width="200" height="120" viewBox="0 0 200 120" className="opacity-90">
    <line x1="100" y1="25" x2="55" y2="65" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4">
      <animate attributeName="stroke-dashoffset" values="0;-8" dur="1s" repeatCount="indefinite" />
    </line>
    <line x1="100" y1="25" x2="145" y2="65" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4">
      <animate attributeName="stroke-dashoffset" values="0;-8" dur="1s" repeatCount="indefinite" />
    </line>
    <line x1="55" y1="65" x2="30" y2="100" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4">
      <animate attributeName="stroke-dashoffset" values="0;-8" dur="1.5s" repeatCount="indefinite" />
    </line>
    <line x1="55" y1="65" x2="80" y2="100" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4">
      <animate attributeName="stroke-dashoffset" values="0;-8" dur="1.5s" repeatCount="indefinite" />
    </line>
    {[[100,20],[55,60],[145,60],[30,95],[80,95]].map(([cx,cy],i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={12} fill="#1e1b4b" stroke="#8b5cf6" strokeWidth={2}>
          {i === 0 && <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />}
        </circle>
      </g>
    ))}
  </svg>
);

const GenericVisualizer = () => (
  <svg width="220" height="100" viewBox="0 0 220 100" className="opacity-90">
    {[[40,50],[110,25],[110,75],[180,50]].map(([cx,cy],i) => (
      <circle key={`n${i}`} cx={cx} cy={cy} r={14} fill="#0f2b1e" stroke="#10b981" strokeWidth={2}>
        <animate attributeName="opacity" values="0.6;1;0.6" dur={`${1.5+i*0.3}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[[40,50,110,25],[40,50,110,75],[110,25,180,50],[110,75,180,50]].map(([x1,y1,x2,y2],i) => (
      <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4">
        <animate attributeName="stroke-dashoffset" values="0;-8" dur="1.2s" repeatCount="indefinite" />
      </line>
    ))}
  </svg>
);

const getVisualizer = (nodeId) => {
  if (!nodeId) return <GenericVisualizer />;
  if (nodeId.includes('array') || nodeId.includes('string') || nodeId.includes('stack') || nodeId.includes('linked') || nodeId.includes('search')) return <ArrayVisualizer />;
  if (nodeId.includes('tree') || nodeId.includes('heap') || nodeId.includes('trie')) return <TreeVisualizer />;
  return <GenericVisualizer />;
};

const getDifficultyClasses = (diff) => {
  const d = typeof diff === 'string' ? diff.toLowerCase() : diff?.label?.toLowerCase();
  switch(d) {
    case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  }
};

const getBranchColor = (branchId) => BRANCH_COLORS[branchId] || '#3b82f6';

const LeafModal = ({ node, onClose }) => {
  const [phase, setPhase] = useState('falling');
  const modalRef = useRef(null);

  // Phase transitions
  useEffect(() => {
    let timer;
    if (phase === 'falling') {
      timer = setTimeout(() => setPhase('expanding'), 550);
    } else if (phase === 'expanding') {
      timer = setTimeout(() => setPhase('open'), 400);
    } else if (phase === 'shrinking') {
      timer = setTimeout(() => setPhase('flying_up'), 300);
    } else if (phase === 'flying_up') {
      timer = setTimeout(() => {
        onClose();
      }, 450);
    }
    return () => clearTimeout(timer);
  }, [phase, onClose]);

  // Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && phase === 'open') {
        setPhase('shrinking');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [phase]);

  if (!node) return null;

  const originX = node.originX || window.innerWidth / 2;
  const originY = node.originY || window.innerHeight / 3;
  const branchColor = getBranchColor(node.branch);

  const showBadge = phase === 'falling' || phase === 'flying_up';
  const showModal = phase === 'expanding' || phase === 'open' || phase === 'shrinking';

  // Badge animation styles
  const badgeStyle = {
    position: 'fixed',
    left: originX,
    top: originY,
    zIndex: 60,
    transform: phase === 'falling'
      ? 'translate(-50%, 300px) rotate(12deg)'
      : 'translate(-50%, -50%)',
    opacity: 1,
    transition: phase === 'falling'
      ? 'transform 0.55s cubic-bezier(0.45, 0, 0.55, 1), opacity 0.3s'
      : 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };

  // Modal animation
  const modalStyle = {
    transform: phase === 'open' ? 'scale(1)' : phase === 'shrinking' ? 'scale(0.05)' : 'scale(0.05)',
    opacity: phase === 'open' ? 1 : phase === 'expanding' ? 1 : 0,
    transition: phase === 'open'
      ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease'
      : 'transform 0.35s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.25s ease',
  };

  // Start the scale at 1 once expanding
  if (phase === 'expanding') {
    modalStyle.transform = 'scale(1)';
    modalStyle.opacity = 1;
  }

  const backdropOpacity = (phase === 'expanding' || phase === 'open') ? 1 : 0;

  const handleClose = () => {
    if (phase === 'open') setPhase('shrinking');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{ opacity: backdropOpacity, transition: 'opacity 0.4s ease' }}
        onClick={handleClose}
      />

      {/* Falling/Flying Badge */}
      {showBadge && (
        <div
          className="rounded-full flex items-center justify-center w-14 h-14"
          style={{
            ...badgeStyle,
            background: branchColor,
            boxShadow: `0 0 25px ${branchColor}88, 0 0 60px ${branchColor}44`,
          }}
        >
          <span className="text-2xl">{node.icon || '📦'}</span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          ref={modalRef}
          className="relative w-[95vw] max-w-4xl max-h-[88vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl z-[55]"
          style={{
            ...modalStyle,
            background: 'rgba(9, 13, 22, 0.95)',
            border: `1px solid ${branchColor}33`,
            backdropFilter: 'blur(30px)',
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Colored top accent */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${branchColor}, transparent)` }} />

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10" style={{ background: `${branchColor}08` }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${branchColor}20` }}>
                {node.icon || '📦'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{node.label}</h2>
                {node.difficulty && (
                  <span className={`inline-block mt-1.5 px-3 py-0.5 text-xs font-semibold border rounded-full ${getDifficultyClasses(node.difficulty.label)}`}>
                    {node.difficulty.label}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Overview */}
            <section className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <h3 className="text-base font-semibold mb-3" style={{ color: branchColor, fontFamily: 'Syne, sans-serif' }}>Overview</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{node.introduction || 'No overview available.'}</p>
            </section>

            {/* Interactive Visualizer */}
            <section>
              <h3 className="text-base font-semibold mb-4" style={{ color: branchColor, fontFamily: 'Syne, sans-serif' }}>Interactive Visualizer</h3>
              <div className="w-full h-40 rounded-xl border flex items-center justify-center relative overflow-hidden"
                style={{ borderColor: `${branchColor}30`, background: '#060a12' }}>
                {getVisualizer(node.id)}
              </div>
            </section>

            {/* Sub-topics */}
            {node.subtopics && node.subtopics.length > 0 && (
              <section>
                <h3 className="text-base font-semibold mb-4" style={{ color: branchColor, fontFamily: 'Syne, sans-serif' }}>Key Concepts</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {node.subtopics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all group cursor-default">
                      <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" style={{ color: branchColor }} />
                      <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{topic}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Top Interview Problems */}
            {node.problems && node.problems.length > 0 && (
              <section>
                <h3 className="text-base font-semibold mb-4" style={{ color: branchColor, fontFamily: 'Syne, sans-serif' }}>Top Interview Problems</h3>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.04] text-slate-400 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-5 py-3.5 font-medium">Problem</th>
                        <th className="px-5 py-3.5 font-medium">Difficulty</th>
                        <th className="px-5 py-3.5 font-medium">Pattern</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {node.problems.map((prob, i) => (
                        <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-3.5 font-medium text-slate-200">{prob.name}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-0.5 text-xs font-semibold border rounded-full ${getDifficultyClasses(prob.difficulty)}`}>
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">{prob.pattern}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-white/10 flex justify-end" style={{ background: 'rgba(9,13,22,0.8)' }}>
            <button
              onClick={handleClose}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-white transition-all active:scale-95 btn-gradient text-sm"
            >
              <TreeIcon className="w-4 h-4" />
              Close & Reattach to Tree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafModal;
