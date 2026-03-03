import React, { memo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const FloatingParticles = () => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <>
      {/* Detroit-inspired ambient light effects - using opacity gradients instead of blur for performance */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-detroit-400/10 rounded-full pointer-events-none z-0 animate-pulse-slow hidden sm:block" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full pointer-events-none z-0 animate-pulse-slow hidden sm:block" style={{ animationDelay: '2s' }} />
    </>
  );
};

export default memo(FloatingParticles);
