export function MetaMaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#F6851B" />
      <path
        d="M23.5 6.5L18 15.5l1.5 4.5 3.5 1 4.5-14.5zM8.5 6.5l4.4 14.5 3.5-1 1.5-4.5-5.4-9z"
        fill="#E2761B"
      />
      <path
        d="M8.5 6.5l5.5 14 1-0.5 0.5-2.5H11.5L8.5 6.5zm15 0l-3 11-0.5 2.5 1 0.5 5.5-14z"
        fill="#E4761B"
      />
      <path d="M13 18.5h6l-0.5 3-2.5 1.5-2.5-1.5-.5-3z" fill="#D7C1B3" />
      <path d="M13 18.5l0.5 3 2 1.5v-4.5H13zm6 0h-2.5v4.5l2-1.5.5-3z" fill="#233447" />
    </svg>
  )
}

export function WalletConnectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#3B99FC" />
      <path
        d="M10.2 12.8c3.5-3.4 9.1-3.4 12.6 0l0.4 0.4c0.2 0.2 0.2 0.5 0 0.7l-1.4 1.4c-0.1 0.1-0.3 0.1-0.4 0l-0.6-0.6c-2.4-2.4-6.4-2.4-8.8 0l-0.6 0.6c-0.1 0.1-0.3 0.1-0.4 0l-1.4-1.4c-0.2-0.2-0.2-0.5 0-0.7l0.4-0.4zm15.6 2.9l1.3 1.3c0.2 0.2 0.2 0.5 0 0.7l-5.7 5.7c-0.2 0.2-0.5 0.2-0.7 0l-4-4c-0.1-0.1-0.2-0.1-0.2 0l-4 4c-0.2 0.2-0.5 0.2-0.7 0l-5.7-5.7c-0.2-0.2-0.2-0.5 0-0.7l1.3-1.3c0.2-0.2 0.5-0.2 0.7 0l4 4c0.1 0.1 0.2 0.1 0.2 0l4-4c0.2-0.2 0.5-0.2 0.7 0l4 4c0.1 0.1 0.2 0.1 0.2 0l4-4c0.2-0.2 0.5-0.2 0.7 0z"
        fill="white"
      />
    </svg>
  )
}
