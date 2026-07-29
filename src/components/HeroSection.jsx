import React, { useRef, useState, useCallback } from 'react';
import TreeCanvas from './TreeCanvas';
import MotionTreeView from './MotionTreeView';
import LeafModal from './LeafModal';
import RootDrawer from './RootDrawer';
import ControlPill from './ControlPill';
import { leafNodes } from '../data/treeData';

const HeroSection = ({ searchQuery = "" }) => {
  const [viewMode, setViewMode] = useState('canvas');
  const [activeNode, setActiveNode] = useState(null);
  const [droppedLeaves, setDroppedLeaves] = useState([]);
  const [isRootDrawerOpen, setIsRootDrawerOpen] = useState(false);
  const [shockwaveActive, setShockwaveActive] = useState(false);
  const nodePositions = useRef({});

  const handleNodeClick = useCallback((nodeId, x, y) => {
    setDroppedLeaves(prev => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId];
    });
    const leaf = leafNodes[nodeId];
    if (leaf) {
      setActiveNode({
        ...leaf,
        id: nodeId,
        originX: x || window.innerWidth / 2,
        originY: y || window.innerHeight / 2
      });
    }
  }, []);

  const handleRootClick = useCallback(() => {
    setIsRootDrawerOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (activeNode) {
      setDroppedLeaves(prev => prev.filter(id => id !== activeNode.id));
    }
    setActiveNode(null);
  }, [activeNode]);

  const handleCloseDrawer = useCallback(() => {
    setIsRootDrawerOpen(false);
    setShockwaveActive(false);
  }, []);

  const handleShockwave = useCallback(() => {
    setShockwaveActive(true);
    setTimeout(() => {
      setShockwaveActive(false);
    }, 1500);
  }, []);

  const handleResetTree = useCallback(() => {
    setDroppedLeaves([]);
  }, []);

  const handleToggleView = useCallback(() => {
    setViewMode(prev => prev === 'canvas' ? 'motion' : 'canvas');
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#090d16]">
      {/* Hero Text Overlay */}
      <div className="absolute top-0 left-0 w-full pt-[15vh] md:pt-[20vh] z-10 pointer-events-none flex flex-col items-center text-center px-6">
        <h1 className="font-heading font-extrabold text-5xl md:text-7xl leading-tight text-white drop-shadow-xl">
          Master <span className="text-gradient-multi">DSA</span><br/>
          One Branch at a Time
        </h1>
        <p className="mt-6 text-white/60 max-w-lg mx-auto text-lg drop-shadow">
          Interactive C++ Data Structures & Algorithms learning path
        </p>
      </div>

      {/* Tree View */}
      <div className="absolute inset-0 z-0">
        {viewMode === 'canvas' ? (
          <TreeCanvas 
            onNodeClick={handleNodeClick}
            onRootClick={handleRootClick}
            droppedLeaves={droppedLeaves}
            shockwaveActive={shockwaveActive}
            searchQuery={searchQuery}
            nodePositions={nodePositions}
          />
        ) : (
          <MotionTreeView 
            onNodeClick={(id) => handleNodeClick(id)}
            onRootClick={handleRootClick}
            droppedLeaves={droppedLeaves}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Controls */}
      <ControlPill 
        onResetTree={handleResetTree}
        onToggleView={handleToggleView}
        viewMode={viewMode}
        droppedCount={droppedLeaves.length}
      />

      {/* Modals & Drawers */}
      {activeNode && (
         <LeafModal 
           node={activeNode}
           onClose={handleCloseModal}
         />
      )}
      
      {isRootDrawerOpen && (
         <RootDrawer 
           isOpen={isRootDrawerOpen}
           onClose={handleCloseDrawer}
           onTriggerShockwave={handleShockwave}
         />
      )}
    </section>
  );
};

export default HeroSection;
