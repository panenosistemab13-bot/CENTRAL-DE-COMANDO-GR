import React from 'react';

export default function TruckHeaderVisual3D() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl select-none">
      {/* Cinematic Sunset Highway Skyline SVG */}
      <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-40">
        <defs>
          <linearGradient id="skySunset" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#b45309" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e1008" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="truckBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Sunset Sky Glow */}
        <rect width="1200" height="120" fill="url(#skySunset)" />
        
        {/* Distant Mountains / Hills Silhouette */}
        <path d="M 0,85 Q 200,60 450,75 T 900,65 T 1200,80 L 1200,120 L 0,120 Z" fill="#201108" opacity="0.8" />
        <path d="M 0,95 Q 350,78 700,90 T 1200,88 L 1200,120 L 0,120 Z" fill="#130a04" />

        {/* Golden Sun Flare on Horizon */}
        <circle cx="580" cy="70" r="45" fill="url(#sunGlow)" filter="blur(8px)" />

        {/* Highway Asphalt */}
        <path d="M 460,120 L 580,85 L 620,85 L 740,120 Z" fill="#0b0603" />
        {/* Highway Golden Center Lines */}
        <line x1="590" y1="88" x2="592" y2="95" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="594" y1="102" x2="598" y2="114" stroke="#f59e0b" strokeWidth="2.5" />

        {/* Semi Truck Profile / Silhouette Heading on Highway */}
        <g transform="translate(540, 48) scale(0.65)">
          {/* Cargo Trailer */}
          <rect x="0" y="20" width="110" height="42" rx="3" fill="url(#truckBodyGrad)" stroke="#64748b" strokeWidth="1" />
          {/* A&B Coffee Logo on Trailer Side */}
          <text x="55" y="44" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif" opacity="0.85">A&B CAFÉ</text>
          
          {/* Truck Tractor Cabin */}
          <path d="M 110,32 L 132,32 L 142,46 L 142,62 L 110,62 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
          {/* Windshield */}
          <polygon points="122,34 130,34 138,44 122,44" fill="#67e8f9" opacity="0.65" />
          
          {/* Headlights High-Beam Cones */}
          <polygon points="142,54 260,35 260,75 142,58" fill="rgba(254, 240, 138, 0.25)" filter="blur(4px)" />
          
          {/* Wheels */}
          <circle cx="20" cy="62" r="7" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <circle cx="36" cy="62" r="7" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <circle cx="95" cy="62" r="7" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <circle cx="128" cy="62" r="7" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
