import { test, expect } from '@playwright/test'

test.describe('Reduce Motion', () => {
  test('orb does not animate scale loop when reduce-motion is enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const orb = page.getByTestId('master-orb')
    const transform1 = await orb.evaluate((el) => getComputedStyle(el).transform)
    await page.waitForTimeout(2000)
    const transform2 = await orb.evaluate((el) => getComputedStyle(el).transform)
    expect(transform1).toBe(transform2)
  })

  test('dissipation particles do not render when reduce-motion is on', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const orbHit = page.getByTestId('master-orb-hit')
    const box = await orbHit.boundingBox()
    if (!box) throw new Error('orb not visible')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 80, box.y + box.height / 2)

    const particles = await page.locator('[data-testid="dissipation-particle"]').count()
    expect(particles).toBe(0)

    await page.mouse.up()
  })
})
