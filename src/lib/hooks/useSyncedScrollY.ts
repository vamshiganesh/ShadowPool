import { useEffect } from 'react'
import { useMotionValue, useScroll, type MotionValue } from 'framer-motion'
import { useLenis } from 'lenis/react'

export function useSyncedScrollY(): MotionValue<number> {
  const scrollY = useMotionValue(0)
  const { scrollY: fallbackScrollY } = useScroll()
  const lenis = useLenis()

  useLenis((instance) => {
    scrollY.set(instance.scroll)
  })

  useEffect(() => {
    if (lenis) return
    scrollY.set(fallbackScrollY.get())
    return fallbackScrollY.on('change', (value) => scrollY.set(value))
  }, [lenis, fallbackScrollY, scrollY])

  return scrollY
}
