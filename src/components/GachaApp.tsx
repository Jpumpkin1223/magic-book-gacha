'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GachaPhase, Character, rollGacha } from '@/lib/data';
import ClosedBook from './ClosedBook';
import FlippingBook from './FlippingBook';
import ResultReveal from './ResultReveal';

export default function GachaApp() {
  const [phase, setPhase] = useState<GachaPhase>('idle');
  const [keys, setKeys] = useState(5);
  const [result, setResult] = useState<{ character: Character; isNearMiss: boolean } | null>(null);
  const rollRef = useRef<{ character: Character; isNearMiss: boolean } | null>(null);

  const handleBookTap = useCallback(() => {
    if (keys <= 0) return;
    // Roll result immediately (predetermined)
    rollRef.current = rollGacha();
    setResult(rollRef.current);
    setKeys(k => k - 1);
    setPhase('unlocking');

    // Unlocking animation -> opening -> flipping
    setTimeout(() => setPhase('opening'), 1000);
    setTimeout(() => setPhase('flipping'), 1600);
  }, [keys]);

  const handleFlipStop = useCallback(() => {
    setPhase('revealing');
  }, []);

  const handleResultDone = useCallback(() => {
    setPhase('idle');
    setResult(null);
    rollRef.current = null;
  }, []);

  // Determine which screen to show
  const showClosedBook = phase === 'idle' || phase === 'unlocking' || phase === 'opening';
  const showFlipping = phase === 'flipping' || phase === 'decelerating' || phase === 'nearMiss' || phase === 'stopped';
  const showResult = phase === 'revealing' || phase === 'result';

  return (
    <div className="relative w-full max-w-[375px] h-dvh mx-auto overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #2a2015 0%, #1a1510 50%, #100d08 100%)' }}
    >
      {/* Ambient vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      <AnimatePresence mode="wait">
        {showClosedBook && (
          <motion.div
            key="closed"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ClosedBook
              keys={keys}
              onTap={handleBookTap}
              phase={phase as 'idle' | 'unlocking' | 'opening'}
            />
          </motion.div>
        )}

        {showFlipping && result && (
          <motion.div
            key="flipping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FlippingBook
              isNearMiss={result.isNearMiss}
              rarity={result.character.rarity}
              onStop={handleFlipStop}
            />
          </motion.div>
        )}

        {showResult && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultReveal
              character={result.character}
              onDone={handleResultDone}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key counter (persistent across screens when not idle) */}
      {!showClosedBook && (
        <motion.div
          className="absolute top-6 right-6 flex items-center gap-1.5 text-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
        >
          <span>🔑</span>
          <span style={{ color: 'var(--gold-accent)' }}>x {keys}</span>
        </motion.div>
      )}
    </div>
  );
}
