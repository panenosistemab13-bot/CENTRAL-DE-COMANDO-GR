import React from 'react';

export default function SidebarCoffeeVisual() {
  return (
    <div className="relative w-full h-24 flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 160 80" className="w-full h-full">
        <defs>
          <radialGradient id="sideCupGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#caa031" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#caa031" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="sideCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e5d5be" />
            <stop offset="100%" stopColor="#8c6a48" />
          </linearGradient>

          <linearGradient id="sideGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4a33a" />
            <stop offset="50%" stopColor="#fff2c4" />
            <stop offset="100%" stopColor="#9e721d" />
          </linearGradient>

          <filter id="sideGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient gold glow behind cup */}
        <circle cx="80" cy="45" r="35" fill="url(#sideCupGlow)" />

        {/* Saucer */}
        <ellipse cx="80" cy="62" rx="36" ry="7" fill="url(#sideCupGrad)" stroke="url(#sideGoldGrad)" strokeWidth="1" />

        {/* Cup */}
        <path
          d="M 60,35 C 60,54 66,59 80,59 C 94,59 100,54 100,35 Z"
          fill="url(#sideCupGrad)"
          stroke="#5a3d24"
          strokeWidth="0.8"
        />
        {/* Cup gold rim */}
        <ellipse cx="80" cy="35" rx="20" ry="5" fill="url(#sideGoldGrad)" />
        {/* Dark espresso inside */}
        <ellipse cx="80" cy="35" rx="18" ry="4" fill="#3b1f0b" />
        <ellipse cx="80" cy="35" rx="13" ry="2.5" fill="#a8712a" opacity="0.85" />

        {/* Cup Handle */}
        <path
          d="M 100,38 C 110,38 112,50 99,53"
          fill="none"
          stroke="url(#sideGoldGrad)"
          strokeWidth="1.8"
        />

        {/* Coffee Beans around the saucer */}
        <ellipse cx="44" cy="64" rx="4.5" ry="3" fill="#291508" stroke="#120803" strokeWidth="0.5" transform="rotate(-25 44 64)" />
        <ellipse cx="116" cy="63" rx="5" ry="3" fill="#291508" stroke="#120803" strokeWidth="0.5" transform="rotate(30 116 63)" />
        <ellipse cx="125" cy="66" rx="4" ry="2.5" fill="#3d210c" stroke="#120803" strokeWidth="0.5" transform="rotate(-15 125 66)" />

        {/* Aroma steam */}
        <path
          d="M 76,28 Q 72,18 78,8"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.4"
          strokeLinecap="round"
          className="steam-particle-1"
        />
        <path
          d="M 84,28 Q 90,17 83,7"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.5"
          strokeLinecap="round"
          className="steam-particle-2"
        />
      </svg>
    </div>
  );
}
