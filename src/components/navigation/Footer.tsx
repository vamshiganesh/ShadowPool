import { Container } from '@/components/ui/Container'
import { StatusPill } from '@/components/ui/StatusPill'
import { APP_NAME } from '@/lib/constants/routes'

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-primary to-orange-deep" />
            <span className="font-heading text-sm font-medium text-text-secondary">
              {APP_NAME}
            </span>
          </div>
          <p className="font-mono text-xs text-text-faint">
            ZK dark pool protocol · Ethereum
          </p>
        </div>
      </Container>
    </footer>
  )
}

export function StatusBar() {
  return (
    <div className="flex h-9 shrink-0 items-center border-t border-border-subtle bg-bg-elevated/80 px-4">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <StatusPill label="Protocol Online" variant="success" />
          <span className="hidden font-mono text-[11px] text-text-faint sm:inline">
            Block #19,842,103
          </span>
        </div>
        <span className="font-mono text-[11px] text-text-faint">
          Groth16 · Circom v2
        </span>
      </div>
    </div>
  )
}
