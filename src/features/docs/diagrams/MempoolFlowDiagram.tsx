export function MempoolFlowDiagram() {
  return (
    <svg viewBox="0 0 720 200" className="w-full" aria-label="Mempool execution flow vulnerability">
      <defs>
        <linearGradient id="flowOrange" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#AA2608" />
          <stop offset="100%" stopColor="#C4390F" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      <path d="M200 100 H280" stroke="rgba(245,240,238,0.12)" strokeWidth="1.5" />
      <path d="M440 100 H520" stroke="url(#flowOrange)" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Your Transaction */}
      <g transform="translate(20, 40)">
        <rect width="180" height="120" rx="10" fill="rgba(18,16,20,0.8)" stroke="rgba(245,240,238,0.1)" />
        <text x="90" y="28" textAnchor="middle" fill="#f5f0ee" fontSize="11" fontFamily="Plus Jakarta Sans">Your Transaction</text>
        <text x="16" y="52" fill="rgba(245,240,238,0.48)" fontSize="9" fontFamily="DM Mono">Type: SWAP</text>
        <text x="16" y="68" fill="rgba(245,240,238,0.48)" fontSize="9" fontFamily="DM Mono">Amt: 100 ETH</text>
        <text x="16" y="84" fill="rgba(245,240,238,0.48)" fontSize="9" fontFamily="DM Mono">Slippage: 1%</text>
      </g>

      {/* Public Mempool */}
      <g transform="translate(280, 30)">
        <rect width="160" height="140" rx="10" fill="rgba(18,16,20,0.8)" stroke="rgba(196,57,15,0.25)" />
        <text x="80" y="24" textAnchor="middle" fill="#f5f0ee" fontSize="11" fontFamily="Plus Jakarta Sans">Public Mempool</text>
        <rect x="12" y="34" width="80" height="14" rx="3" fill="rgba(248,113,113,0.15)" />
        <text x="52" y="44" textAnchor="middle" fill="#f87171" fontSize="7" fontFamily="DM Mono">VISIBLE TO ALL</text>
        <text x="16" y="68" fill="rgba(245,240,238,0.28)" fontSize="8" fontFamily="DM Mono">0x9c... Transfer</text>
        <rect x="12" y="76" width="136" height="18" rx="4" fill="rgba(196,57,15,0.15)" stroke="rgba(196,57,15,0.35)" />
        <text x="16" y="89" fill="#B76653" fontSize="8" fontFamily="DM Mono">0x1a... Swap 100 ETH</text>
        <text x="16" y="112" fill="rgba(245,240,238,0.28)" fontSize="8" fontFamily="DM Mono">0x4f... Approve</text>
      </g>

      {/* Adversarial Bot */}
      <g transform="translate(520, 40)">
        <rect width="180" height="120" rx="10" fill="rgba(18,16,20,0.8)" stroke="rgba(196,57,15,0.45)" />
        <text x="90" y="28" textAnchor="middle" fill="#C4390F" fontSize="11" fontFamily="Plus Jakarta Sans">Adversarial Bot</text>
        <text x="16" y="56" fill="rgba(245,240,238,0.48)" fontSize="9" fontFamily="DM Mono">Action: Front-run</text>
        <text x="16" y="72" fill="rgba(245,240,238,0.48)" fontSize="9" fontFamily="DM Mono">Target: 0x1a...</text>
        <text x="16" y="96" fill="#B76653" fontSize="9" fontFamily="DM Mono">Profit: +0.85 ETH</text>
      </g>
    </svg>
  )
}
