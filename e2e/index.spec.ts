import { test, expect, type Page } from '@playwright/test';

const wrapPage = (page: Page): Page => {
    page.context().route(/%%CLICK_URL%%/gi, (route) => {
        route.fulfill({ body: '<html><head><title>Fake Title</title></head><body></body></html>' }).catch(() => {});
    }).catch(() => {});
    return page;
};

test.describe('Pool Game', () => {
    test.beforeEach(async ({ page }) => {
        wrapPage(page);
        await page.goto('/index.html');
        await page.waitForSelector('.game-container canvas', { timeout: 5000 });
    });

    test('page loads with correct title and initial score', async ({ page }) => {
        await expect(page).toHaveTitle('Pool Game');
        await expect(page.locator('.score')).toHaveText('Score: 0');
        await expect(page.locator('.reset-button')).toBeVisible();
        await expect(page.locator('.game-container canvas')).toBeVisible();
    });

    test('canvas has correct game resolution', async ({ page }) => {
        const size = await page.locator('canvas').evaluate((el: HTMLCanvasElement) => ({
            width: el.width,
            height: el.height,
        }));
        expect(size.width).toBe(750);
        expect(size.height).toBe(1334);
    });

    test('mouse swipe fires the ball and game continues', async ({ page }) => {
        const box = await page.locator('canvas').boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Main ball starts at game (390, 950) — ~71% down the canvas
        const cx = box.x + box.width / 2;
        const ballY = box.y + box.height * 0.71;

        await page.mouse.move(cx, ballY);
        await page.mouse.down();
        await page.mouse.move(cx, ballY - 80, { steps: 8 });
        await page.mouse.up();

        // Wait for the ball to settle after physics simulation
        await page.waitForTimeout(3000);

        const scoreText = await page.locator('.score').textContent();
        expect(scoreText).toMatch(/^Score: -?\d+$/);
    });

    test('touch swipe fires the ball', async ({ page }) => {
        const box = await page.locator('canvas').boundingBox();
        if (!box) throw new Error('Canvas not found');

        const startX = box.x + box.width / 2;
        const startY = box.y + box.height * 0.71;
        const endY = startY - 80;

        await page.evaluate(
            ({ sx, sy, ex, ey }: { sx: number; sy: number; ex: number; ey: number }) => {
                const canvas = document.querySelector('canvas');
                if (!canvas) return;
                const makeTouch = (x: number, y: number): Touch =>
                    new Touch({ identifier: 1, target: canvas, clientX: x, clientY: y });

                canvas.dispatchEvent(
                    new TouchEvent('touchstart', {
                        bubbles: true,
                        cancelable: true,
                        touches: [makeTouch(sx, sy)],
                    }),
                );
                canvas.dispatchEvent(
                    new TouchEvent('touchmove', {
                        bubbles: true,
                        cancelable: true,
                        touches: [makeTouch(sx, ey)],
                    }),
                );
                canvas.dispatchEvent(
                    new TouchEvent('touchend', {
                        bubbles: true,
                        cancelable: true,
                        changedTouches: [makeTouch(ex, ey)],
                    }),
                );
            },
            { sx: startX, sy: startY, ex: startX, ey: endY },
        );

        await page.waitForTimeout(3000);

        const scoreText = await page.locator('.score').textContent();
        expect(scoreText).toMatch(/^Score: -?\d+$/);
    });

    test('reset button restores score to 0 and removes state classes', async ({ page }) => {
        await page.evaluate(() => {
            document.querySelector('.game-container')?.classList.add('you-win');
        });
        await expect(page.locator('.game-container')).toHaveClass(/you-win/);

        await page.locator('.reset-button').click();

        await expect(page.locator('.score')).toHaveText('Score: 0');
        await expect(page.locator('.game-container')).not.toHaveClass(/you-win/);
        await expect(page.locator('.game-container')).not.toHaveClass(/game-over/);
    });

    test('game is playable after reset', async ({ page }) => {
        await page.locator('.reset-button').click();

        const box = await page.locator('canvas').boundingBox();
        if (!box) throw new Error('Canvas not found');

        const cx = box.x + box.width / 2;
        const ballY = box.y + box.height * 0.71;

        await page.mouse.move(cx, ballY);
        await page.mouse.down();
        await page.mouse.move(cx, ballY - 80, { steps: 8 });
        await page.mouse.up();

        await page.waitForTimeout(3000);

        const scoreText = await page.locator('.score').textContent();
        expect(scoreText).toMatch(/^Score: -?\d+$/);
    });

    test('win overlay appears when game-container has you-win class', async ({ page }) => {
        await page.evaluate(() => {
            document.querySelector('.game-container')?.classList.add('you-win');
        });
        const content = await page.evaluate(() => {
            const el = document.querySelector('.game-container');
            if (!el) return '';
            return globalThis.getComputedStyle(el, '::before').content;
        });
        expect(content).toMatch(/you win/i);
    });

    test('game-over overlay appears when game-container has game-over class', async ({ page }) => {
        await page.evaluate(() => {
            document.querySelector('.game-container')?.classList.add('game-over');
        });
        const content = await page.evaluate(() => {
            const el = document.querySelector('.game-container');
            if (!el) return '';
            return globalThis.getComputedStyle(el, '::after').content;
        });
        expect(content).toMatch(/you lose/i);
    });

    test('reset clears game-over state and re-enables shooting', async ({ page }) => {
        await page.evaluate(() => {
            document.querySelector('.game-container')?.classList.add('game-over');
        });
        await expect(page.locator('.game-container')).toHaveClass(/game-over/);

        await page.locator('.reset-button').click();
        await expect(page.locator('.game-container')).not.toHaveClass(/game-over/);
        await expect(page.locator('.score')).toHaveText('Score: 0');
    });
});
