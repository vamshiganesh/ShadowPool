import { useEffect, type ReactNode } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import { cancelFrame, frame, useReducedMotion } from 'framer-motion'
import '@/features/landing/styles/landing-scroll.css'

function LenisFramerBridge() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    const instance = lenis

    function onFrame(data: { timestamp: number }) {
      instance.raf(data.timestamp)
    }

    frame.update(onFrame, true)
    return () => cancelFrame(onFrame)
  }, [lenis])

  return null
}

export function LandingSmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return children
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.88,
        touchMultiplier: 1.3,
        syncTouch: true,
        syncTouchLerp: 0.12,
        touchInertiaExponent: 1.75,
        autoRaf: false,
        anchors: {
          duration: 1.35,
          lerp: 0.08,
        },
      }}
    >
      <LenisFramerBridge />
      {children}
    </ReactLenis>
  )
}
