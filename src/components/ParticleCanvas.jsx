import React, { useRef, useEffect } from 'react';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const colors = ['#3b82f6', '#8b5cf6', '#10b981'];
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const numParticles = 80;
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          baseOpacity: Math.random() * 0.4 + 0.1
        });
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const drawGrid = (time) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      const spacing = 40;
      
      const offsetX = Math.sin(time * 0.0005) * 20;
      const offsetY = Math.cos(time * 0.0005) * 20;

      for (let x = (offsetX % spacing) - spacing; x < width; x += spacing) {
        for (let y = (offsetY % spacing) - spacing; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const render = (time) => {
      ctx.clearRect(0, 0, width, height);
      
      drawGrid(time);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Use globalAlpha for cleaner hex color strings
        ctx.globalAlpha = p.baseOpacity;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < 14400) { // 120 * 120
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / 120) * 0.15;
            
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleCanvas;
