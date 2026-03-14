export function CircuitDiagram() {
  return (
    <svg viewBox="0 0 800 320" className="w-full" aria-label="ShadowPool match circuit diagram">
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
      {[...Array(12)].map((_, i) =>
        [...Array(8)].map((_, j) => (
          <circle
            key={`${i}-${j}`}
            cx={40 + i * 64}
            cy={40 + j * 36}
            r="0.5"
            fill="rgba(245,240,238,0.06)"
          />
        )),
      )}

      {/* Private inputs - Order A */}
      <g transform="translate(40, 60)">
        <rect width="140" height="90" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(245,240,238,0.1)" />
        <text x="70" y="20" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">PRIVATE INPUT A</text>
        <text x="12" y="42" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">amount_a</text>
        <text x="12" y="58" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">price_a</text>
        <text x="12" y="74" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">salt_a</text>
      </g>

      {/* Private inputs - Order B */}
      <g transform="translate(40, 170)">
        <rect width="140" height="90" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(245,240,238,0.1)" />
        <text x="70" y="20" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">PRIVATE INPUT B</text>
        <text x="12" y="42" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">amount_b</text>
        <text x="12" y="58" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">price_b</text>
        <text x="12" y="74" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">salt_b</text>
      </g>

      {/* Wires to Poseidon */}
      <path d="M180 105 H280" stroke="rgba(196,57,15,0.5)" strokeWidth="1.5" />
      <path d="M180 215 H280" stroke="rgba(196,57,15,0.5)" strokeWidth="1.5" />
      <path d="M280 105 V160 H340" stroke="rgba(196,57,15,0.3)" strokeWidth="1.5" fill="none" />
      <path d="M280 215 V160 H340" stroke="rgba(196,57,15,0.3)" strokeWidth="1.5" fill="none" />

      {/* Poseidon Hash nodes */}
      <g transform="translate(340, 50)" filter="url(#glow)">
        <rect width="120" height="70" rx="8" fill="url(#nodeGlow)" stroke="rgba(196,57,15,0.5)" />
        <text x="60" y="28" textAnchor="middle" fill="#C4390F" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Poseidon</text>
        <text x="60" y="48" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">commit_a</text>
        <text x="60" y="60" textAnchor="middle" fill="rgba(245,240,238,0.28)" fontSize="7" fontFamily="DM Mono">254 constraints</text>
      </g>

      <g transform="translate(340, 200)" filter="url(#glow)">
        <rect width="120" height="70" rx="8" fill="url(#nodeGlow)" stroke="rgba(196,57,15,0.5)" />
        <text x="60" y="28" textAnchor="middle" fill="#C4390F" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Poseidon</text>
        <text x="60" y="48" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">commit_b</text>
        <text x="60" y="60" textAnchor="middle" fill="rgba(245,240,238,0.28)" fontSize="7" fontFamily="DM Mono">254 constraints</text>
      </g>

      {/* Match validation */}
      <g transform="translate(520, 115)">
        <rect width="130" height="90" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(245,240,238,0.12)" />
        <text x="65" y="22" textAnchor="middle" fill="#f5f0ee" fontSize="9" fontFamily="Plus Jakarta Sans">Match Validator</text>
        <text x="12" y="44" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">price_a ≥ price_b</text>
        <text x="12" y="60" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">amount check</text>
        <text x="12" y="76" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">nullifier</text>
      </g>

      <path d="M460 85 H520" stroke="rgba(245,240,238,0.15)" strokeWidth="1.5" />
      <path d="M460 235 H520" stroke="rgba(245,240,238,0.15)" strokeWidth="1.5" />
      <path d="M585 160 H640" stroke="rgba(196,57,15,0.6)" strokeWidth="2" />

      {/* Public outputs */}
      <g transform="translate(640, 120)">
        <rect width="140" height="80" rx="8" fill="rgba(18,16,20,0.9)" stroke="rgba(196,57,15,0.35)" />
        <text x="70" y="22" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">PUBLIC OUTPUTS</text>
        <text x="12" y="44" fill="#B76653" fontSize="9" fontFamily="DM Mono">commitment_a</text>
        <text x="12" y="60" fill="#B76653" fontSize="9" fontFamily="DM Mono">commitment_b</text>
        <text x="12" y="76" fill="#f5f0ee" fontSize="9" fontFamily="DM Mono">match_valid</text>
      </g>

      {/* Groth16 proof */}
      <g transform="translate(340, 290)">
        <rect width="440" height="24" rx="4" fill="rgba(196,57,15,0.08)" stroke="rgba(196,57,15,0.2)" />
        <text x="220" y="16" textAnchor="middle" fill="rgba(245,240,238,0.48)" fontSize="8" fontFamily="DM Mono">
          Groth16 proof π = Prove(circuit, private_inputs, public_signals) — 18,432 R1CS constraints
        </text>
      </g>
    </svg>
  )
}
