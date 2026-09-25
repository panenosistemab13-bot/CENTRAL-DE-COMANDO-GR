import React from 'react';
import { motion } from 'motion/react';

export default function HeroCoffeeVisual3D() {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-visible select-none">
      {/* Cinematic Golden Amber Glow behind the Coffee Composition */}
      <div 
        className="absolute inset-0 bg-radial from-amber-500/25 via-amber-700/10 to-transparent blur-2xl pointer-events-none"
        style={{ transform: 'scale(1.2)' }}
      />

      <svg viewBox="0 0 360 200" className="w-full h-full overflow-visible">
        <defs>
          {/* Burlap Sack Gradient */}
          <radialGradient id="sackGrad" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#c59962" />
            <stop offset="50%" stopColor="#8c6136" />
            <stop offset="85%" stopColor="#4e3116" />
            <stop offset="100%" stopColor="#2c1a0a" />
          </radialGradient>

          {/* Coffee Bean Glossy 3D Gradient */}
          <linearGradient id="beanGrad" x1="20%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#5a3518" />
            <stop offset="35%" stopColor="#291508" />
            <stop offset="70%" stopColor="#140903" />
            <stop offset="100%" stopColor="#080402" />
          </linearGradient>

          {/* Porcelain Cup Gradient */}
          <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#ede3d5" />
            <stop offset="85%" stopColor="#c7b49e" />
            <stop offset="100%" stopColor="#8f7a63" />
          </linearGradient>

          {/* Espresso Crema Gradient */}
          <radialGradient id="cremaGrad" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#e3a752" />
            <stop offset="40%" stopColor="#b5752a" />
            <stop offset="85%" stopColor="#5c340e" />
            <stop offset="100%" stopColor="#2b1404" />
          </radialGradient>

          {/* Gold Trim Gradient */}
          <linearGradient id="goldTrimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#caa031" />
            <stop offset="50%" stopColor="#fff2c4" />
            <stop offset="100%" stopColor="#caa031" />
          </linearGradient>

          {/* 3D Shadows */}
          <filter id="softShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Ground Shadows */}
        <ellipse cx="140" cy="175" rx="90" ry="18" fill="rgba(0,0,0,0.7)" filter="blur(8px)" />
        <ellipse cx="260" cy="180" rx="60" ry="14" fill="rgba(0,0,0,0.65)" filter="blur(6px)" />

        {/* 1. BURLAP SACK OF COFFEE BEANS */}
        <g id="burlapSack" filter="url(#softShadow)">
          {/* Main sack pouch */}
          <path
            d="M 80,85 C 65,110 60,150 75,175 C 95,190 185,190 205,170 C 220,145 210,105 195,85 C 180,70 160,78 140,82 C 120,78 95,70 80,85 Z"
            fill="url(#sackGrad)"
            stroke="#a67744"
            strokeWidth="1.5"
          />

          {/* Sack opening rim folded texture */}
          <path
            d="M 80,85 C 95,72 135,76 140,82 C 145,76 185,72 195,85 C 185,96 145,92 140,88 C 135,92 95,96 80,85 Z"
            fill="#523214"
            stroke="#3a220d"
            strokeWidth="1.2"
          />

          {/* Burlap sack twine tie & stitched stamp */}
          <path
            d="M 115,130 Q 140,120 165,130 Q 140,140 115,130 Z"
            fill="none"
            stroke="#e0bf8b"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            opacity="0.75"
          />

          {/* Brand Stamped Seal on Sack */}
          <g transform="translate(138, 140) rotate(-6)">
            <ellipse cx="0" cy="0" rx="20" ry="15" fill="none" stroke="#2b180a" strokeWidth="1.8" strokeDasharray="3 2" />
            <text x="0" y="-1" textAnchor="middle" fill="#2b180a" fontSize="7" fontWeight="bold" fontFamily="serif">A&B</text>
            <text x="0" y="7" textAnchor="middle" fill="#2b180a" fontSize="6" fontWeight="bold" letterSpacing="1">CAFÉ</text>
          </g>
        </g>

        {/* 2. ROASTED COFFEE BEANS ON TOP & SPILLING AROUND */}
        <g id="spilledBeans">
          {/* Mound of beans in sack opening */}
          {[
            { cx: 120, cy: 75, r: 8, rot: 15 },
            { cx: 135, cy: 72, r: 9, rot: -25 },
            { cx: 150, cy: 74, r: 8.5, rot: 40 },
            { cx: 165, cy: 78, r: 8, rot: -10 },
            { cx: 110, cy: 82, r: 7.5, rot: 30 },
            { cx: 125, cy: 80, r: 8.5, rot: -45 },
            { cx: 142, cy: 82, r: 9, rot: 10 },
            { cx: 158, cy: 83, r: 8, rot: -20 },
            { cx: 175, cy: 82, r: 7.5, rot: 50 },
          ].map((b, i) => (
            <g key={`mound-${i}`} transform={`translate(${b.cx}, ${b.cy}) rotate(${b.rot})`} filter="url(#softShadow)">
              <ellipse cx="0" cy="0" rx={b.r} ry={b.r * 0.65} fill="url(#beanGrad)" stroke="#1a0c04" strokeWidth="0.5" />
              {/* Bean center curved groove */}
              <path d={`M -${b.r * 0.7} 0 Q 0 ${b.r * 0.25} ${b.r * 0.7} 0`} fill="none" stroke="#e0a353" strokeWidth="1" opacity="0.8" />
              {/* Specular bean highlight */}
              <ellipse cx={-b.r * 0.3} cy={-b.r * 0.25} rx={b.r * 0.35} ry={b.r * 0.15} fill="rgba(255,255,255,0.4)" />
            </g>
          ))}

          {/* Spilled roasted beans on table in foreground */}
          {[
            { cx: 65, cy: 172, r: 7.5, rot: -35 },
            { cx: 78, cy: 180, r: 8.5, rot: 20 },
            { cx: 95, cy: 182, r: 8, rot: 65 },
            { cx: 115, cy: 184, r: 9, rot: -15 },
            { cx: 175, cy: 182, r: 8, rot: 45 },
            { cx: 195, cy: 184, r: 8.5, rot: -30 },
            { cx: 215, cy: 180, r: 7.5, rot: 10 },
          ].map((b, i) => (
            <g key={`spill-${i}`} transform={`translate(${b.cx}, ${b.cy}) rotate(${b.rot})`} filter="url(#softShadow)">
              <ellipse cx="0" cy="0" rx={b.r} ry={b.r * 0.62} fill="url(#beanGrad)" stroke="#0d0602" strokeWidth="0.5" />
              <path d={`M -${b.r * 0.68} 0 Q 0 ${b.r * 0.22} ${b.r * 0.68} 0`} fill="none" stroke="#e0a353" strokeWidth="0.8" opacity="0.75" />
              <ellipse cx={-b.r * 0.25} cy={-b.r * 0.2} rx={b.r * 0.3} ry={b.r * 0.12} fill="rgba(255,255,255,0.35)" />
            </g>
          ))}
        </g>

        {/* 3. PORCELAIN ESPRESSO CUP & SAUCER WITH GOLD RIM */}
        <g id="espressoCup" filter="url(#softShadow)" transform="translate(45, 0)">
          {/* Saucer Base */}
          <ellipse cx="215" cy="170" rx="55" ry="14" fill="url(#cupGrad)" stroke="url(#goldTrimGrad)" strokeWidth="1.5" />
          <ellipse cx="215" cy="168" rx="42" ry="9" fill="#dfd4c5" stroke="#baab98" strokeWidth="0.8" />

          {/* Cup Handle with Gold Accent */}
          <path
            d="M 245,115 C 265,115 268,148 244,152"
            fill="none"
            stroke="url(#cupGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 245,115 C 265,115 268,148 244,152"
            fill="none"
            stroke="url(#goldTrimGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Cup Body */}
          <path
            d="M 185,110 C 185,152 195,165 215,165 C 235,165 245,152 245,110 Z"
            fill="url(#cupGrad)"
            stroke="#baa790"
            strokeWidth="1"
          />

          {/* Gold Trim along top rim */}
          <ellipse cx="215" cy="110" rx="30" ry="8" fill="url(#goldTrimGrad)" />

          {/* Inner Cup Lip & Hot Steaming Espresso Crema */}
          <ellipse cx="215" cy="110" rx="27" ry="7" fill="url(#cremaGrad)" />
          
          {/* Crema swirl art */}
          <path
            d="M 205,109 Q 215,106 225,110 Q 215,113 205,109"
            fill="none"
            stroke="#ffd88a"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* Brand Gold Crest on Porcelain Cup Front */}
          <g transform="translate(215, 140)">
            <circle cx="0" cy="0" r="8" fill="none" stroke="url(#goldTrimGrad)" strokeWidth="0.8" />
            <text x="0" y="2.5" textAnchor="middle" fill="#caa031" fontSize="5" fontWeight="bold" fontFamily="serif">A&B</text>
          </g>

          {/* 4. RISING REALISTIC STEAM ANIMATION */}
          <g id="steamAroma" className="pointer-events-none">
            {/* Steam Wisp 1 */}
            <path
              d="M 210,102 Q 202,80 214,60 T 208,35"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="steam-particle-1"
            />
            {/* Steam Wisp 2 */}
            <path
              d="M 218,102 Q 228,82 216,58 T 226,30"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              className="steam-particle-2"
            />
            {/* Steam Wisp 3 */}
            <path
              d="M 224,103 Q 215,85 228,65 T 220,40"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              className="steam-particle-3"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
