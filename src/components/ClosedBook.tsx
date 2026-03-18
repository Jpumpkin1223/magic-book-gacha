'use client';

import { motion } from 'framer-motion';
import MagicParticles from './MagicParticles';

interface Props {
  keys: number;
  onTap: () => void;
  phase: 'idle' | 'unlocking' | 'opening';
}

export default function ClosedBook({ keys, onTap, phase }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-dvh">
      {/* Key counter */}
      <motion.div
        className="absolute top-12 left-1/2 flex items-center gap-2 text-lg"
        style={{ x: '-50%' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-2xl">🔑</span>
        <span style={{ color: 'var(--gold-accent)' }}>x {keys}</span>
      </motion.div>

      {/* Book */}
      <motion.div
        className="relative cursor-pointer"
        onClick={phase === 'idle' && keys > 0 ? onTap : undefined}
        animate={
          phase === 'idle'
            ? { y: [0, -6, 0, 4, 0], rotate: [0, 0.5, 0, -0.3, 0] }
            : phase === 'opening'
            ? { rotateY: -120, scale: 0.9, opacity: 0 }
            : {}
        }
        transition={
          phase === 'idle'
            ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            : phase === 'opening'
            ? { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
            : {}
        }
      >
        {/* Book body */}
        <div className="leather-cover emboss-pattern rounded-xl w-[220px] h-[300px] relative flex items-center justify-center">
          {/* Spine detail */}
          <div className="absolute left-0 top-3 bottom-3 w-[14px] rounded-l-lg book-spine" />

          {/* Cover decoration - inner border */}
          <div className="absolute inset-[18px] border border-[rgba(201,168,76,0.2)] rounded-lg" />

          {/* Title area */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="text-[rgba(201,168,76,0.7)] text-sm tracking-[0.2em]">✦ ✦ ✦</div>
            <div className="text-[rgba(255,235,200,0.85)] text-xl font-bold tracking-wider">
              마법 도감
            </div>
            <div className="text-[rgba(201,168,76,0.5)] text-xs tracking-[0.3em]">GRIMOIRE</div>
          </div>

          {/* Clasp */}
          <motion.div
            className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-[28px] h-[40px] rounded-r-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #a08030 50%, #c9a84c 100%)',
              border: '1.5px solid rgba(90, 58, 30, 0.4)',
            }}
            animate={
              phase === 'idle'
                ? {
                    boxShadow: [
                      '0 0 8px rgba(201,168,76,0.3), 0 0 16px rgba(201,168,76,0.1)',
                      '0 0 16px rgba(201,168,76,0.6), 0 0 32px rgba(201,168,76,0.3)',
                      '0 0 8px rgba(201,168,76,0.3), 0 0 16px rgba(201,168,76,0.1)',
                    ],
                  }
                : phase === 'unlocking'
                ? {
                    boxShadow: '0 0 24px rgba(201,168,76,0.8), 0 0 48px rgba(201,168,76,0.4)',
                    x: 8,
                  }
                : {}
            }
            transition={
              phase === 'idle'
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.5, ease: 'easeOut' }
            }
          >
            {/* Keyhole */}
            <motion.div
              className="w-[8px] h-[12px] rounded-full"
              style={{ background: 'rgba(90, 58, 30, 0.6)' }}
              animate={phase === 'unlocking' ? { scale: 1.2, opacity: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.3 }}
            />
          </motion.div>

          {/* Key animation */}
          {phase === 'unlocking' && (
            <motion.div
              className="absolute text-3xl z-20"
              initial={{ x: 100, y: -80, rotate: -30, opacity: 0 }}
              animate={{ x: 95, y: 0, rotate: [null, 0, 90], opacity: 1 }}
              transition={{
                duration: 0.8,
                rotate: { duration: 0.8, times: [0, 0.5, 1] },
                ease: 'easeInOut',
              }}
            >
              🔑
            </motion.div>
          )}

          {/* Unlock flash */}
          {phase === 'unlocking' && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.6, 0] }}
              transition={{ duration: 1.2, times: [0, 0.6, 0.75, 1] }}
              style={{
                background: 'radial-gradient(circle at 110% 50%, rgba(251,191,36,0.4) 0%, transparent 60%)',
              }}
            />
          )}

          {/* Page edges visible from side */}
          <div
            className="absolute right-[2px] top-[8px] bottom-[8px] w-[4px] rounded-r-sm"
            style={{
              background: 'linear-gradient(to right, var(--parchment-dark), var(--parchment-mid))',
            }}
          />
        </div>
      </motion.div>

      {/* Instruction text */}
      <motion.p
        className="absolute bottom-20 text-base tracking-wider"
        style={{ color: 'rgba(201, 168, 76, 0.6)' }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {keys > 0 ? '터치하여 도감 열기' : '열쇠가 부족합니다'}
      </motion.p>

      {/* Ambient particles */}
      <MagicParticles count={8} color="rgba(201, 168, 76, 0.25)" />
    </div>
  );
}
