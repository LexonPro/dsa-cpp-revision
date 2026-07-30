import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

/* ============================================================
   DSA Tree Hero Scene — Vanilla Three.js engine in React
   ============================================================ */

// ── Content model ──
const CATEGORIES = {
  linear:    { label: 'Linear',     color: 0x5eead4, angle: -1.05 },
  nonlinear: { label: 'Non-Linear', color: 0xa78bfa, angle: 0.0   },
  algo:      { label: 'Algorithms', color: 0xfbbf24, angle: 1.05  },
};

const LEAF_DATA = [
  { id:'arrays',  label:'Arrays & Strings',    category:'linear'    },
  { id:'lists',   label:'Linked Lists',        category:'linear'    },
  { id:'stacks',  label:'Stacks & Queues',     category:'linear'    },
  { id:'trees',   label:'Trees & BSTs',        category:'nonlinear' },
  { id:'graphs',  label:'Graphs',              category:'nonlinear' },
  { id:'heaps',   label:'Heaps',               category:'nonlinear' },
  { id:'tries',   label:'Tries',               category:'nonlinear' },
  { id:'sorting', label:'Searching & Sorting', category:'algo'      },
  { id:'dp',      label:'Dynamic Programming', category:'algo'      },
  { id:'greedy',  label:'Greedy & Bit Manip',  category:'algo'      },
];

const TOD_PRESETS = {
  morning: {
    bgTop:'#ffd9a8', bgBottom:'#fff3e0', fog:0xffdcae, fogDensity:0.012,
    hemiSky:0xfff0d0, hemiGround:0x8a6a3a, hemiIntensity:0.9,
    dirColor:0xffcf8a, dirIntensity:1.4, dirPos:[6,10,4], stars:false,
  },
  evening: {
    bgTop:'#3a1b5c', bgBottom:'#c2599b', fog:0x6a2e6e, fogDensity:0.015,
    hemiSky:0x6a3fa0, hemiGround:0x2a1240, hemiIntensity:0.6,
    dirColor:0xff77c8, dirIntensity:1.1, dirPos:[-7,3,5], stars:false,
  },
  night: {
    bgTop:'#05030d', bgBottom:'#120a24', fog:0x0a0616, fogDensity:0.02,
    hemiSky:0x2a1a55, hemiGround:0x05030d, hemiIntensity:0.35,
    dirColor:0x8b7bff, dirIntensity:0.4, dirPos:[4,8,-4], stars:true,
  },
};

// ── Texture helpers ──

function makeBgTexture(topHex, bottomHex) {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, topHex);
  g.addColorStop(1, bottomHex);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function makeBarkTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3d2a1c';
  ctx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 220; i++) {
    ctx.strokeStyle = `rgba(${20 + Math.random() * 40},${12 + Math.random() * 24},${6 + Math.random() * 14},${0.3 + Math.random() * 0.4})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * 128;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + (Math.random() * 10 - 5), 90, x + (Math.random() * 10 - 5), 180, x + (Math.random() * 8 - 4), 256);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '', lines = [];
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w + ' '; }
    else line = test;
  }
  lines.push(line);
  const startY = y - (lines.length - 1) * lineHeight / 2;
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i * lineHeight));
}

function makeLeafBadgeTexture(label, colorHex) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 96;
  const ctx = c.getContext('2d');
  const col = '#' + colorHex.toString(16).padStart(6, '0');
  ctx.fillStyle = 'rgba(10,6,20,0.72)';
  roundRect(ctx, 4, 4, 248, 88, 20);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  roundRect(ctx, 4, 4, 248, 88, 20);
  ctx.stroke();
  // leaf icon
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.ellipse(38, 48, 16, 22, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  // label
  ctx.fillStyle = '#f2effc';
  ctx.font = "600 22px 'Segoe UI', system-ui, sans-serif";
  ctx.textBaseline = 'middle';
  wrapText(ctx, label, 68, 48, 172, 24);
  return new THREE.CanvasTexture(c);
}

// ── Engine mount ──

function mountEngine(container, canvasEl, callbacks) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 200);
  camera.position.set(0, 6.2, 15.5);
  camera.lookAt(0, 5, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  let bgTex = makeBgTexture('#05030d', '#120a24');
  scene.background = bgTex;
  scene.fog = new THREE.FogExp2(0x0a0616, 0.02);

  // Lighting
  const hemi = new THREE.HemisphereLight(0x2a1a55, 0x05030d, 0.35);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0x8b7bff, 0.4);
  dir.position.set(4, 8, -4);
  scene.add(dir);

  // Ground
  const groundGeo = new THREE.CircleGeometry(14, 48);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0c0818, roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starCount = 900;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 40 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5 + 0.05;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi) * 0.6 + 4;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 10;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.0 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ── Tree group ──
  const treeGroup = new THREE.Group();
  scene.add(treeGroup);

  const barkTex = makeBarkTexture();
  const barkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.95, metalness: 0.05, color: 0x8a6a52 });

  // Root glow
  const rootGeo = new THREE.SphereGeometry(0.55, 24, 24);
  const rootMat = new THREE.MeshStandardMaterial({
    color: 0x2a1240, emissive: 0x7c3aed, emissiveIntensity: 1.1, roughness: 0.4,
  });
  const rootMesh = new THREE.Mesh(rootGeo, rootMat);
  rootMesh.position.set(0, 0.35, 0);
  rootMesh.userData = { type: 'root' };
  treeGroup.add(rootMesh);

  const rootLight = new THREE.PointLight(0x9b7bff, 1.4, 5);
  rootLight.position.copy(rootMesh.position);
  treeGroup.add(rootLight);

  // Root tendrils
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(Math.cos(ang) * 0.9, 0.05, Math.sin(ang) * 0.9),
      new THREE.Vector3(Math.cos(ang) * 1.6, -0.05, Math.sin(ang) * 1.6),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.09, 6, false);
    treeGroup.add(new THREE.Mesh(tubeGeo, barkMat));
  }

  // Trunk: stacked tapered segments with organic bend
  let trunkTop = new THREE.Vector3(0, 0.3, 0);
  let radius = 0.55;
  const trunkSegments = 6;
  for (let i = 0; i < trunkSegments; i++) {
    const segLen = 0.85;
    const bendX = Math.sin(i * 1.7) * 0.06;
    const bendZ = Math.cos(i * 1.3) * 0.05;
    const nextTop = trunkTop.clone().add(new THREE.Vector3(bendX, segLen, bendZ));
    const nextRadius = radius * 0.82;

    const dirVec = nextTop.clone().sub(trunkTop);
    const len = dirVec.length();
    const geo = new THREE.CylinderGeometry(nextRadius, radius, len, 10);
    const mesh = new THREE.Mesh(geo, barkMat);
    const mid = trunkTop.clone().add(nextTop).multiplyScalar(0.5);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirVec.clone().normalize());
    treeGroup.add(mesh);

    trunkTop = nextTop;
    radius = nextRadius;
  }
  const canopyBase = trunkTop.clone();

  // ── Boughs → twigs → leaf badges ──
  const leafMeshes = [];
  const catKeys = Object.keys(CATEGORIES);

  catKeys.forEach((catKey) => {
    const cat = CATEGORIES[catKey];
    const boughDir = new THREE.Vector3(Math.sin(cat.angle), 0.55, Math.cos(cat.angle) * 0.6).normalize();
    const boughEnd = canopyBase.clone().add(boughDir.clone().multiplyScalar(2.4));

    const boughCurve = new THREE.CatmullRomCurve3([
      canopyBase,
      canopyBase.clone().lerp(boughEnd, 0.5).add(new THREE.Vector3(0, 0.4, 0)),
      boughEnd,
    ]);
    const boughGeo = new THREE.TubeGeometry(boughCurve, 12, 0.22, 8, false);
    treeGroup.add(new THREE.Mesh(boughGeo, barkMat));

    const leavesInCat = LEAF_DATA.filter(l => l.category === catKey);
    leavesInCat.forEach((leafData, idx) => {
      const spread = (idx - (leavesInCat.length - 1) / 2) * 0.85;
      const twigEnd = boughEnd.clone().add(new THREE.Vector3(
        Math.cos(cat.angle + spread * 0.5) * (1.1 + idx * 0.15),
        0.6 + idx * 0.35,
        Math.sin(cat.angle + spread * 0.5) * (1.1 + idx * 0.15) * 0.6 + spread * 0.3,
      ));

      const twigCurve = new THREE.CatmullRomCurve3([
        boughEnd,
        boughEnd.clone().lerp(twigEnd, 0.5).add(new THREE.Vector3(0, 0.2, 0)),
        twigEnd,
      ]);
      const twigGeo = new THREE.TubeGeometry(twigCurve, 6, 0.06, 6, false);
      treeGroup.add(new THREE.Mesh(twigGeo, barkMat));

      // Leaf badge sprite
      const badgeTex = makeLeafBadgeTexture(leafData.label, cat.color);
      const spriteMat = new THREE.SpriteMaterial({ map: badgeTex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.7, 0.64, 1);
      sprite.position.copy(twigEnd).add(new THREE.Vector3(0, 0.35, 0));
      sprite.userData = {
        type: 'leaf', id: leafData.id, label: leafData.label, category: catKey,
        origin: sprite.position.clone(), originScale: sprite.scale.clone(),
        dropped: false, animating: false, animT: 0, velocityY: 0,
        matched: true, reattaching: false, dropScale: null, startPos: null,
      };
      treeGroup.add(sprite);
      leafMeshes.push(sprite);

      // Foliage puff behind badge
      const puffGeo = new THREE.IcosahedronGeometry(0.34, 0);
      const puffMat = new THREE.MeshStandardMaterial({
        color: cat.color, roughness: 0.7, emissive: cat.color, emissiveIntensity: 0.05,
      });
      const puff = new THREE.Mesh(puffGeo, puffMat);
      puff.position.copy(twigEnd);
      treeGroup.add(puff);
    });
  });

  // ── Trunk pulse effect ──
  const pulseGeo = new THREE.SphereGeometry(0.4, 16, 16);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.0 });
  const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
  treeGroup.add(pulseMesh);
  let pulseActive = false, pulseT = 0;

  function startPulse() {
    pulseActive = true;
    pulseT = 0;
    callbacks.onEvent('Root shockwave triggered');
    callbacks.onRootClick();
  }

  // ── Raycasting ──
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let targetCamX = camera.position.x, targetCamY = camera.position.y;
  const droppedIds = [];

  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    targetCamX = pointer.x * 1.6;
    targetCamY = 6.2 + pointer.y * 0.8;
  }

  function onClick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const rootHit = raycaster.intersectObject(rootMesh);
    if (rootHit.length) { startPulse(); return; }

    const leafHits = raycaster.intersectObjects(leafMeshes);
    if (leafHits.length) {
      const leaf = leafHits[0].object;
      if (leaf.userData.dropped || leaf.userData.animating) return;
      leaf.userData.animating = true;
      leaf.userData.animT = 0;
      leaf.userData.velocityY = 0;
      callbacks.onEvent(`Leaf clicked: "${leaf.userData.label}"`);
      callbacks.onLeafClick({ id: leaf.userData.id, label: leaf.userData.label, category: leaf.userData.category });
    }
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('click', onClick);

  // ── Reattach all ──
  function reattachAll() {
    leafMeshes.forEach(leaf => {
      if (leaf.userData.dropped) {
        leaf.userData.dropped = false;
        leaf.userData.animating = true;
        leaf.userData.animT = 0;
        leaf.userData.reattaching = true;
        leaf.userData.startPos = leaf.position.clone();
      }
    });
    droppedIds.length = 0;
    callbacks.onEvent('All leaves reattached');
  }

  // ── Search highlighting ──
  function applySearch(query) {
    const q = (query || '').trim().toLowerCase();
    leafMeshes.forEach(leaf => {
      leaf.userData.matched = !q || leaf.userData.label.toLowerCase().includes(q);
    });
  }

  // ── Time of day ──
  function applyTimeOfDay(mode) {
    const preset = TOD_PRESETS[mode] || TOD_PRESETS.night;
    bgTex = makeBgTexture(preset.bgTop, preset.bgBottom);
    scene.background = bgTex;
    scene.fog.color.set(preset.fog);
    scene.fog.density = preset.fogDensity;
    hemi.color.set(preset.hemiSky);
    hemi.groundColor.set(preset.hemiGround);
    hemi.intensity = preset.hemiIntensity;
    dir.color.set(preset.dirColor);
    dir.intensity = preset.dirIntensity;
    dir.position.set(...preset.dirPos);
    starMat.opacity = preset.stars ? 1 : 0;
    rootMat.emissiveIntensity = preset.stars ? 1.4 : 0.7;
    rootLight.intensity = preset.stars ? 1.8 : 0.9;
  }

  // ── Animation loop ──
  const clock = new THREE.Clock();
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);

    // Parallax camera
    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamY - camera.position.y) * 0.04;
    camera.lookAt(0, 5, 0);

    // Stars rotation
    if (starMat.opacity > 0) stars.rotation.y += dt * 0.004;

    // Root pulse
    if (pulseActive) {
      pulseT += dt / 1.4;
      const t = Math.min(pulseT, 1);
      pulseMesh.position.lerpVectors(rootMesh.position, canopyBase.clone().add(new THREE.Vector3(0, 1, 0)), t);
      pulseMat.opacity = Math.sin(t * Math.PI) * 0.9;
      pulseMesh.scale.setScalar(0.6 + t * 0.6);
      if (t >= 1) { pulseActive = false; pulseMat.opacity = 0; }
    }

    // Leaf animations
    leafMeshes.forEach(leaf => {
      if (leaf.userData.animating) {
        if (leaf.userData.reattaching) {
          leaf.userData.animT += dt / 0.9;
          const t = Math.min(leaf.userData.animT, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          leaf.position.lerpVectors(leaf.userData.startPos, leaf.userData.origin, ease);
          leaf.scale.lerpVectors(leaf.userData.dropScale || leaf.userData.originScale, leaf.userData.originScale, ease);
          leaf.material.rotation += dt * 1.5 * (1 - t);
          if (t >= 1) {
            leaf.userData.animating = false;
            leaf.userData.reattaching = false;
            leaf.material.rotation = 0;
          }
        } else {
          // Gravity drop
          leaf.userData.velocityY -= dt * 4.2;
          leaf.position.y += leaf.userData.velocityY * dt;
          leaf.position.x += dt * 0.25 * Math.sin(leaf.userData.animT * 6);
          leaf.material.rotation += dt * 2.2;
          leaf.userData.animT += dt;
          if (leaf.position.y <= 0.15) {
            leaf.position.y = 0.15;
            leaf.userData.animating = false;
            leaf.userData.dropped = true;
            leaf.userData.dropScale = leaf.scale.clone();
            droppedIds.push(leaf.userData.id);
            callbacks.onEvent(`Leaf dropped: "${leaf.userData.label}"`);
            callbacks.onLeafDropped({ id: leaf.userData.id, label: leaf.userData.label, category: leaf.userData.category });
          }
        }
      }

      // Search highlight
      if (!leaf.userData.animating) {
        const targetScale = leaf.userData.matched ? leaf.userData.originScale.x : leaf.userData.originScale.x * 0.6;
        const targetOpacity = leaf.userData.matched ? 1 : 0.25;
        leaf.scale.x += (targetScale - leaf.scale.x) * 0.1;
        leaf.scale.y = leaf.scale.x / leaf.userData.originScale.x * leaf.userData.originScale.y;
        leaf.material.opacity += (targetOpacity - leaf.material.opacity) * 0.1;
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ──
  function handleResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', handleResize);

  // ── Cleanup ──
  function dispose() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', handleResize);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('click', onClick);
    renderer.dispose();
  }

  return { setTimeOfDay: applyTimeOfDay, setSearchQuery: applySearch, reattachAll, getDroppedIds: () => droppedIds.slice(), dispose };
}

// ── React wrapper ──

const TreeCanvas = forwardRef(function TreeCanvas({ timeOfDay, searchQuery, onLeafClick, onLeafDropped, onRootClick, onEvent }, ref) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const handleRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const h = mountEngine(containerRef.current, canvasRef.current, {
      onLeafClick: onLeafClick || (() => {}),
      onLeafDropped: onLeafDropped || (() => {}),
      onRootClick: onRootClick || (() => {}),
      onEvent: onEvent || (() => {}),
    });
    handleRef.current = h;
    h.setTimeOfDay(timeOfDay || 'night');
    return () => h.dispose();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync props
  useEffect(() => { handleRef.current?.setTimeOfDay(timeOfDay); }, [timeOfDay]);
  useEffect(() => { handleRef.current?.setSearchQuery(searchQuery); }, [searchQuery]);

  // Expose methods
  useImperativeHandle(ref, () => ({
    reattachAll: () => handleRef.current?.reattachAll(),
    getDroppedIds: () => handleRef.current?.getDroppedIds() || [],
  }));

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
});

export default TreeCanvas;
