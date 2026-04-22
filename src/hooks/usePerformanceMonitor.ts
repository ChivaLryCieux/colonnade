import { useEffect } from 'react'

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${componentName} mounted`)
      const start = performance.now()
      return () => {
        const end = performance.now()
        console.log(`[Performance] ${componentName} unmounted after ${(end - start).toFixed(2)}ms`)
      }
    }
    return
  }, [componentName])
}
