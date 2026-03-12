import { useCallback, useEffect } from 'react'

interface UseOverlayOptions {
  isOpen: boolean
  onClose: () => void
}

export function useOverlay({ isOpen, onClose }: UseOverlayOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return { handleBackdropClick: onClose }
}
