import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // pre-bundle the 3D stack up front so the dev server never has to re-optimise mid-session
  // (that answers lazy chunks with "504 Outdated Optimize Dep" and the scenes fail to load)
  optimizeDeps: {
    include: [
      'three',
      'three-stdlib',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'postprocessing',
      'three/examples/jsm/environments/RoomEnvironment.js',
    ],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        // keep the heavy 3D stack in its own cacheable chunks, loaded only when a canvas mounts
        codeSplitting: {
          // don't drag shared deps (react, zustand…) into the 3D chunks
          includeDependenciesRecursively: false,
          groups: [
            { name: 'three-core', test: /node_modules[\\/]three[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/](@react-three[\\/](fiber|drei)|three-stdlib|camera-controls|maath)/ },
            { name: 'postfx', test: /node_modules[\\/](postprocessing|@react-three[\\/]postprocessing)/ },
          ],
        },
      },
    },
  },
})
