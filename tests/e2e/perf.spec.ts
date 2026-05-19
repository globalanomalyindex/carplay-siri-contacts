import { test, expect } from '@playwright/test'

test.describe('Performance budget', () => {
  test('long pointer drag stays above 50fps frame rate', async ({ page }) => {
    await page.goto('/')

    const orbHit = page.getByTestId('master-orb-hit')
    const box = await orbHit.boundingBox()
    if (!box) throw new Error('orb not visible')

    const frames = await page.evaluate(async (drag) => {
      const samples: number[] = []
      function onFrame(t: number) {
        samples.push(t)
        if (samples.length < 60) requestAnimationFrame(onFrame)
      }
      requestAnimationFrame(onFrame)

      const evtDown = new PointerEvent('pointerdown', { pointerId: 1, clientX: drag.x, clientY: drag.y, bubbles: true })
      document.elementFromPoint(drag.x, drag.y)?.dispatchEvent(evtDown)

      for (let i = 0; i < 30; i++) {
        await new Promise((r) => requestAnimationFrame(r))
        const evt = new PointerEvent('pointermove', {
          pointerId: 1, clientX: drag.x + i * 6, clientY: drag.y + i * 4, bubbles: true,
        })
        document.dispatchEvent(evt)
      }
      const evtUp = new PointerEvent('pointerup', { pointerId: 1, clientX: drag.x + 200, clientY: drag.y + 120, bubbles: true })
      document.dispatchEvent(evtUp)

      await new Promise((r) => setTimeout(r, 200))
      return samples
    }, { x: Math.floor(box.x + box.width / 2), y: Math.floor(box.y + box.height / 2) })

    const intervals: number[] = []
    for (let i = 1; i < frames.length; i++) intervals.push(frames[i] - frames[i - 1])
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const fps = 1000 / avg
    console.log(`Average FPS during drag: ${fps.toFixed(1)}`)
    expect(fps).toBeGreaterThan(50)
  })
})
