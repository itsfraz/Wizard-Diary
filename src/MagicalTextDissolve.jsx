import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

// --- CONFIGURABLE MAGIC PHYSICS ---
const MAGIC_PHYSICS = {
  PARTICLE_COUNT: 4, // drastically reduced for mobile performance (was 25)
  FLOAT_SPEED: 2.5,
  GLOW_COLOR_PALETTE: ['#fbbf24', '#c084fc', '#22d3ee'], // Gold, Purple, Cyan
  ANIMATION_DURATION: 1500, // ms
  ANTICIPATION_DURATION: 200, // ms
};

export default function MagicalTextDissolve({ text, isVanishing, onAudioTrigger, className }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textContainerRef = useRef(null);
  
  const [words, setWords] = useState([]);
  const [isAnticipating, setIsAnticipating] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  
  const controls = useAnimation();
  const particlesRef = useRef([]);
  const requestRef = useRef(null);

  // Split text into words for better wrapping calculation
  useEffect(() => {
    setWords(text.split(/\s+/).filter(w => w.length > 0));
  }, [text]);

  useEffect(() => {
    if (isVanishing) {
      triggerVanish();
    }
  }, [isVanishing]);

  const triggerVanish = () => {
    setIsAnticipating(true);
    controls.start({
      x: [-2, 2, -2, 2, 0],
      y: [-1, 1, -1, 1, 0],
      filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
      transition: { duration: MAGIC_PHYSICS.ANTICIPATION_DURATION / 1000 }
    });

    setTimeout(() => {
      setIsAnticipating(false);
      setIsDissolving(true);
      if (onAudioTrigger) onAudioTrigger();
      startCanvasPhysics();
    }, MAGIC_PHYSICS.ANTICIPATION_DURATION);
  };

  const startCanvasPhysics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    if (!container) return;
    
    // Setup canvas resolution
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Get word rects relative to container
    const wordSpans = textContainerRef.current.querySelectorAll('.magic-word');
    const newParticles = [];

    wordSpans.forEach(span => {
      const spanRect = span.getBoundingClientRect();
      const xOffset = spanRect.left - rect.left;
      const yOffset = spanRect.top - rect.top;
      
      const pCount = Math.max(3, Math.floor((spanRect.width / 20) * MAGIC_PHYSICS.PARTICLE_COUNT)); // Reduced spawn multiplier
      
      for (let i = 0; i < pCount; i++) {
        newParticles.push({
          x: xOffset + Math.random() * spanRect.width,
          y: yOffset + Math.random() * spanRect.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * MAGIC_PHYSICS.FLOAT_SPEED - 0.5,
          radius: Math.random() * 2 + 1,
          color: MAGIC_PHYSICS.GLOW_COLOR_PALETTE[Math.floor(Math.random() * MAGIC_PHYSICS.GLOW_COLOR_PALETTE.length)],
          alpha: 1,
          life: Math.random() * 0.5 + 0.5, // 0.5 to 1.0 life ratio
          sinOffset: Math.random() * Math.PI * 2
        });
      }
    });

    particlesRef.current = newParticles;

    let startTime = performance.now();

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / MAGIC_PHYSICS.ANIMATION_DURATION, 1);

      particlesRef.current.forEach(p => {
        p.x += p.vx + Math.sin(time * 0.005 + p.sinOffset) * 0.5; // Sine wave wander
        p.y += p.vy;
        p.alpha = Math.max(0, 1 - (progress / p.life));

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          // REMOVED: shadowBlur and shadowColor as they are catastrophic for mobile canvas performance
          ctx.fill();
          
          // Draw faint larger circle for fake "glow" (much cheaper than shadowBlur)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.globalAlpha = p.alpha * 0.3;
          ctx.fill();
        }
      });

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Physics Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ opacity: isDissolving ? 1 : 0 }}
      />
      
      {/* Text Container */}
      <motion.div
        ref={textContainerRef}
        animate={controls}
        className="relative z-0 flex flex-wrap justify-center gap-x-2"
        style={{ opacity: isDissolving ? 0 : 1 }}
      >
        {words.map((word, i) => (
          <span key={i} className="magic-word inline-block">{word}</span>
        ))}
      </motion.div>
    </div>
  );
}
