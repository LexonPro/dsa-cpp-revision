import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════
   SINGLE BRANCH SEGMENT — a tapered cylinder
═══════════════════════════════════════════ */

function Branch({ start, end, radiusBottom, radiusTop, color = '#3d2517' }) {
  const { position, quaternion, length } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const dir = e.clone().sub(s);
    const len = dir.length();
    const mid = s.clone().add(e).multiplyScalar(0.5);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: [mid.x, mid.y, mid.z], quaternion: q, length: len };
  }, [start, end]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radiusTop, radiusBottom, length, 8, 1]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   RECURSIVE TREE BRANCHES — generates branch data
═══════════════════════════════════════════ */

function generateBranches(
  origin = [0, 0, 0],
  direction = [0, 1, 0],
  length = 2.2,
  radius = 0.16,
  depth = 0,
  maxDepth = 4,
  seed = 42,
  result = []
) {
  if (depth > maxDepth || radius < 0.012) return result;

  const dir = new THREE.Vector3(...direction).normalize();
  const end = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(length));

  result.push({
    start: origin,
    end: [end.x, end.y, end.z],
    radiusBottom: radius,
    radiusTop: radius * 0.65,
    depth,
  });

  // Deterministic pseudo-random from seed
  const rand = (s) => {
    const x = Math.sin(s * 127.1 + depth * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  const branchCount = depth === 0 ? 3 : depth < 2 ? 3 : 2;
  const spread = 0.35 + depth * 0.08;

  for (let i = 0; i < branchCount; i++) {
    const r1 = rand(seed + i * 7 + depth * 13);
    const r2 = rand(seed + i * 17 + depth * 31);

    // Spread angle
    const angleOffset = ((i / (branchCount - 1 || 1)) - 0.5) * 2.0;
    const yawAngle = angleOffset * spread * Math.PI + (r1 - 0.5) * 0.5;
    const pitchAngle = spread + (r2 - 0.5) * 0.3;

    // Rotate direction
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(dir, up).normalize();
    if (side.length() < 0.1) side.set(1, 0, 0);
    const perpAxis = new THREE.Vector3().crossVectors(dir, side).normalize();

    const newDir = dir.clone()
      .applyAxisAngle(side, pitchAngle)
      .applyAxisAngle(up, yawAngle)
      .normalize();

    generateBranches(
      [end.x, end.y, end.z],
      [newDir.x, newDir.y, newDir.z],
      length * (0.62 + r1 * 0.1),
      radius * 0.58,
      depth + 1,
      maxDepth,
      seed + i * 100 + depth * 50,
      result
    );
  }

  return result;
}

function Trunk() {
  const branches = useMemo(() => generateBranches(), []);

  return (
    <group>
      {branches.map((b, i) => (
        <Branch key={i} start={b.start} end={b.end} radiusBottom={b.radiusBottom} radiusTop={b.radiusTop} />
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════
   CANOPY — dense cluster of green spheres
═══════════════════════════════════════════ */

function CanopyCluster({ position, scale, color, windOffset = 0 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.x = position[0] + Math.sin(t * 0.5 + windOffset) * 0.04;
      ref.current.position.z = position[2] + Math.cos(t * 0.4 + windOffset * 1.3) * 0.03;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} flatShading />
    </mesh>
  );
}

function Canopy() {
  const clusters = useMemo(() => {
    const items = [];
    const greens = ['#2d6b30', '#3a8f3e', '#4caf50', '#388e3c', '#2e7d32', '#43a047', '#1b5e20', '#66bb6a'];
    const cY = 5.0;

    // Pseudo-random for deterministic layout
    const srand = (s) => {
      const x = Math.sin(s * 9.1 + 47.3) * 43758.5453;
      return x - Math.floor(x);
    };

    // Dense core layer
    for (let i = 0; i < 50; i++) {
      const theta = srand(i * 3.1) * Math.PI * 2;
      const phi = Math.acos(2 * srand(i * 7.3) - 1);
      const r = 1.0 + srand(i * 11.7) * 1.8;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) * 0.5 + cY;
      const z = r * Math.sin(phi) * Math.sin(theta);

      items.push({
        position: [x, y, z],
        scale: 0.45 + srand(i * 5.3) * 0.65,
        color: greens[Math.floor(srand(i * 2.1) * greens.length)],
        windOffset: srand(i * 13.7) * 10,
      });
    }

    // Outer shell for rounded silhouette
    for (let i = 0; i < 35; i++) {
      const theta = srand(100 + i * 4.7) * Math.PI * 2;
      const phi = Math.acos(2 * srand(100 + i * 9.1) - 1);
      const r = 2.0 + srand(100 + i * 6.3) * 0.8;
      const x = r * Math.sin(phi) * Math.cos(theta) * 1.1;
      const y = r * Math.cos(phi) * 0.4 + cY;
      const z = r * Math.sin(phi) * Math.sin(theta) * 1.1;

      items.push({
        position: [x, y, z],
        scale: 0.35 + srand(100 + i * 3.7) * 0.5,
        color: greens[Math.floor(srand(100 + i * 8.3) * greens.length)],
        windOffset: srand(100 + i * 11.1) * 10,
      });
    }

    // Top dome cap
    for (let i = 0; i < 18; i++) {
      const theta = srand(200 + i * 5.3) * Math.PI * 2;
      const r = srand(200 + i * 7.7) * 1.4;
      const x = r * Math.cos(theta);
      const y = cY + 1.6 + srand(200 + i * 3.1) * 0.7;
      const z = r * Math.sin(theta);

      items.push({
        position: [x, y, z],
        scale: 0.4 + srand(200 + i * 9.3) * 0.45,
        color: greens[Math.floor(srand(200 + i * 2.7) * greens.length)],
        windOffset: srand(200 + i * 15.1) * 10,
      });
    }

    return items;
  }, []);

  return (
    <group>
      {clusters.map((c, i) => (
        <CanopyCluster key={i} {...c} />
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════
   GROUND PLANE
═══════════════════════════════════════════ */

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <circleGeometry args={[8, 64]} />
      <meshStandardMaterial color="#0c1a0c" roughness={1} metalness={0} transparent opacity={0.5} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   FIREFLIES
═══════════════════════════════════════════ */

function Fireflies() {
  const ref = useRef();
  const count = 35;

  const [positions, baseY] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const by = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.sin(i * 7.3) * 0.5 + 0.5 - 0.5) * 10;
      pos[i * 3 + 1] = Math.sin(i * 3.1) * 3 + 4;
      pos[i * 3 + 2] = (Math.cos(i * 11.7) * 0.5 + 0.5 - 0.5) * 8;
      by[i] = pos[i * 3 + 1];
    }
    return [pos, by];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      const attr = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        attr.array[i * 3 + 1] = baseY[i] + Math.sin(t * 0.5 + i * 0.9) * 0.25;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#a0f0a0" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ═══════════════════════════════════════════
   FULL SCENE
═══════════════════════════════════════════ */

function TreeScene() {
  const treeRef = useRef();

  useFrame((state) => {
    if (treeRef.current) {
      const t = state.clock.elapsedTime;
      treeRef.current.rotation.z = Math.sin(t * 0.25) * 0.006;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#b0c4de" />
      <directionalLight position={[5, 8, 3]} intensity={1.0} color="#fff8e7" />
      <directionalLight position={[-3, 6, -2]} intensity={0.3} color="#87ceeb" />
      <pointLight position={[0, 3, 5]} intensity={0.15} color="#3b82f6" />

      <fog attach="fog" args={['#090d16', 14, 28]} />

      <Ground />

      <group ref={treeRef}>
        <Trunk />
        <Canopy />
      </group>

      <Fireflies />

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.55}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.05}
        target={[0, 3.5, 0]}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   EXPORT — keeps the same prop interface
═══════════════════════════════════════════ */

const TreeCanvas = ({ onNodeClick, onRootClick, droppedLeaves = [], shockwaveActive, nodePositions }) => {
  return (
    <div className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 4, 12], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <TreeScene />
      </Canvas>
    </div>
  );
};

export default TreeCanvas;
