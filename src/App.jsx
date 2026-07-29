import React, { useState, useCallback } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

/**
 * App — Root component composing the full DSA Tree hero experience.
 * 
 * Layer stack (back to front):
 *   1. ParticleCanvas  — animated background grid + particles
 *   2. HeroSection     — tree canvas/motion view + hero text + modals + controls
 *   3. Navbar          — glassmorphic top navigation
 */
const App = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#090d16' }}>
      {/* Background particles — z-0, fixed */}
      <ParticleCanvas />

      {/* Navbar — z-50, fixed */}
      <Navbar onSearch={handleSearch} />

      {/* Hero Section — z-10, full viewport */}
      <main>
        <HeroSection searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default App;
