import React, { useRef, useEffect, useState } from 'react';
import { treeData, leafNodes, BRANCH_COLORS } from '../data/treeData';

/**
 * MotionTreeView — DOM-based alternative tree view using flexbox + SVG connections.
 * Shown when the user toggles from Canvas to Motion view mode.
 */
const MotionTreeView = ({ onNodeClick, onRootClick, droppedLeaves = [] }) => {
  const containerRef = useRef(null);
  const rootRef = useRef(null);
  const branchRefs = useRef({});
  const leafRefs = useRef({});
  const [lines, setLines] = useState([]);

  // Calculate SVG connection lines between nodes
  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current || !rootRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      const newLines = [];

      const rootCx = rootRect.left + rootRect.width / 2 - containerRect.left;
      const rootCy = rootRect.top + rootRect.height / 2 - containerRect.top;

      // Root → Branch junctions
      treeData.branches.forEach((branch) => {
        const branchEl = branchRefs.current[branch.id];
        if (!branchEl) return;
        const branchRect = branchEl.getBoundingClientRect();
        const bx = branchRect.left + branchRect.width / 2 - containerRect.left;
        const by = branchRect.top + branchRect.height / 2 - containerRect.top;

        newLines.push({ x1: rootCx, y1: rootCy, x2: bx, y2: by, color: branch.color, type: 'trunk' });

        // Branch → Leaves
        branch.leaves.forEach((leafId) => {
          const leafEl = leafRefs.current[leafId];
          if (!leafEl) return;
          const leafRect = leafEl.getBoundingClientRect();
          const lx = leafRect.left + leafRect.width / 2 - containerRect.left;
          const ly = leafRect.top + leafRect.height / 2 - containerRect.top;
          newLines.push({ x1: bx, y1: by, x2: lx, y2: ly, color: branch.color, type: 'branch' });
        });
      });

      setLines(newLines);
    };

    updateLines();
    window.addEventListener('resize', updateLines);
    // Delay for layout settle
    const t = setTimeout(updateLines, 200);
    return () => {
      window.removeEventListener('resize', updateLines);
      clearTimeout(t);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex flex-col items-center justify-end pb-24 pt-40 md:pt-48 overflow-auto">
      {/* SVG Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1} y1={line.y1}
            x2={line.x2} y2={line.y2}
            stroke={line.color}
            strokeWidth={line.type === 'trunk' ? 2.5 : 1.5}
            strokeOpacity={0.4}
            strokeDasharray="6 4"
            filter="url(#lineGlow)"
            style={{ animation: 'dash-flow 1.5s linear infinite' }}
          />
        ))}
        <style>{`
          @keyframes dash-flow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -20; }
          }
        `}</style>
      </svg>

      <div className="flex flex-col items-center gap-12 md:gap-16 w-full max-w-6xl px-4 relative" style={{ zIndex: 1 }}>

        {/* Leaf Nodes — grouped by branch */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 w-full">
          {treeData.branches.map((branch) => (
            <div key={branch.id} className="flex flex-col items-center gap-3">
              {branch.leaves.map((leafId) => {
                const leaf = leafNodes[leafId];
                if (!leaf) return null;
                const isDropped = droppedLeaves.includes(leafId);
                return (
                  <div
                    key={leafId}
                    ref={(el) => { leafRefs.current[leafId] = el; }}
                    onClick={() => !isDropped && onNodeClick(leafId)}
                    className={`rounded-xl text-sm px-5 py-2.5 cursor-pointer transition-all duration-300 hover:scale-105 ${isDropped ? 'opacity-20 pointer-events-none scale-95' : 'opacity-100'}`}
                    style={{
                      background: `${branch.color}15`,
                      border: `1px solid ${branch.color}40`,
                      boxShadow: isDropped ? 'none' : `0 0 15px ${branch.color}15`,
                    }}
                  >
                    <span className="text-white/90 font-medium flex items-center gap-2">
                      <span>{leaf.icon}</span>
                      {leaf.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Branch Junctions */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {treeData.branches.map((branch) => (
            <div
              key={branch.id}
              ref={(el) => { branchRefs.current[branch.id] = el; }}
              className="rounded-full px-5 py-2 text-xs font-semibold text-white/80 transition-all duration-300 hover:scale-105"
              style={{
                background: `${branch.color}25`,
                border: `1px solid ${branch.color}50`,
                boxShadow: `0 0 12px ${branch.color}30`,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {branch.label}
            </div>
          ))}
        </div>

        {/* Root Node */}
        <div
          ref={rootRef}
          onClick={onRootClick}
          className="rounded-2xl px-10 py-5 font-bold text-xl cursor-pointer transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-3"
          style={{
            fontFamily: 'Syne, sans-serif',
            background: 'rgba(9, 13, 22, 0.9)',
            border: '2px solid #3b82f6',
            boxShadow: '0 0 25px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.1)',
            backdropFilter: 'blur(20px)',
            color: 'white',
          }}
        >
          <span className="text-2xl">🌳</span>
          Core Foundations & STL
        </div>
      </div>
    </div>
  );
};

export default MotionTreeView;
