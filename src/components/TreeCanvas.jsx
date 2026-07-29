import React, { useRef, useEffect, useState } from 'react';
import { treeData, leafNodes, BRANCH_COLORS } from '../data/treeData';

// Polyfill/fallback for rounded rects if missing
if (CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

const TreeCanvas = ({ onNodeClick, onRootClick, droppedLeaves = [], shockwaveActive, nodePositions }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Nodes are recomputed on resize
  const nodesMeta = useRef({
    root: null,
    junctions: [],
    leaves: [],
    branches: [] // connections
  });

  // Track time
  const timeRef = useRef(0);
  const shockwaveRef = useRef({ active: false, startTime: 0 });

  useEffect(() => {
    if (shockwaveActive) {
      shockwaveRef.current = { active: true, startTime: timeRef.current };
    }
  }, [shockwaveActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = 0;
    let height = 0;
    
    const leafWidth = 120;
    const leafHeight = 40;

    const setupNodes = () => {
      // Setup Root
      const rootPos = { x: width / 2, y: height - 100, radius: 35, id: 'root', type: 'root' };
      
      const junctions = [];
      const leaves = [];
      const branches = [];
      
      const numBranches = treeData.branches.length;
      
      // Calculate branch layout
      // Spread them in an arc
      treeData.branches.forEach((branch, i) => {
        // -1.5, -0.5, 0.5, 1.5
        const offsetMultiplier = i - (numBranches - 1) / 2; 
        const jx = width / 2 + offsetMultiplier * 250;
        const jy = height - 350 - Math.abs(offsetMultiplier) * 80;
        
        const junction = {
          x: jx, y: jy, radius: 20, id: branch.id, color: branch.color || '#fff', type: 'junction', label: branch.label
        };
        junctions.push(junction);
        
        // Add main branch connection
        branches.push({
          from: rootPos,
          to: junction,
          color: junction.color,
          isMain: true
        });

        // Layout leaves for this branch
        const numLeaves = branch.leaves.length;
        branch.leaves.forEach((leafId, li) => {
          const lOffset = li - (numLeaves - 1) / 2;
          const lx = jx + lOffset * 150;
          const ly = jy - 150 - Math.abs(lOffset) * 40;
          
          const leafData = leafNodes[leafId] || {};
          const leaf = {
            x: lx, y: ly, w: leafWidth, h: leafHeight, id: leafId, 
            color: junction.color, type: 'leaf', label: leafData.label || leafId
          };
          leaves.push(leaf);
          
          // Add sub-branch connection
          branches.push({
            from: junction,
            to: leaf,
            color: junction.color,
            isMain: false
          });
        });
      });

      nodesMeta.current = { root: rootPos, junctions, leaves, branches };
      
      if (nodePositions) {
        nodePositions.current = { root: { x: rootPos.x, y: rootPos.y } };
        leaves.forEach(l => {
          nodePositions.current[l.id] = { x: l.x, y: l.y };
        });
      }
    };

    const handleResize = () => {
      const parent = containerRef.current;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
        setupNodes();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Draw functions
    const drawBranch = (branch, time, swProgress) => {
      const { from, to, color, isMain } = branch;
      
      // Control point for quadratic bezier
      const cx = isMain ? from.x : from.x + (to.x - from.x) * 0.1;
      const cy = isMain ? from.y - 150 : to.y + (from.y - to.y) * 0.5;

      // Glow multiplier from shockwave
      let swMultiplier = 1;
      if (swProgress > 0 && swProgress < 1) {
        swMultiplier = 1 + Math.sin(swProgress * Math.PI) * 2;
      }

      ctx.lineCap = 'round';
      
      // Outer glow
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(cx, cy, to.x, to.y);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.15 * swMultiplier;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Mid glow
      ctx.globalAlpha = 0.3 * swMultiplier;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner core
      ctx.globalAlpha = 0.8 * swMultiplier;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Idle pulse along branch
      const pulseT = (time * 0.0005 + (isMain ? 0 : 0.5)) % 1;
      // calc point on bezier
      const px = (1-pulseT)*(1-pulseT)*from.x + 2*(1-pulseT)*pulseT*cx + pulseT*pulseT*to.x;
      const py = (1-pulseT)*(1-pulseT)*from.y + 2*(1-pulseT)*pulseT*cy + pulseT*pulseT*to.y;
      
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px, py, isMain ? 3 : 2, 0, Math.PI*2);
      ctx.fill();

      ctx.globalAlpha = 1.0;
    };

    const drawNode = (node, time, swProgress) => {
      const isHovered = hoveredNodeId === node.id;
      
      if (node.type === 'root') {
        const pulseScale = 1 + Math.sin(time * 0.003) * 0.05;
        const swScale = 1 + (swProgress > 0 && swProgress < 1 ? Math.sin(swProgress * Math.PI) * 0.2 : 0);
        const r = node.radius * pulseScale * swScale;
        
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, 'rgba(59, 130, 246, 0.8)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Syne';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Core Foundations & STL', node.x, node.y + 50);

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

      } else if (node.type === 'junction') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        ctx.fillStyle = '#1e293b'; // dark for contrast if needed, or white
        ctx.font = '11px DM Sans';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(node.label || '', node.x, node.y - 30);
      } else if (node.type === 'leaf') {
        const isDropped = droppedLeaves.includes(node.id);
        ctx.globalAlpha = isDropped ? 0.2 : 1.0;
        
        const w = node.w;
        const h = node.h;
        const hx = node.x - w/2;
        const hy = node.y - h/2;

        if (isHovered && !isDropped) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 15;
        }

        ctx.fillStyle = node.color;
        if (ctx.roundRect) {
          ctx.roundRect(hx, hy, w, h, 8);
          ctx.fill();
        } else {
          ctx.fillRect(hx, hy, w, h);
        }
        
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px DM Sans';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label || node.id, node.x, node.y);
        ctx.globalAlpha = 1.0;

        if (isHovered && !isDropped) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          if (ctx.roundRect) {
            ctx.roundRect(hx - 2, hy - 2, w + 4, h + 4, 10);
            ctx.stroke();
          }
        }
      }
    };

    const render = (time) => {
      timeRef.current = time;
      ctx.clearRect(0, 0, width, height);

      let swProgress = 0;
      if (shockwaveRef.current.active) {
        const elapsed = time - shockwaveRef.current.startTime;
        swProgress = elapsed / 1000; // 1 second duration
        if (swProgress >= 1) {
          shockwaveRef.current.active = false;
          swProgress = 0;
        }
      }

      // Draw Shockwave ring
      if (swProgress > 0) {
        const root = nodesMeta.current.root;
        const maxRadius = Math.max(width, height) * 0.8;
        const ringRadius = maxRadius * swProgress;
        
        ctx.beginPath();
        ctx.arc(root.x, root.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - swProgress) * 0.5})`;
        ctx.lineWidth = 4 * (1 - swProgress);
        ctx.stroke();
      }

      // Draw branches
      nodesMeta.current.branches.forEach(b => drawBranch(b, time, swProgress));
      
      // Draw nodes
      nodesMeta.current.junctions.forEach(n => drawNode(n, time, swProgress));
      nodesMeta.current.leaves.forEach(n => drawNode(n, time, swProgress));
      if (nodesMeta.current.root) {
        drawNode(nodesMeta.current.root, time, swProgress);
      }

      animationFrameId = requestAnimationFrame(render);
    };
    
    render(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [droppedLeaves, hoveredNodeId]); // Re-bind on state change for hover/dropped

  // Interaction handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let hovered = null;
    const { root, leaves } = nodesMeta.current;
    
    if (root) {
      const dx = x - root.x;
      const dy = y - root.y;
      if (dx*dx + dy*dy <= root.radius*root.radius) hovered = root.id;
    }
    
    for (const leaf of leaves) {
      const lx = leaf.x - leaf.w/2;
      const ly = leaf.y - leaf.h/2;
      if (x >= lx && x <= lx + leaf.w && y >= ly && y <= ly + leaf.h) {
        hovered = leaf.id;
        break;
      }
    }
    
    if (hovered !== hoveredNodeId) {
      setHoveredNodeId(hovered);
    }
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { root, leaves } = nodesMeta.current;
    
    if (root) {
      const dx = x - root.x;
      const dy = y - root.y;
      if (dx*dx + dy*dy <= root.radius*root.radius) {
        if (onRootClick) onRootClick();
        return;
      }
    }
    
    for (const leaf of leaves) {
      const lx = leaf.x - leaf.w/2;
      const ly = leaf.y - leaf.h/2;
      if (x >= lx && x <= lx + leaf.w && y >= ly && y <= ly + leaf.h) {
        if (onNodeClick && !droppedLeaves.includes(leaf.id)) {
          onNodeClick(leaf.id);
        }
        return;
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ cursor: hoveredNodeId ? 'pointer' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNodeId(null)}
        onClick={handleClick}
      />
    </div>
  );
};

export default TreeCanvas;
