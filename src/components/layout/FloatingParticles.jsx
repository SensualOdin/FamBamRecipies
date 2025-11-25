import React from 'react';

const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: Math.random() * 10 + 5 + 'px',
            height: Math.random() * 10 + 5 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: i % 2 === 0 ? '#8B4513' : '#DAA520',
            animation: `float ${Math.random() * 10 + 15}s ease-in-out infinite`,
            animationDelay: `-${Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
