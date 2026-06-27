import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { StatusPill } from '@/components/ui/StatusPill'
import { APP_NAME, GITHUB_URL, ROUTES } from '@/lib/constants/routes'


export function FooterSection() {
  return (
    <footer className="border-t border-border-subtle">
      {/* Status strip */}
      <div className="border-b border-border-subtle bg-bg-elevated/40 py-3">
        <Container>
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-text-faint">
              <span>
                NETWORK: <span className="text-text-secondary">SEPOLIA</span>
              </span>
              <span className="hidden text-border-strong sm:inline">|</span>
              <span className="flex items-center gap-2">
                ORDERBOOK: <StatusPill label="Live" variant="success" dot />
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              © 2026 {APP_NAME} ZK Protocol
            </p>
          </div>
        </Container>
      </div>

      {/* Main footer */}
      <div className="py-14">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-heading text-sm font-semibold text-text-primary">{APP_NAME}</p>
              <p className="mt-2 max-w-xs text-sm text-text-muted">
                Institutional-grade ZK dark pool execution for Ethereum.
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                Protocol
              </p>
              <nav className="mt-3 flex flex-col gap-2">
                <FooterLink to={ROUTES.docs.problem}>The Problem</FooterLink>
                <FooterLink to={ROUTES.docs.zkCommitments}>ZK Commitments</FooterLink>
                <FooterLink to={ROUTES.docs.circuitDiagram}>Circuit Diagram</FooterLink>
              </nav>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                Resources
              </p>
              <nav className="mt-3 flex flex-col gap-2">
                <FooterLink to={ROUTES.app}>Launch App</FooterLink>
                <FooterLink to={ROUTES.stats}>Protocol Stats</FooterLink>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-muted transition-colors hover:text-text-secondary"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 sm:flex-row">
            <p className="font-mono text-[10px] text-text-faint">
              Groth16 · Circom v2 · v1.0.4-stable
            </p>
            <p className="font-mono text-[10px] text-text-faint">
              Security Audit · Network Status: Operational
            </p>
          </div>
        </Container>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm text-text-muted transition-colors hover:text-text-secondary"
    >
      {children}
    </Link>
  )
}
