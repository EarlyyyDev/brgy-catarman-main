import { cn } from "@/lib/utils"

export function BarangayHallIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice" className={cn("h-full w-full", className)} role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b2c5f" />
          <stop offset="100%" stopColor="#123a73" />
        </linearGradient>
        <linearGradient id="hallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f6fb" />
          <stop offset="100%" stopColor="#dbe4f0" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e6c34a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e6c34a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="520" fill="url(#skyGrad)" />
      <circle cx="1010" cy="120" r="160" fill="url(#sunGlow)" />
      <circle cx="1010" cy="120" r="46" fill="#e6c34a" opacity="0.85" />

      {/* ground */}
      <rect y="440" width="1200" height="80" fill="#0a2450" />

      {/* palm trees */}
      <g opacity="0.85">
        <rect x="90" y="330" width="10" height="110" rx="4" fill="#123a73" />
        <path d="M95 330 C 60 300 40 320 20 300 C 55 305 80 300 95 330 Z" fill="#1d4d8f" />
        <path d="M95 330 C 130 300 150 320 170 300 C 135 305 110 300 95 330 Z" fill="#1d4d8f" />
        <path d="M95 330 C 70 290 60 260 55 240 C 80 265 95 295 95 330 Z" fill="#1d4d8f" />
        <path d="M95 330 C 120 290 130 260 135 240 C 110 265 95 295 95 330 Z" fill="#1d4d8f" />
      </g>
      <g opacity="0.85">
        <rect x="1090" y="350" width="9" height="90" rx="4" fill="#123a73" />
        <path d="M1094 350 C 1065 325 1050 340 1035 325 C 1062 330 1082 328 1094 350 Z" fill="#1d4d8f" />
        <path d="M1094 350 C 1123 325 1140 340 1155 325 C 1128 330 1108 328 1094 350 Z" fill="#1d4d8f" />
        <path d="M1094 350 C 1075 315 1068 295 1064 280 C 1084 300 1094 325 1094 350 Z" fill="#1d4d8f" />
      </g>

      {/* Barangay Hall building */}
      <g transform="translate(330,150)">
        {/* roof */}
        <polygon points="270,0 0,90 540,90" fill="#123a73" stroke="#e6c34a" strokeWidth="3" />
        <rect x="250" y="-46" width="10" height="46" fill="#123a73" />
        <path d="M240 -46 L270 -70 L300 -46 Z" fill="#e6c34a" />

        {/* body */}
        <rect x="30" y="90" width="480" height="200" fill="url(#hallGrad)" stroke="#c9a227" strokeWidth="2" />

        {/* pediment band */}
        <rect x="30" y="90" width="480" height="14" fill="#c9a227" />

        {/* columns */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={58 + i * 58} y="112" width="20" height="160" fill="#f7f9fc" stroke="#b9c4d6" strokeWidth="1.5" />
        ))}

        {/* stairs */}
        <rect x="10" y="290" width="520" height="12" fill="#b9c4d6" />
        <rect x="0" y="302" width="540" height="12" fill="#9fb0c9" />

        {/* entrance door */}
        <rect x="235" y="200" width="70" height="72" fill="#0b2c5f" rx="3" />
        <rect x="255" y="215" width="30" height="57" fill="#123a73" rx="2" />

        {/* signage */}
        <rect x="150" y="120" width="240" height="26" rx="4" fill="#0b2c5f" opacity="0.9" />
        <text x="270" y="138" textAnchor="middle" fontSize="14" fontWeight="700" fill="#e6c34a" fontFamily="Georgia, serif" letterSpacing="1">
          BARANGAY HALL
        </text>

        {/* flagpole */}
        <rect x="522" y="10" width="4" height="280" fill="#c9a227" />
        <path d="M526 12 L575 26 L526 40 Z" fill="#dc2626" opacity="0.9" />
      </g>
    </svg>
  )
}
