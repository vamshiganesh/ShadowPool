import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { TradingAppPreview } from '@/features/landing/TradingAppPreview'
import { Container } from '@/components/ui/Container'

export function ProductPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.45, 0.75],
    reduceMotion ? [0, 0, 0] : [34, 8, 0],
  )
  const scale = useTransform(
    scrollYProgress,
    [0, 0.45, 0.75],
    reduceMotion ? [1, 1, 1] : [0.86, 0.94, 1],
  )
  const y = useTransform(
    scrollYProgress,
    [0, 0.45, 0.75],
    reduceMotion ? [0, 0, 0] : [72, 28, 0],
  )
  const opacity = useTransform(scrollYProgress, [0, 0.2], reduceMotion ? [1, 1] : [0.55, 1])

  return (
    <section
      ref={sectionRef}
      className="relative -mt-6 h-[145vh] sm:h-[135vh] lg:h-[125vh]"
      aria-label="Product preview"
    >
      <div className="sticky top-[10vh] z-10 pb-16 pt-2 sm:top-[12vh] lg:top-[14vh]">
        <Container className="[perspective:1400px]">
          <motion.div
            style={{
              rotateX,
              scale,
              y,
              opacity,
              transformPerspective: 1400,
              transformStyle: 'preserve-3d',
            }}
            className="origin-[center_80%] will-change-transform"
          >
            <TradingAppPreview />
          </motion.div>
        </Container>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg-base"
        aria-hidden="true"
      />
    </section>
  )
}
