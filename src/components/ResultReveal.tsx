'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character, rarityConfig } from '@/lib/data';

interface Props {
  character: Character;
  onDone: () => void;
}

const STACK_LAYERS = 10;

export default function ResultReveal({ character, onDone }: Props) {
  const [phase, setPhase] = useState<'pause' | 'spreading' | 'reveal' | 'done'>('pause');
  const config = rarityConfig[character.rarity];
  const isLegendary = character.rarity === 'legendary';
  const isRare = character.rarity === 'rare';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('spreading'), 500);
    const t2 = setTimeout(() => setPhase('reveal'), 500 + config.spreadDuration * 1000 + 200);
    const t3 = setTimeout(() => setPhase('done'), 500 + config.spreadDuration * 1000 + 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [config.spreadDuration]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-dvh" onClick={phase === 'done' ? onDone : undefined}>

      {/* Legendary background flash */}
      {isLegendary && phase !== 'pause' && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0.05] }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ background: 'radial-gradient(circle at 50% 42%, rgba(251,191,36,0.3) 0%, transparent 60%)' }}
        />
      )}

      {/* ===== BOOK (pure background, no effects) ===== */}
      <div style={{ perspective: '800px', perspectiveOrigin: '50% 40%' }}>
        <motion.div
          className="preserve-3d relative"
          initial={{ rotateX: 32, rotateY: 0, rotateZ: 0 }}
          animate={{ rotateX: 8, rotateY: 0, rotateZ: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative preserve-3d" style={{ transformStyle: 'preserve-3d', width: 334, height: 230 }}>

            {/* Left page stack */}
            <div className="absolute preserve-3d" style={{
              width: 160, height: 230, right: '50%',
              transformOrigin: 'right center', transform: 'rotateY(5deg)', transformStyle: 'preserve-3d',
            }}>
              {Array.from({ length: STACK_LAYERS }).map((_, i) => (
                <div key={`l-${i}`} className="absolute rounded-l-md" style={{
                  inset: 0,
                  background: i === 0
                    ? 'linear-gradient(to right, var(--parchment-dark), var(--parchment-mid))'
                    : `hsl(36, ${30 + i * 2}%, ${78 - i * 1.5}%)`,
                  transform: `translateZ(${-i * 0.8}px)`,
                }} />
              ))}
              <div className="absolute inset-0 rounded-l-md" style={{
                background: 'linear-gradient(to right, var(--parchment-dark), var(--parchment-mid))',
                boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.12)',
              }}>
                <div className="rune-overlay" />
              </div>
              <div className="absolute left-0 right-0" style={{
                top: -1, height: STACK_LAYERS * 0.8,
                transformOrigin: 'bottom center', transform: 'rotateX(90deg)',
                background: `repeating-linear-gradient(to right,
                  var(--parchment-mid) 0px, var(--parchment-light) 0.5px,
                  var(--parchment-dark) 1px, var(--parchment-mid) 1.5px)`,
              }} />
            </div>

            {/* Spine */}
            <div className="absolute preserve-3d" style={{
              left: '50%', transform: 'translateX(-50%)', width: 14, height: 230, zIndex: 20,
            }}>
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to right, #5a3a1e 0%, #7a5230 30%, #5a3a1e 50%, #7a5230 70%, #5a3a1e 100%)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
              }} />
            </div>

            {/* Right page stack (clean, no effects) */}
            <div className="absolute preserve-3d" style={{
              width: 160, height: 230, left: '50%',
              transformOrigin: 'left center', transform: 'rotateY(-4deg)', transformStyle: 'preserve-3d',
            }}>
              {Array.from({ length: STACK_LAYERS }).map((_, i) => (
                <div key={`r-${i}`} className="absolute rounded-r-md" style={{
                  inset: 0,
                  background: i === 0
                    ? 'linear-gradient(to left, var(--parchment-light), var(--parchment-mid))'
                    : `hsl(36, ${30 + i * 2}%, ${80 - i * 1.5}%)`,
                  transform: `translateZ(${-i * 0.8}px)`,
                }} />
              ))}
              <div className="absolute inset-0 rounded-r-md" style={{
                background: 'linear-gradient(135deg, var(--parchment-light) 0%, var(--parchment-mid) 100%)',
              }}>
                <div className="rune-overlay" />
              </div>
              <div className="absolute left-0 right-0" style={{
                top: -1, height: STACK_LAYERS * 0.8,
                transformOrigin: 'bottom center', transform: 'rotateX(90deg)',
                background: `repeating-linear-gradient(to right,
                  var(--parchment-light) 0px, var(--parchment-mid) 0.5px,
                  var(--parchment-light) 1px, var(--parchment-dark) 1.5px)`,
              }} />
            </div>

            {/* Cover boards */}
            <div className="absolute" style={{
              width: 164, height: 234, right: 'calc(50% + 2px)', top: -2,
              transform: `translateZ(${-STACK_LAYERS * 0.8 - 2}px) rotateY(5deg)`,
              transformOrigin: 'right center',
              background: 'linear-gradient(135deg, var(--leather-mid), var(--leather-dark))',
              borderRadius: '4px 0 0 4px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }} />
            <div className="absolute" style={{
              width: 164, height: 234, left: 'calc(50% + 2px)', top: -2,
              transform: `translateZ(${-STACK_LAYERS * 0.8 - 2}px) rotateY(-4deg)`,
              transformOrigin: 'left center',
              background: 'linear-gradient(135deg, var(--leather-light), var(--leather-mid))',
              borderRadius: '0 4px 4px 0', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }} />
          </div>
        </motion.div>
      </div>

      {/* ===== CHARACTER-CENTERED EFFECTS (above the book) ===== */}
      {/* Positioned in screen space, not inside 3D book */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 20 }}>
        {/* Character anchor point — slightly above book center */}
        <div className="relative" style={{ marginTop: -40 }}>

          {/* Spread effect — radiates FROM the character */}
          <AnimatePresence>
            {phase !== 'pause' && (
              <motion.div
                className="absolute"
                style={{ top: '50%', left: '50%', width: 0, height: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Primary spread glow */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: isLegendary ? 600 : isRare ? 450 : 300,
                    height: isLegendary ? 600 : isRare ? 450 : 300,
                    background: `radial-gradient(circle, ${config.spreadColor} 0%, ${config.spreadColor.replace(/[\d.]+\)$/, '0.15)')} 35%, transparent 55%)`,
                  }}
                  initial={{ scale: 0, x: '-50%', y: '-50%', opacity: 0 }}
                  animate={{
                    scale: config.spreadScale,
                    x: '-50%', y: '-50%',
                    opacity: [0, 0.9, 0.7],
                  }}
                  transition={{ duration: config.spreadDuration, ease: isLegendary ? [0.2, 0, 0.1, 1] : [0.4, 0, 0.2, 1] }}
                />

                {/* Legendary: second burst wave */}
                {isLegendary && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: 800, height: 800,
                      background: 'radial-gradient(circle, rgba(255,230,150,0.5) 0%, rgba(251,191,36,0.15) 30%, transparent 50%)',
                    }}
                    initial={{ scale: 0, x: '-50%', y: '-50%', opacity: 0 }}
                    animate={{ scale: 2, x: '-50%', y: '-50%', opacity: [0, 0.9, 0] }}
                    transition={{ duration: 1.4, delay: config.spreadDuration * 0.5, ease: [0.15, 0, 0.1, 1] }}
                  />
                )}

                {/* Legendary: shockwave ring */}
                {isLegendary && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 700, height: 700, border: '2px solid rgba(251, 191, 36, 0.3)' }}
                    initial={{ scale: 0, x: '-50%', y: '-50%', opacity: 0 }}
                    animate={{ scale: 2.2, x: '-50%', y: '-50%', opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.6, delay: config.spreadDuration * 0.6, ease: 'easeOut' }}
                  />
                )}

                {/* Rare: concentric ripples */}
                {isRare && [0, 1, 2].map(i => (
                  <motion.div
                    key={`rip-${i}`}
                    className="absolute rounded-full"
                    style={{ width: 400, height: 400, border: '1.5px solid rgba(167, 139, 250, 0.35)' }}
                    initial={{ scale: 0, x: '-50%', y: '-50%', opacity: 0 }}
                    animate={{ scale: 1.6, x: '-50%', y: '-50%', opacity: [0, 0.6, 0] }}
                    transition={{ duration: 1.2, delay: config.spreadDuration * 0.3 + i * 0.25, ease: 'easeOut' }}
                  />
                ))}

                {/* Particles burst outward from character */}
                {Array.from({ length: isLegendary ? 18 : isRare ? 10 : 5 }).map((_, i) => {
                  const count = isLegendary ? 18 : isRare ? 10 : 5;
                  const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
                  const dist = isLegendary ? 100 + Math.random() * 100 : isRare ? 60 + Math.random() * 60 : 30 + Math.random() * 30;
                  const size = isLegendary ? 4 + Math.random() * 3 : isRare ? 3 + Math.random() * 2 : 2;
                  const color = isLegendary ? '#fbbf24' : isRare ? '#a78bfa' : 'rgba(220, 200, 160, 0.7)';
                  const glowColor = isLegendary ? 'rgba(251,191,36,0.6)' : isRare ? 'rgba(167,139,250,0.5)' : 'rgba(220,200,160,0.3)';
                  return (
                    <motion.div
                      key={`pt-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: size, height: size,
                        background: color,
                        boxShadow: `0 0 ${size * 2}px ${glowColor}`,
                      }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist,
                        opacity: [0, 1, 0.7, 0],
                        scale: [0, 1.5, 0.3],
                      }}
                      transition={{
                        duration: isLegendary ? 1.2 : 0.9,
                        delay: config.spreadDuration * 0.4 + Math.random() * 0.4,
                        ease: 'easeOut',
                      }}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== THE CHARACTER ===== */}
          <AnimatePresence>
            {(phase === 'reveal' || phase === 'done') && (
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                animate={{
                  opacity: 1,
                  scale: isLegendary ? 1.15 : isRare ? 1.05 : 1,
                  y: isLegendary ? -10 : isRare ? -5 : 0,
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.15, 0.85, 0.25, 1],
                  scale: { type: 'spring', stiffness: 200, damping: 14 },
                }}
              >
                {/* Shadow below character */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: isLegendary ? 100 : isRare ? 80 : 60,
                    height: isLegendary ? 30 : isRare ? 22 : 16,
                    bottom: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: `radial-gradient(ellipse, rgba(0,0,0,${isLegendary ? 0.3 : isRare ? 0.2 : 0.12}) 0%, transparent 70%)`,
                    filter: `blur(${isLegendary ? 8 : 5}px)`,
                  }}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                />

                {/* Emoji with float animation */}
                <motion.div
                  className="text-7xl mb-3"
                  animate={{
                    y: isLegendary ? [0, -10, 0] : isRare ? [0, -6, 0] : [0, -3, 0],
                    ...(isLegendary ? {
                      filter: [
                        'drop-shadow(0 6px 16px rgba(251,191,36,0.4))',
                        'drop-shadow(0 12px 28px rgba(251,191,36,0.7))',
                        'drop-shadow(0 6px 16px rgba(251,191,36,0.4))',
                      ],
                    } : isRare ? {
                      filter: [
                        'drop-shadow(0 4px 10px rgba(167,139,250,0.3))',
                        'drop-shadow(0 8px 18px rgba(167,139,250,0.5))',
                        'drop-shadow(0 4px 10px rgba(167,139,250,0.3))',
                      ],
                    } : {
                      filter: [
                        'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                        'drop-shadow(0 5px 10px rgba(0,0,0,0.22))',
                        'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                      ],
                    }),
                  }}
                  transition={{ duration: isLegendary ? 2.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {character.emoji}
                </motion.div>

                {/* Stars */}
                <div className="flex gap-1 mb-1.5">
                  {Array.from({ length: config.stars }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-base"
                      style={{ color: config.color }}
                      initial={{ opacity: 0, scale: 0, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.15 * i, type: 'spring', stiffness: 300, damping: 12 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>

                {/* Name */}
                <motion.p
                  className="text-base font-bold mb-0.5"
                  style={{ color: '#f5e6c8', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {character.name}
                </motion.p>

                {/* Rarity label */}
                <motion.p
                  className="text-xs tracking-wider"
                  style={{ color: config.color, textShadow: `0 0 10px ${config.color}` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ delay: 0.3 }}
                >
                  {config.label}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Result text */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            className="absolute bottom-16 flex flex-col items-center gap-3 z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm tracking-widest" style={{ color: 'rgba(201, 168, 76, 0.7)' }}>
              도감에 기록되었습니다
            </p>
            <p className="text-xs tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.4)' }}>
              터치하여 계속
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legendary ambient particles */}
      {isLegendary && phase !== 'pause' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`amb-${i}`}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 3, height: 2 + Math.random() * 3,
                background: 'rgba(251, 191, 36, 0.4)',
                boxShadow: '0 0 4px rgba(251, 191, 36, 0.3)',
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -30 - Math.random() * 50], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.3] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
