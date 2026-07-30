import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════
   PROCEDURAL TREE TRUNK — recursive branching cylinders
═══════════════════════════════════════════ */

function createBranchGeometries(
  origin = [0, 0, 0],
  direction = [0, 1, 0],
  length = 2.5,
  radius = 0.18,
  depth = 0,
  maxDepth = 4,
  segments = []
) {
  if (depth > maxDepth || radius < 0.015) return segments;

  const dir = new THREE.Vector3(...direction).normalize();
  const end = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(length));

  segments.push({ start: new THREE.Vector3(...origin), end, radius, depth });

  // Branch splits
  const branchCount = depth === 0 ? 3 : depth < 2 ? 3 : 2;
  const spreadAngle = depth === 0 ? 0.4 : 0.5 + depth * 0.1;

  for (let i = 0; i < branchCount; i++) {
    const angle = ((i / (branchCount - 1 || 1)) - 0.5) * spreadAngle * 2;
    const tiltAxis = new THREE.Vector3(
      Math.cos(angle + i * 2.1) * 0.8,
      0.6 - depth * 0.05,
      Math.sin(angle + i * 1.7) * 0.8
    ).normalize();

    // Rotate direction
    const newDir = dir.clone().applyAxisAngle(
      new THREE.Vector3(tiltAxis.z, 0, -tiltAxis.x).normalize(),
      spreadAngle + (Math.random() - 0.5) * 0.3
    );

    createBranchGeometries(
      [end.x, end.y, end.z],
      [newDir.x, newDir.y, newDir.z],
      length * (0.65 + Math.random() * 0.1),
      radius * 0.6,
      depth + 1,
      maxDepth,
      segments
    );
  }

  return segments;
}

function Trunk() {
  const meshRef = useRef();

  const mergedGeometry = useMemo(() => {
    const segments = createBranchGeometries();
    const geometries = [];

    segments.forEach((seg) => {
      const dir = seg.end.clone().sub(seg.start);
      const len = dir.length();
      const mid = seg.start.clone().add(seg.end).multiplyScalar(0.5);

      const geo = new THREE.CylinderGeometry(
        seg.radius * 0.7, // top (thinner)
        seg.radius,        // bottom
        len,
        seg.depth < 2 ? 8 : 5,
        1
      );

      // Orient cylinder along the direction
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      geo.applyQuaternion(quaternion);
      geo.translate(mid.x, mid.y, mid.z);

      geometries.push(geo);
    });

    // Merge all branch geometries
    const merged = new THREE.BufferGeometry();
    const allPositions = [];
    const allNormals = [];
    const allIndices = [];
    let indexOffset = 0;

    geometries.forEach((geo) => {
      const pos = geo.getAttribute('position');
      const norm = geo.getAttribute('normal');
      const idx = geo.getIndex();

      for (let i = 0; i < pos.count; i++) {
        allPositions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        allNormals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      }

      if (idx) {
        for (let i = 0; i < idx.count; i++) {
          allIndices.push(idx.getItem(i) + indexOffset);
        }
      }
      indexOffset += pos.count;
      geo.dispose();
    });

    merged.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
    merged.setAttribute('normal', new THREE.Float32BufferAttribute(allNormals, 3));
    merged.setIndex(allIndices);
    merged.computeVertexNormals();

    return merged;
  }, []);

  return (
    <mesh ref={meshRef} geometry={mergedGeometry}>
      <meshStandardMaterial
        color="#3d2517"
        roughness={0.9}
        metalness={0.05}
        flatShading={false}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   CANOPY — dense cluster of soft green spheres
═══════════════════════════════════════════ */

function CanopySphere({ position, scale, color, windOffset = 0 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      // Gentle wind sway
      ref.current.position.x = position[0] + Math.sin(t * 0.5 + windOffset) * 0.04;
      ref.current.position.z = position[2] + Math.cos(t * 0.4 + windOffset * 1.3) * 0.03;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color={color}
        roughness={0.75}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}

function Canopy() {
  // Generate clusters of green spheres to form a dense, rounded canopy
  const clusters = useMemo(() => {
    const items = [];
    const greens = ['#2d6b30', '#3a8f3e', '#4caf50', '#388e3c', '#2e7d32', '#43a047', '#1b5e20', '#66bb6a'];
    const centerY = 5.2;

    // Dense core
    for (let i = 0; i < 45; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 1.8;

      // Flatten vertically for a wide, round canopy shape
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) * 0.55 + centerY;
      const z = r * Math.sin(phi) * Math.sin(theta);
      const s = 0.5 + Math.random() * 0.7;

      items.push({
        position: [x, y, z],
        scale: s,
        color: greens[Math.floor(Math.random() * greens.length)],
        windOffset: Math.random() * 10,
      });
    }

    // Extra outer layer for density
    for (let i = 0; i < 30; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.0 + Math.random() * 1.0;

      const x = r * Math.sin(phi) * Math.cos(theta) * 1.1;
      const y = r * Math.cos(phi) * 0.45 + centerY;
      const z = r * Math.sin(phi) * Math.sin(theta) * 1.1;
      const s = 0.35 + Math.random() * 0.55;

      items.push({
        position: [x, y, z],
        scale: s,
        color: greens[Math.floor(Math.random() * greens.length)],
        windOffset: Math.random() * 10,
      });
    }

    // Top dome
    for (let i = 0; i < 15; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.5;
      const x = r * Math.cos(theta);
      const y = centerY + 1.5 + Math.random() * 0.8;
      const z = r * Math.sin(theta);
      const s = 0.4 + Math.random() * 0.5;

      items.push({
        position: [x, y, z],
        scale: s,
        color: greens[Math.floor(Math.random() * greens.length)],
        windOffset: Math.random() * 10,
      });
    }

    return items;
  }, []);

  return (
    <group>
      {clusters.map((c, i) => (
        <CanopySphere key={i} {...c} />
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════
   GROUND — subtle dark plane with gradient
═══════════════════════════════════════════ */

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <circleGeometry args={[8, 64]} />
      <meshStandardMaterial
        color="#0a1a0a"
        roughness={1}
        metalness={0}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   FIREFLY PARTICLES — gentle floating specs
═══════════════════════════════════════════ */

function Fireflies() {
  const ref = useRef();
  const count = 40;

  const [positions, basePositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = Math.random() * 7 + 1;
      const z = (Math.random() - 0.5) * 8;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
    }
    return [pos, base];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      const attr = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        attr.array[i * 3] = basePositions[i * 3] + Math.sin(t * 0.3 + i * 1.7) * 0.3;
        attr.array[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(t * 0.5 + i * 0.9) * 0.2;
        attr.array[i * 3 + 2] = basePositions[i * 3 + 2] + Math.cos(t * 0.4 + i * 1.3) * 0.2;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#90ee90" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ═══════════════════════════════════════════
   SCENE — composes the full 3D tree scene
═══════════════════════════════════════════ */

function TreeScene() {
  const treeGroupRef = useRef();

  // Very subtle sway of the entire tree
  useFrame((state) => {
    if (treeGroupRef.current) {
      const t = state.clock.elapsedTime;
      treeGroupRef.current.rotation.z = Math.sin(t * 0.3) * 0.008;
      treeGroupRef.current.rotation.x = Math.sin(t * 0.2 + 1) * 0.005;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} color="#b0c4de" />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.2}
        color="#fff8e7"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 6, -2]} intensity={0.3} color="#87ceeb" />
      <pointLight position={[0, 3, 4]} intensity={0.2} color="#3b82f6" />

      {/* Subtle fog for depth */}
      <fog attach="fog" args={['#090d16', 12, 25]} />

      {/* Ground */}
      <Ground />

      {/* Tree */}
      <group ref={treeGroupRef}>
        <Trunk />
        <Canopy />
      </group>

      {/* Fireflies */}
      <Fireflies />

      {/* Controls */}
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
   TREE CANVAS — main export, R3F Canvas wrapper
═══════════════════════════════════════════ */

const TreeCanvas = ({ onNodeClick, onRootClick, droppedLeaves = [], shockwaveActive, nodePositions }) => {
  return (
    <div className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 4, 12], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
      >
        <TreeScene />
      </Canvas>
    </div>
  );
};

export default TreeCanvas;
