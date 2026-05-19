import { PrototypeStage } from './PrototypeStage'

/**
 * Standalone prototype route at /prototype. Renders the CarPlay screen
 * centered on a dark slate background with the floating debug panel.
 */
export function PrototypePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <PrototypeStage showDebugPanel />
    </div>
  )
}
