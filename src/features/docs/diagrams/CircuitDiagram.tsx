export function CircuitDiagram() {
  return (
    <svg viewBox="0 0 820 320" className="w-full" aria-label="ShadowPool match circuit diagram">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="nodeGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(196,57,15,0.3)" />
          <stop offset="100%" stopColor="rgba(170,38,8,0.1)" />
        </linearGradient>
      </defs>

      {/* Grid dots */}
      {[...Array(13)].map((_, i) =>
        [...Array(8)].map((_, j) => (
          <circle
            key={`${i}-${j}`}
            cx={40 + i * 60}
            cy={40 + j * 36}
            r="0.5"
            fill="rgba(245,240,238,0.06)"
          />
        )),
      )}

      {/* Private inputs - Order A */}
      <g transform="translate(40, 60)">
        <rect width="140" height="90" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(245,240,238,0.1)" />
        <text x="70" y="20" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          PRIVATE INPUT A
        </text>
        <text x="12" y="42" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">
          amount_a
        </text>
        <text x="12" y="58" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">
          price_a
        </text>
        <text x="12" y="74" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">
          salt_a
        </text>
      </g>

      {/* Private inputs - Order B */}
      <g transform="translate(40, 170)">
        <rect width="140" height="90" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(245,240,238,0.1)" />
        <text x="70" y="20" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          PRIVATE INPUT B
        </text>
        <text x="12" y="42" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">
          amount_b
        </text>
        <text x="12" y="58" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">
          price_b
        </text>
        <text x="12" y="74" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">
          salt_b
        </text>
      </g>

      {/* Wires: private inputs → Poseidon (left edge at x=310) */}
      <path
        d="M180 105 H265 V85 H310"
        stroke="rgba(196,57,15,0.55)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M180 215 H265 V225 H310"
        stroke="rgba(196,57,15,0.55)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="310" cy="85" r="2.5" fill="rgba(196,57,15,0.8)" />
      <circle cx="310" cy="225" r="2.5" fill="rgba(196,57,15,0.8)" />

      {/* Poseidon Hash nodes */}
      <g transform="translate(310, 52)" filter="url(#glow)">
        <rect width="110" height="66" rx="8" fill="url(#nodeGlow)" stroke="rgba(196,57,15,0.5)" />
        <text x="55" y="26" textAnchor="middle" fill="#C4390F" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">
          Poseidon
        </text>
        <text x="55" y="44" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          commit_a
        </text>
        <text x="55" y="56" textAnchor="middle" fill="rgba(245,240,238,0.28)" fontSize="7" fontFamily="DM Mono">
          254 constraints
        </text>
      </g>

      <g transform="translate(310, 192)" filter="url(#glow)">
        <rect width="110" height="66" rx="8" fill="url(#nodeGlow)" stroke="rgba(196,57,15,0.5)" />
        <text x="55" y="26" textAnchor="middle" fill="#C4390F" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">
          Poseidon
        </text>
        <text x="55" y="44" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          commit_b
        </text>
        <text x="55" y="56" textAnchor="middle" fill="rgba(245,240,238,0.28)" fontSize="7" fontFamily="DM Mono">
          254 constraints
        </text>
      </g>

      {/* Wires: Poseidon → Match Validator (left edge at x=455) */}
      <path
        d="M420 85 H438 V132 H455"
        stroke="rgba(245,240,238,0.2)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M420 225 H438 V188 H455"
        stroke="rgba(245,240,238,0.2)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="455" cy="132" r="2" fill="rgba(245,240,238,0.35)" />
      <circle cx="455" cy="188" r="2" fill="rgba(245,240,238,0.35)" />

      {/* Match validation */}
      <g transform="translate(455, 108)">
        <rect width="125" height="104" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(245,240,238,0.12)" />
        <text x="62" y="22" textAnchor="middle" fill="#f5f0ee" fontSize="9" fontFamily="Plus Jakarta Sans">
          Match Validator
        </text>
        <text x="12" y="46" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          price_a ≥ price_b
        </text>
        <text x="12" y="64" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          amount check
        </text>
        <text x="12" y="82" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          nullifier
        </text>
      </g>

      {/* Wire: Match Validator → Public Outputs */}
      <path d="M580 160 H605" stroke="rgba(196,57,15,0.6)" strokeWidth="2" fill="none" />
      <circle cx="580" cy="160" r="2.5" fill="rgba(196,57,15,0.8)" />
      <circle cx="605" cy="160" r="2.5" fill="rgba(196,57,15,0.8)" />

      {/* Commitment taps: Poseidon → Public Outputs */}
      <path
        d="M420 85 H575 V128 H605"
        stroke="rgba(196,57,15,0.25)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <path
        d="M420 225 H575 V192 H605"
        stroke="rgba(196,57,15,0.25)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Public outputs — clear gap from validator (ends x=580) */}
      <g transform="translate(605, 118)">
        <rect width="130" height="84" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(196,57,15,0.35)" />
        <text x="65" y="20" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          PUBLIC OUTPUTS
        </text>
        <text x="12" y="42" fill="#B76653" fontSize="9" fontFamily="DM Mono">
          commitment_a
        </text>
        <text x="12" y="58" fill="#B76653" fontSize="9" fontFamily="DM Mono">
          commitment_b
        </text>
        <text x="12" y="74" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">
          match_valid
        </text>
      </g>

      {/* Groth16 proof */}
      <g transform="translate(40, 290)">
        <rect width="740" height="24" rx="4" fill="rgba(196,57,15,0.08)" stroke="rgba(196,57,15,0.2)" />
        <text x="370" y="16" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          Groth16 proof π = Prove(circuit, private_inputs, public_signals) — 18,432 R1CS constraints
        </text>
      </g>
    </svg>
  )
}
