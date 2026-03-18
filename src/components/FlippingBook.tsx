'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rarity } from '@/lib/data';

interface FlipPage {
  id: number;
  glow: 'green' | 'lavender' | 'gold' | null;
  duration: number;
  intensity: number;
  particleSeeds: number[];
}

interface Props {
  isNearMiss: boolean;
  rarity: Rarity;
  onStop: () => void;
}

type FlipPhase = 'fast' | 'decelerating' | 'nearMiss' | 'nearMissSlip' | 'stopped';

const LEFT_STACK_LAYERS = 10;
const RIGHT_STACK_LAYERS = 10;

export default function FlippingBook({ isNearMiss, rarity, onStop }: Props) {
  const [pages, setPages] = useState<FlipPage[]>([]);
  const [flipPhase, setFlipPhase] = useState<FlipPhase>('fast');
  const [speed, setSpeed] = useState(1);
  const [showNearMissGlow, setShowNearMissGlow] = useState(false);
  const [flippedCount, setFlippedCount] = useState(0);
  const [microDecelActive, setMicroDecelActive] = useState(false);

  const nextIdRef = useRef(0);
  const decelTimerRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHintTimeRef = useRef(0);
  const pagesUntilStopRef = useRef<number | null>(null);

  const spawnPage = useCallback(() => {
    if (speed <= 0 && flipPhase !== 'nearMissSlip') return;

    const id = nextIdRef.current++;
    const now = Date.now();
    const isDecel = flipPhase === 'decelerating';
    
    let glow: FlipPage['glow'] = null;
    let intensity = 0.5;

    // Hint Probability Logic
    const timeSinceLastHint = now - lastHintTimeRef.current;
    const baseProb = isDecel ? 0.35 : 0.08;
    const chanceMultiplier = isDecel ? (1.5 - speed) : 1;
    
    // Forced hints for high rarity or near miss during deceleration (Last 3-5 pages logic)
    let forceGlow = false;
    if (isDecel && pagesUntilStopRef.current !== null) {
      const remaining = pagesUntilStopRef.current;
      if (rarity === 'legendary' || isNearMiss) {
        // Sequential hint pattern: green -> lavender -> gold
        if (remaining === 5) { glow = 'green'; forceGlow = true; }
        if (remaining === 3) { glow = 'lavender'; forceGlow = true; }
        if (remaining === 1) { glow = 'gold'; forceGlow = true; }
      } else if (rarity === 'rare' && remaining === 2) {
        glow = 'lavender'; forceGlow = true;
      }
      pagesUntilStopRef.current--;
    }

    if (!forceGlow && Math.random() < baseProb * chanceMultiplier && timeSinceLastHint > 400) {
      const glowRand = Math.random();
      if (rarity === 'legendary') {
        if (glowRand < 0.3) glow = 'gold';
        else if (glowRand < 0.6) glow = 'lavender';
        else glow = 'green';
      } else if (rarity === 'rare') {
        if (glowRand < 0.2) glow = 'lavender';
        else glow = 'green';
      } else {
        if (glowRand < 0.1) glow = 'green';
      }
      
      if (glow) {
        lastHintTimeRef.current = now;
        // Intensity increases as we slow down
        intensity = isDecel ? 0.4 + (1 - speed) * 0.6 : 0.4;
        
        // Micro-deceleration trigger for high-grade hints (Point 2)
        if (isDecel && (glow === 'gold' || glow === 'lavender')) {
          setMicroDecelActive(true);
          setTimeout(() => setMicroDecelActive(false), 350);
        }
      }
    }

    const duration = Math.max(0.18, 1.4 * (1 - speed * 0.82));
    const particleSeeds = glow ? Array.from({ length: glow === 'gold' ? 12 : 6 }, () => Math.random()) : [];

    setPages(prev => {
      const trimmed = prev.length > 8 ? prev.slice(-8) : prev;
      return [...trimmed, { id, glow, duration, intensity, particleSeeds }];
    });
  }, [speed, flipPhase, rarity, isNearMiss]);

  useEffect(() => {
    if (flipPhase === 'stopped' || flipPhase === 'nearMiss') return;

    const getInterval = () => {
      let interval = Math.max(70, 500 * (1 - speed * 0.88));
      if (microDecelActive) interval *= 1.8; 
      return interval;
    };

    spawnTimerRef.current = setTimeout(function tick() {
      spawnPage();
      if (speed > 0 || flipPhase === 'nearMissSlip') {
        spawnTimerRef.current = setTimeout(tick, getInterval());
      }
    }, getInterval());

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [flipPhase, speed, spawnPage, microDecelActive]);

  const handleTap = useCallback(() => {
    if (flipPhase !== 'fast') return;
    setFlipPhase('decelerating');
    pagesUntilStopRef.current = 14; 

    const decelStart = performance.now();
    const decelDuration = 2800; 

    const decel = (now: number) => {
      const elapsed = now - decelStart;
      const progress = Math.min(elapsed / decelDuration, 1);
      
      const currentSpeed = Math.max(0, 1 - (1 - Math.pow(1 - progress, 3)));
      
      // Micro-deceleration effect (Point 2)
      const adjustedSpeed = microDecelActive ? Math.max(0.05, speed * 0.9) : currentSpeed;

      if (currentSpeed <= 0.02 && !microDecelActive) {
        setSpeed(0);

        if (isNearMiss) {
          setFlipPhase('nearMiss');
          setShowNearMissGlow(true);

          setTimeout(() => {
            setFlipPhase('nearMissSlip');
            setShowNearMissGlow(false);
            pagesUntilStopRef.current = null;
            const id = nextIdRef.current++;
            setPages(prev => [...prev, { id, glow: null, duration: 1.2, intensity: 0, particleSeeds: [] }]);
            setTimeout(() => {
              setFlipPhase('stopped');
              onStop();
            }, 1400);
          }, 1000);
        } else {
          setFlipPhase('stopped');
          onStop();
        }
        return;
      }

      setSpeed(adjustedSpeed);
      decelTimerRef.current = requestAnimationFrame(decel);
    };

    decelTimerRef.current = requestAnimationFrame(decel);
  }, [flipPhase, isNearMiss, onStop, microDecelActive, speed]);

  useEffect(() => {
    return () => {
      if (decelTimerRef.current) cancelAnimationFrame(decelTimerRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, []);

  const handlePageComplete = (id: number) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setFlippedCount(c => c + 1);
  };

  const isStopped = flipPhase === 'stopped';
  const activeGoldGlow = pages.some(p => p.glow === 'gold');

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-dvh" onClick={handleTap}>
      
      {/* Grade Differentiation (Point 3) */}
      <AnimatePresence>
        {activeGoldGlow && (
          <motion.div 
            className="absolute inset-0 z-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: '#fbbf24', filter: 'blur(120px)' }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="relative z-10"
        animate={activeGoldGlow ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 2, -2, 0] } : {}}
        transition={{ duration: 0.2 }}
      >
        <div style={{ perspective: '800px', perspectiveOrigin: '50% 30%' }}>
          <motion.div
            className="preserve-3d relative"
            animate={{
              rotateX: isStopped ? 0 : 32,
              rotateY: 0,
              rotateZ: 0,
            }}
            transition={{ duration: 0.9, ease: [0.25, 0.8, 0.25, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative preserve-3d" style={{ transformStyle: 'preserve-3d' }}>

              {/* LEFT PAGE STACK */}
              <div className="absolute preserve-3d" style={{
                width: 160, height: 230,
                right: '50%',
                transformOrigin: 'right center',
                transform: 'rotateY(8deg)',
                transformStyle: 'preserve-3d',
              }}>
                {Array.from({ length: LEFT_STACK_LAYERS }).map((_, i) => (
                  <div key={`left-${i}`} className="absolute rounded-l-md"
                    style={{
                      inset: 0,
                      background: i === 0
                        ? 'linear-gradient(to right, var(--parchment-dark), var(--parchment-mid))'
                        : `hsl(36, ${30 + i * 2}%, ${78 - i * 1.5}%)`,
                      transform: `translateZ(${-i * 0.8}px)`,
                    }}
                  />
                ))}
                <div className="absolute inset-0 rounded-l-md" style={{
                  background: 'linear-gradient(to right, var(--parchment-dark), var(--parchment-mid))',
                  boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.12)',
                }}>
                  <div className="rune-overlay" />
                </div>
              </div>

              {/* SPINE */}
              <div className="absolute preserve-3d" style={{
                left: '50%', transform: 'translateX(-50%)',
                width: 14, height: 230,
                transformStyle: 'preserve-3d',
                zIndex: 20,
              }}>
                <div className="absolute inset-0 book-spine" style={{
                  background: 'linear-gradient(to right, #5a3a1e 0%, #7a5230 30%, #5a3a1e 50%, #7a5230 70%, #5a3a1e 100%)',
                }} />
              </div>

              {/* RIGHT PAGE STACK */}
              <div className="absolute" style={{
                width: 160, height: 230,
                left: '50%',
                transformOrigin: 'left center',
                transform: 'rotateY(-6deg)',
                transformStyle: 'preserve-3d',
                zIndex: 10,
              }}>
                {Array.from({ length: RIGHT_STACK_LAYERS }).map((_, i) => (
                  <div key={`right-${i}`} className="absolute rounded-r-md"
                    style={{
                      inset: 0,
                      background: i === 0
                        ? 'linear-gradient(to left, var(--parchment-light), var(--parchment-mid))'
                        : `hsl(36, ${30 + i * 2}%, ${80 - i * 1.5}%)`,
                      transform: `translateZ(${-i * 0.8}px)`,
                    }}
                  />
                ))}
                <div className="absolute inset-0 rounded-r-md overflow-hidden" style={{
                  background: 'linear-gradient(to left, var(--parchment-light), var(--parchment-mid))',
                }}>
                  <div className="rune-overlay" />
                </div>

                <AnimatePresence>
                  {pages.map(page => (
                    <motion.div
                      key={page.id}
                      className="absolute"
                      style={{
                        inset: 0,
                        transformOrigin: 'left center',
                        transformStyle: 'preserve-3d',
                      }}
                      initial={{ rotateY: 0, z: 0 }}
                      animate={{
                        rotateY: [0, -80, -110, -180],
                        z: [0, 35, 25, 0],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        rotateY: { duration: page.duration, ease: [0.22, 0.68, 0.35, 1], times: [0, 0.35, 0.55, 1] },
                        z: { duration: page.duration, ease: [0.22, 0.68, 0.35, 1], times: [0, 0.35, 0.55, 1] },
                        opacity: { duration: 0.05 },
                      }}
                      onAnimationComplete={() => handlePageComplete(page.id)}
                    >
                      {/* Sparkle Particles Burst */}
                      {page.glow && page.particleSeeds.map((seed, i) => (
                        <motion.div
                          key={`sparkle-${page.id}-${i}`}
                          className={`sparkle-particle ${page.glow === 'gold' ? 'bg-amber-300' : page.glow === 'lavender' ? 'bg-violet-300' : 'bg-green-300'}`}
                          style={{ boxShadow: '0 0 8px currentColor' }}
                          initial={{ x: 0, y: 115, opacity: 0, scale: 0 }}
                          animate={{ 
                            x: [0, (seed - 0.5) * 450], 
                            y: [115, (seed - 0.2) * 230 - 115],
                            opacity: [0, 1, 0.8, 0],
                            scale: [0, 1.2 + seed, 0.5]
                          }}
                          transition={{ duration: page.duration * 1.4, delay: i * 0.015, ease: "easeOut" }}
                        />
                      ))}

                      <div className="absolute inset-0 backface-hidden rounded-r-md"
                        style={{
                          background: 'linear-gradient(135deg, var(--parchment-light) 0%, var(--parchment-mid) 100%)',
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="rune-overlay" />
                        {page.glow && (
                          <motion.div 
                            className={`absolute inset-0 glow-${page.glow} rounded-r-md`} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: page.intensity }}
                            style={{ mixBlendMode: 'plus-lighter' }}
                          />
                        )}
                      </div>

                      <div className="absolute inset-0 backface-hidden rounded-l-md"
                        style={{
                          transform: 'rotateY(180deg)',
                          background: 'linear-gradient(135deg, var(--parchment-back) 0%, #c8ad88 100%)',
                          backfaceVisibility: 'hidden',
                        }}
                      >
                         {page.glow && (
                          <div className={`absolute inset-0 glow-${page.glow} rounded-l-md`} 
                            style={{ opacity: page.intensity * 0.5, mixBlendMode: 'plus-lighter' }}
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Speed trail particles */}
      {speed > 0.3 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: Math.ceil(speed * 10) }).map((_, i) => (
            <motion.div key={`trail-${i}`} className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
                background: 'rgba(201, 168, 76, 0.3)',
                left: `${38 + Math.random() * 28}%`, top: `${30 + Math.random() * 35}%`,
              }}
              animate={{ x: [-10, -70 - Math.random() * 40], opacity: [0.6, 0], scale: [1, 0.2] }}
              transition={{ duration: 0.25 + Math.random() * 0.25, repeat: Infinity, delay: Math.random() * 0.4 }}
            />
          ))}
        </div>
      )}

      {flipPhase === 'fast' && (
        <motion.p className="absolute bottom-16 text-base tracking-wider"
          style={{ color: 'rgba(201, 168, 76, 0.6)' }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          터치하여 멈추기
        </motion.p>
      )}

      {flipPhase === 'nearMiss' && (
        <motion.p className="absolute bottom-16 text-base tracking-wider font-bold"
          style={{ color: 'rgba(251, 191, 36, 0.8)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.1 }}
        >
          ...!
        </motion.p>
      )}
    </div>
  );
}
