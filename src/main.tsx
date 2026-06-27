import '@/lib/shims/buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { Web3Provider } from '@/app/providers/WagmiProvider'
import { ProtocolEventProvider } from '@/app/providers/ProtocolEventProvider'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <ProtocolEventProvider>
        <App />
      </ProtocolEventProvider>
    </Web3Provider>
  </StrictMode>,
)
