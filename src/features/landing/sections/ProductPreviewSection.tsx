import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { TradingAppPreview } from '@/features/landing/TradingAppPreview'
import { Container } from '@/components/ui/Container'

export function ProductPreviewSection() {
  const previewRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // 0 → preview enters from below; 1 → preview center aligns with viewport center
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ['start end', 'center center'],
  })

  const rotateX = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [16, 0],
  )
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [0.94, 1],
  )
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [32, 0],
  )
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35],
    reduceMotion ? [1, 1] : [0.6, 1],
  )

  return (
    <section
      className="relative -mt-6 pb-20 pt-4 sm:pb-24 lg:pb-28"
      aria-label="Product preview"
    >
      <Container className="[perspective:1200px]">
        <motion.div
          ref={previewRef}
          style={{
            rotateX,
            scale,
            y,
            opacity,
            transformPerspective: 1200,
          }}
          className="origin-[center_85%] will-change-transform [transform:translateZ(0)]"
        >
          <TradingAppPreview surface="solid" />
        </motion.div>
      </Container>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg-base"
        aria-hidden="true"
      />
    </section>
  )
}
