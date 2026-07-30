import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { treeData, leafNodes } from '../data/treeData';

/* ═══════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════ */

const COLORS = {
  linear: new THREE.Color('#3b82f6'),
  nonlinear: new THREE.Color('#8b5cf6'),
  algorithms: new THREE.Color('#10b981'),
  advanced: new THREE.Color('#f59e0b'),
  root: new THREE.Color('#3b82f6'),
  trunk: new THREE.Color('#1e3a5f'),
};

const HEX = {
  linear: '#3b82f6',
  nonlinear: '#8b5cf6',
  algorithms: '#10b981',
  advanced: '#f59e0b',
};

// Build tree layout — root at bottom, branches curve upward
function buildTreeLayout() {
  const rootPos = [0, -3.5, 0];
  const branches = treeData.branches;

  // Spread branches in an arc above the root
  const branchSpread = 3.2;
  const branchY = 0.8;
  const branchPositions = {};
  const leafPositions = {};

  const totalBranches = branches.length;
  branches.forEach((branch, i) => {
    const angle = ((i - (totalBranches - 1) / 2) / totalBranches) * Math.PI * 0.7;
    const x = Math.sin(angle) * branchSpread;
    const z = Math.cos(angle) * 0.8 - 0.5;
    branchPositions[branch.id] = [x, branchY, z];

    // Spread leaves above each branch
    const leafCount = branch.leaves.length;
    branch.leaves.forEach((leafId, li) => {
      const leafAngle = leafCount === 1
        ? 0
        : ((li - (leafCount - 1) / 2) / Math.max(leafCount - 1, 1)) * 0.8;
      const lx = x + Math.sin(angle + leafAngle) * 1.6;
      const ly = branchY + 2.5 + (li % 2) * 0.6;
      const lz = z + Math.cos(angle + leafAngle) * 0.4 + (li % 2) * 0.3;
      leafPositions[leafId] = [lx, ly, lz];
    });
  });

  return { rootPos, branchPositions, leafPositions };
}

/* ═══════════════════════════════════════════
   GLOWING BRANCH (tube geometry along a curve)
═══════════════════════════════════════════ */

function GlowBranch({ start, end, color, pulseSpeed = 1, shockwave = false }) {
  const meshRef = useRef();
  const glowRef = useRef();

  // Create a curved path from start to end
  const { geometry, glowGeometry } = useMemo(() => {
    const mid = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.6,
      (start[2] + end[2]) / 2,
    ];
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end),
    );
    return {
      geometry: new THREE.TubeGeometry(curve, 24, 0.04, 8, false),
      glowGeometry: new THREE.TubeGeometry(curve, 24, 0.12, 8, false),
    };
  }, [start, end]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * pulseSpeed) * 0.3;
    }
    if (glowRef.current) {
      const t = state.clock.elapsedTime;
      glowRef.current.material.opacity = 0.12 + Math.sin(t * pulseSpeed + 0.5) * 0.06;
      if (shockwave) {
        glowRef.current.material.opacity = 0.5;
        glowRef.current.material.emissiveIntensity = 2;
      }
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef} geometry={glowGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
      {/* Core branch */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════
   ROOT NODE — glowing sphere at the base
═══════════════════════════════════════════ */

function RootNode({ position, onClick, shockwave }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.material.emissiveIntensity = 1.0 + Math.sin(t * 1.5) * 0.4;
      meshRef.current.scale.setScalar(hovered ? 1.15 : 1.0);
    }
    // Shockwave ring
    if (ringRef.current) {
      if (shockwave) {
        ringRef.current.visible = true;
        ringRef.current.scale.setScalar(ringRef.current.scale.x + 0.08);
        ringRef.current.material.opacity = Math.max(0, 0.8 - ringRef.current.scale.x * 0.1);
        if (ringRef.current.scale.x > 8) {
          ringRef.current.scale.setScalar(0.5);
        }
      } else {
        ringRef.current.visible = false;
        ringRef.current.scale.setScalar(0.5);
      }
    }
  });

  return (
    <group position={position}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#1e40af"
          emissive="#3b82f6"
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Shockwave ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.8, 1.0, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Label */}
      <Html position={[0, -0.85, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '13px',
          color: 'white',
          textShadow: '0 0 15px rgba(59,130,246,0.8)',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          userSelect: 'none',
        }}>
          Core Foundations & STL
        </div>
      </Html>
    </group>
  );
}

/* ═══════════════════════════════════════════
   BRANCH JUNCTION NODE
═══════════════════════════════════════════ */

function BranchNode({ position, color, label }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <Html position={[0, -0.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.7)',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          userSelect: 'none',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

/* ═══════════════════════════════════════════
   LEAF NODE — interactive badge floating in 3D
═══════════════════════════════════════════ */

function LeafNode({ position, leafId, color, label, icon, isDropped, onClick }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      // Gentle floating bob
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.08;
      // Scale on hover
      const targetScale = hovered ? 1.2 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const hexColor = typeof color === 'string' ? color : `#${color.getHexString()}`;

  return (
    <group ref={groupRef} position={position}>
      <Html center distanceFactor={8} style={{ pointerEvents: isDropped ? 'none' : 'auto' }}>
        <div
          onClick={(e) => { e.stopPropagation(); if (!isDropped) onClick(leafId); }}
          onMouseEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onMouseLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'white',
            padding: '6px 14px',
            borderRadius: '10px',
            background: isDropped
              ? 'rgba(30,30,40,0.3)'
              : `linear-gradient(135deg, ${hexColor}33, ${hexColor}11)`,
            border: `1px solid ${isDropped ? 'rgba(255,255,255,0.05)' : hexColor + '55'}`,
            boxShadow: isDropped ? 'none' : `0 0 18px ${hexColor}30, 0 0 6px ${hexColor}20`,
            cursor: isDropped ? 'default' : 'pointer',
            opacity: isDropped ? 0.25 : 1,
            whiteSpace: 'nowrap',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{icon}</span>
          {label}
        </div>
      </Html>
    </group>
  );
}

/* ═══════════════════════════════════════════
   FLOATING PARTICLES around the tree
═══════════════════════════════════════════ */

function TreeParticles() {
  const ref = useRef();
  const count = 60;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = Math.random() * 8 - 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        pos.array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.002;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#3b82f6"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════
   SCENE — composes all tree elements
═══════════════════════════════════════════ */

function TreeScene({ onNodeClick, onRootClick, droppedLeaves, shockwaveActive }) {
  const layout = useMemo(() => buildTreeLayout(), []);

  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 3]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[-3, 2, -2]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#10b981" />

      {/* Floating particles */}
      <TreeParticles />

      {/* Root node */}
      <RootNode
        position={layout.rootPos}
        onClick={onRootClick}
        shockwave={shockwaveActive}
      />

      {/* Branches and nodes */}
      {treeData.branches.map((branch) => {
        const branchPos = layout.branchPositions[branch.id];
        const color = COLORS[branch.id] || COLORS.root;
        const hexColor = HEX[branch.id] || '#3b82f6';

        return (
          <group key={branch.id}>
            {/* Root → Branch trunk */}
            <GlowBranch
              start={layout.rootPos}
              end={branchPos}
              color={color}
              pulseSpeed={1.2}
              shockwave={shockwaveActive}
            />

            {/* Branch junction */}
            <BranchNode
              position={branchPos}
              color={color}
              label={branch.label}
            />

            {/* Branch → Leaf connections and leaf nodes */}
            {branch.leaves.map((leafId) => {
              const leafPos = layout.leafPositions[leafId];
              const leaf = leafNodes[leafId];
              if (!leafPos || !leaf) return null;

              return (
                <group key={leafId}>
                  <GlowBranch
                    start={branchPos}
                    end={leafPos}
                    color={color}
                    pulseSpeed={0.8}
                    shockwave={shockwaveActive}
                  />
                  <LeafNode
                    position={leafPos}
                    leafId={leafId}
                    color={hexColor}
                    label={leaf.label}
                    icon={leaf.icon}
                    isDropped={droppedLeaves.includes(leafId)}
                    onClick={(id) => {
                      // Get screen-space position for modal animation origin
                      onNodeClick(id);
                    }}
                  />
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Orbit controls — gentle zoom/rotate */}
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={18}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.65}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   TREE CANVAS — Wrapper with R3F Canvas
═══════════════════════════════════════════ */

const TreeCanvas = ({ onNodeClick, onRootClick, droppedLeaves = [], shockwaveActive, nodePositions }) => {
  const handleNodeClick = useCallback((nodeId) => {
    // Pass rough center-screen coords since 3D → 2D projection is complex
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    onNodeClick(nodeId, x, y);
  }, [onNodeClick]);

  return (
    <div className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 1, 10], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <TreeScene
          onNodeClick={handleNodeClick}
          onRootClick={onRootClick}
          droppedLeaves={droppedLeaves}
          shockwaveActive={shockwaveActive}
        />
      </Canvas>
    </div>
  );
};

export default TreeCanvas;
