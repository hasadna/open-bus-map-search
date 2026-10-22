import { expect, type Page } from '@playwright/test'

/**
 * Verifies a `position: sticky` bar behaves correctly in BOTH states:
 *
 * 1. At rest (no scroll): captures its computed background. Caller can assert
 *    e.g. transparency so the bar visually matches the page baseline.
 * 2. Scrolled: wheel-scrolls the page so content moves under the bar, then
 *    captures the bar's new background AND checks it is still visible at the
 *    top (i.e. actually stuck, not scrolled away). When the bar is opaque
 *    while content scrolls under it, the bleed-through bug is impossible by
 *    construction.
 *
 * Returns the metrics so callers can write the exact assertions they want.
 *
 * @example
 *   const m = await verifyStickyBar(page, { selector: '[data-sticky-inputs]' })
 *   // assert conditional opacity (transparent at rest, opaque when stuck)
 *   expect(m.atRestBg).toBe('rgba(0, 0, 0, 0)')
 *   expect(m.scrolledBg).not.toBe('rgba(0, 0, 0, 0)')
 *   // assert it actually stuck rather than scrolled off
 *   expect(m.stuckAtTop).toBe(true)
 */
export const verifyStickyBar = async (
  page: Page,
  opts: {
    /** CSS selector or test-id for the sticky container. */
    selector: string
    /** Pixels to wheel-scroll. Defaults to 1080 (12 ticks × 90px). */
    scrollBy?: number
    /** Coords to put the mouse under before wheeling. Defaults to page center. */
    cursor?: { x: number; y: number }
  },
): Promise<{
  /** Computed `background-color` of the sticky element before scrolling. */
  atRestBg: string
  /** Computed `background-color` after scrolling content under it. */
  scrolledBg: string
  /** True when background differs between states (proves conditional opacity). */
  conditionallyOpaque: boolean
  /** True when the sticky element is still pinned within the top 100px of viewport
   * after scrolling — i.e. it actually stuck, didn't scroll away with content. */
  stuckAtTop: boolean
}> => {
  const el = page.locator(opts.selector).first()
  await expect(el).toBeVisible()

  const readBg = () => el.evaluate((node) => getComputedStyle(node as HTMLElement).backgroundColor)

  const atRestBg = await readBg()

  // Wheel-scroll the inner scroll container under the cursor. window.scrollTo
  // doesn't move it in apps with an inner scrollable layout (this codebase).
  const scrollBy = opts.scrollBy ?? 1080
  const cursor = opts.cursor ?? {
    x: Math.round(page.viewportSize()!.width / 2),
    y: Math.round(page.viewportSize()!.height / 2),
  }
  await page.mouse.move(cursor.x, cursor.y)
  const ticks = Math.max(1, Math.round(scrollBy / 90))
  for (let i = 0; i < ticks; i++) {
    await page.mouse.wheel(0, 90)
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(400)

  const scrolledBg = await readBg()
  const stuckAtTop = await el.evaluate(
    (node) => (node as HTMLElement).getBoundingClientRect().top <= 100,
  )

  return {
    atRestBg,
    scrolledBg,
    conditionallyOpaque: atRestBg !== scrolledBg,
    stuckAtTop,
  }
}
