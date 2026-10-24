import { lazy, Suspense } from 'react'
import { useUIStore } from './store/uiStore'

const DevRoom = lazy(() => import('./components/three/DevRoom'))

/** Dev-only (`/?capture`): just the room on a transparent page, used to render public/room-{theme}.png */
export default function CaptureView() {
  const theme = useUIStore((s) => s.theme)
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Suspense fallback={null}>
        <DevRoom theme={theme} lite={false} reducedMotion paused={false} onNavigate={() => {}} onToggleTheme={() => {}} capture />
      </Suspense>
    </div>
  )
}
