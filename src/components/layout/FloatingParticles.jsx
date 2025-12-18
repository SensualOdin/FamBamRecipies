import React from 'react';

const FloatingParticles = () => {
  return (
    <>
      {/* Detroit-inspired ambient light effects - Honolulu Blue and Silver */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-detroit-400/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-slow" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 right-1/3 w-80 h-80 bg-slate-300/10 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-slow" style={{ animationDelay: '1s' }} />
    </>
  );
};

export default FloatingParticles;
