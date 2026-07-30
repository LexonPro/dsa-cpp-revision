import React, { useRef, useState, useCallback } from 'react';
import TreeCanvas from './TreeCanvas';

const TOD_OPTIONS = [
  { key: 'morning', label: 'Morning' },
  { key: 'evening', label: 'Evening' },
  { key: 'night',   label: 'Night'   },
];

const HeroSection = () => {
  const treeRef = useRef(null);
  const [timeOfDay, setTimeOfDay] = useState('night');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventLog, setEventLog] = useState([]);

  const addEvent = useCallback((text) => {
    setEventLog(prev => [text, ...prev].slice(0, 8));
  }, []);

  const handleLeafClick = useCallback((leaf) => {
    // Future: open modal
  }, []);

  const handleLeafDropped = useCallback((leaf) => {
    // Future: track dropped state
  }, []);

  const handleRootClick = useCallback(() => {
    // Future: open drawer
  }, []);

  const handleReset = useCallback(() => {
    treeRef.current?.reattachAll();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden', background: '#05040a' }}>

      {/* Three.js Tree */}
      <TreeCanvas
        ref={treeRef}
        timeOfDay={timeOfDay}
        searchQuery={searchQuery}
        onLeafClick={handleLeafClick}
        onLeafDropped={handleLeafDropped}
        onRootClick={handleRootClick}
        onEvent={addEvent}
      />

      {/* ═══ HUD: Top Bar ═══ */}
      <div style={{
        position: 'absolute', top: 24, left: 24, right: 24, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        pointerEvents: 'none',
      }}>
        {/* Brand */}
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a78bfa', opacity: 0.85 }}>
            Data Structures & Algorithms
          </div>
          <div style={{ fontSize: 20, color: '#f2effc', marginTop: 4, fontWeight: 600 }}>
            Core Foundations & C++ STL
          </div>
        </div>

        {/* Time-of-Day Controls */}
        <div style={{
          display: 'flex', gap: 8,
          background: 'rgba(20,14,34,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          padding: 6, borderRadius: 12, border: '1px solid rgba(167,139,250,0.25)',
          pointerEvents: 'auto',
        }}>
          {TOD_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setTimeOfDay(opt.key)}
              style={{
                background: timeOfDay === opt.key ? '#7c3aed' : 'transparent',
                border: 'none', color: timeOfDay === opt.key ? '#fff' : '#c9c1e0',
                fontSize: 12, padding: '8px 14px', borderRadius: 8,
                cursor: 'pointer', letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (timeOfDay !== opt.key) e.target.style.background = 'rgba(167,139,250,0.15)'; }}
              onMouseLeave={(e) => { if (timeOfDay !== opt.key) e.target.style.background = 'transparent'; }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ HUD: Center Hint ═══ */}
      <div style={{
        position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        fontSize: 11, color: '#8b81a8', letterSpacing: '0.05em', textAlign: 'center',
        pointerEvents: 'none',
      }}>
        Click a leaf to detach · Click root to pulse · Drag to look around
      </div>

      {/* ═══ HUD: Search ═══ */}
      <div style={{ position: 'absolute', bottom: 28, left: 24, width: 'min(340px, 40vw)', zIndex: 10 }}>
        <input
          type="text"
          placeholder="Search a topic — e.g. graphs, dynamic programming..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(20,14,34,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(167,139,250,0.3)', color: '#f2effc',
            padding: '12px 14px', borderRadius: 10, fontSize: 13, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#a78bfa'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(167,139,250,0.3)'; }}
        />
      </div>

      {/* ═══ HUD: Event Panel ═══ */}
      <div style={{
        position: 'absolute', bottom: 28, right: 24, width: 'min(300px, 42vw)', zIndex: 10,
        background: 'rgba(20,14,34,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(167,139,250,0.25)', borderRadius: 12, padding: '14px 16px',
      }}>
        <h4 style={{
          margin: '0 0 8px', fontSize: 11, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#a78bfa', fontWeight: 600,
        }}>
          Event Log
        </h4>
        <div style={{
          maxHeight: 120, overflowY: 'auto', fontSize: 11, color: '#c9c1e0', lineHeight: 1.6,
        }}>
          {eventLog.length === 0 && (
            <div style={{ color: '#6b5f8a', fontStyle: 'italic' }}>Interact with the tree…</div>
          )}
          {eventLog.map((msg, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(167,139,250,0.12)', padding: '3px 0' }}>
              {msg}
            </div>
          ))}
        </div>
        <button
          onClick={handleReset}
          style={{
            marginTop: 10, width: '100%',
            background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.4)',
            color: '#e9e4f7', padding: 8, borderRadius: 8,
            fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(124,58,237,0.35)'; }}
          onMouseLeave={(e) => { e.target.style.background = 'rgba(124,58,237,0.18)'; }}
        >
          Reset dropped leaves
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
