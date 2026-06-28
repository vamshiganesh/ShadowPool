/** Warm the app shell chunk before navigation (e.g. Launch App hover). */
export function prefetchAppSection(): void {
  void import('@/app/appSection')
}
