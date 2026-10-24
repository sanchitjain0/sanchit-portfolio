import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// dev-only `/?capture`: the room alone on a transparent page, for regenerating public/room-*.png
const CaptureView = import.meta.env.DEV ? lazy(() => import('./CaptureView.tsx')) : null
const capture = CaptureView && new URLSearchParams(location.search).has('capture')
if (capture) document.documentElement.classList.add('capture')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {capture && CaptureView ? (
      <Suspense fallback={null}>
        <CaptureView />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
