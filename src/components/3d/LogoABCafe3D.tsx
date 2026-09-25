import React from 'react';

export default function LogoABCafe3D() {
  return (
    <div className="flex flex-col items-center justify-center py-2 px-3 select-none">
      {/* 3D Gold Emblem SVG */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff2c4" />
              <stop offset="40%" stopColor="#e5be4e" />
              <stop offset="70%" stopColor="#caa031" />
              <stop offset="100%" stopColor="#815b15" />
            </linearGradient>

            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Coffee Leaf / Wheat Crown Leaves */}
          <g fill="url(#logoGold)" filter="url(#logoGlow)">
            {/* Center Branch */}
            <path d="M 50,15 C 44,28 44,45 50,55 C 56,45 56,28 50,15 Z" />
            {/* Left Leaf 1 */}
            <path d="M 44,28 C 30,30 25,44 38,50 C 44,44 45,36 44,28 Z" />
            {/* Right Leaf 1 */}
            <path d="M 56,28 C 70,30 75,44 62,50 C 56,44 55,36 56,28 Z" />
            {/* Left Leaf 2 */}
            <path d="M 46,45 C 32,52 30,66 42,70 C 47,62 47,53 46,45 Z" />
            {/* Right Leaf 2 */}
            <path d="M 54,45 C 68,52 70,66 58,70 C 53,62 53,53 54,45 Z" />
            {/* Center Golden Coffee Berry */}
            <circle cx="50" cy="65" r="4.5" fill="#fff5d1" stroke="#815b15" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* Brand Title in Bold Cinematic Serif Typography */}
      <h1 className="font-heading font-black text-lg tracking-[0.18em] text-[#ffe699] uppercase leading-tight mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        A&B CAFÉ
      </h1>

      {/* Subtitle */}
      <p className="text-[8px] font-bold tracking-[0.25em] text-[#caa031] uppercase mt-0.5 opacity-90">
        TRADIÇÃO QUE MOVE
      </p>
    </div>
  );
}
