import TimelinePage from '../src/test_pages/TimelinePage';
import { test, expect } from '@playwright/test';

test.describe('Timeline Page Tests', () => {
    test('Test route selection disappears after line number is closed', async ({page})=>{
        await page.goto('/')
        await page.getByText('לוח זמנים היסטורי', { exact: true }).click()
        await expect(page).toHaveURL(/timeline/);
        await page.getByRole('progressbar').waitFor({ state: 'hidden' })
        const timelinePage = new TimelinePage(page)

        await timelinePage.selectOperatorFromDropbox("אגד");
        await timelinePage.fillLineNumber("1");
        await timelinePage.closeLineNumber();
        await timelinePage.verifyRouteSelectionVisible(false)
    })

    test('Test route selection appears after line number selected', async ({page})=>{
        await page.goto('/')
        await page.getByText('לוח זמנים היסטורי', { exact: true }).click()
        await expect(page).toHaveURL(/timeline/);
        await page.getByRole('progressbar').waitFor({ state: 'hidden' })
        const timelinePage = new TimelinePage(page)

        await timelinePage.selectOperatorFromDropbox("אגד");
        await timelinePage.fillLineNumber("1");
        await timelinePage.verifyRouteSelectionVisible(true)
    })   
})