import { Container } from '@/components/ui/Container'
import { APP_NAME } from '@/lib/constants/routes'

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <span className="font-heading text-sm font-medium text-text-secondary">{APP_NAME}</span>
          <p className="font-mono text-[11px] text-text-faint">
            ZK dark pool protocol · Ethereum
          </p>
        </div>
      </Container>
    </footer>
  )
}
