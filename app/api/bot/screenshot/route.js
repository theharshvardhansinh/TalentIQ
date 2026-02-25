
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import ImageKit from 'imagekit';

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function captureProblem(problemUrl) {
    console.log(`🤖 Bot starting for: ${problemUrl}`);
    let browser = null;

    try {
        const IS_PRODUCTION = process.env.NODE_ENV === 'production';

        if (IS_PRODUCTION) {
            // Connect to Browserless.io in production
            browser = await puppeteer.connect({
                browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
            });
        } else {
            // Local development
            const browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            browser = await puppeteer.launch({
                executablePath: browserPath,
                headless: "new",
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--single-process',
                    '--no-zygote',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
        }

        const page = await browser.newPage();

        // 🕵️ FINAL SOLUTION: Comprehensive Stealth Mode (Manual Evasion)
        await page.evaluateOnNewDocument(() => {
            // 1. Pass webdriver check
            Object.defineProperty(navigator, 'webdriver', { get: () => false });

            // 2. Mock Languages
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

            // 3. Mock Plugins (Basic)
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });

            // 4. Mock Window.chrome
            window.chrome = { runtime: {} };

            // 5. Mock Permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        // Set realistic headers with Referer to look like traffic from Google
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
        });

        // Set realistic headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        // Set a realistic User-Agent to avoid basic bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        await page.setViewport({ width: 1920, height: 1080 });

        let selector = '.problem-statement'; // Default for Codeforces
        let captureFullPage = false;

        // Simulate some mouse movement
        try {
            await page.mouse.move(100, 100);
            await page.mouse.move(200, 200, { steps: 10 });
        } catch (e) { }

        if (problemUrl.includes('leetcode.com')) {
            console.log("Detecting LeetCode URL...");

            // LeetCode navigation - strict try/catch to handle timeouts (often due to bot checks)
            try {
                await page.goto(problemUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            } catch (navError) {
                console.warn("LeetCode navigation timed out or failed (likely bot check), attempting to proceed anyway...", navError.message);
            }

            // LeetCode dynamic selector
            try {
                // LeetCode selectors are often obfuscated. 
                // We look for reliable containers or data attributes.
                const possibleSelectors = [
                    '[data-track-load="description_content"]',
                    'div.elfjS',
                    '#question-detail-main-tabs',
                    'div[class*="description__"]',
                    'div[id="driver-container"]',
                    '.flex.h-full.w-full.flex-col', // Generic container
                    '#qd-content'
                ];

                await page.waitForFunction((selectors) => {
                    return selectors.some(s => document.querySelector(s));
                }, { timeout: 15000 }, possibleSelectors);

                const foundSelector = await page.evaluate((selectors) => {
                    return selectors.find(s => document.querySelector(s));
                }, possibleSelectors);

                if (foundSelector) {
                    selector = foundSelector;
                    console.log(`Found LeetCode selector: ${selector}`);
                } else {
                    console.warn("LeetCode specific selector not found, attempting clip fallback");
                    captureFullPage = true;
                }
            } catch (e) {
                console.warn("LeetCode selector wait timed out, falling back to clip");
                captureFullPage = true;
            }

        } else {
            // Codeforces
            await page.goto(problemUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForSelector('.problem-statement', { timeout: 15000 });
        }

        // 📸 Wait specifically for MathJax to finish processing (if present)
        try {
            await page.waitForFunction(
                () => window.MathJax && window.MathJax.Hub && window.MathJax.Hub.queue && window.MathJax.Hub.queue.pending == 0,
                { timeout: 5000 }
            ).catch(() => console.log("MathJax wait skipped or timed out"));
        } catch (e) {
            // Ignore if MathJax isn't there
        }

        // ⏳ Wait for ensure everything is stable
        // CodeChef gets extra time (20s), LeetCode & Codeforces get 8s
        const waitTime = 8000;
        console.log(`Final stability wait: ${waitTime}ms`);
        await new Promise(r => setTimeout(r, waitTime));

        let imageBuffer;
        if (captureFullPage || selector === 'body') {
            // 📏 RESIZE VIEWPORT STRATEGY (Fixes White Screen)
            // Instead of fullPage: true (which fails on virtualized apps), we resize the window to fit the content.
            const bodyHeight = await page.evaluate(() => Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight));

            console.log(`Resizing viewport to full height: ${bodyHeight}px`);
            await page.setViewport({ width: 1920, height: Math.max(bodyHeight, 1080) });

            if (problemUrl.includes('leetcode.com')) {
                console.log("Capturing left-side clip for LeetCode fallback...");
                imageBuffer = await page.screenshot({ clip: { x: 0, y: 0, width: 900, height: bodyHeight } });
            } else {
                console.log("Capturing viewport screenshot (simulated full page)...");
                // Standard screenshot of the now-huge viewport
                imageBuffer = await page.screenshot();
            }
        } else {
            // For element screenshot, ensure it fits in viewport or expand viewport
            const element = await page.$(selector);
            if (!element) throw new Error(`Problem statement element (${selector}) not found!`);

            // Helpful for long problem statements:
            // Calculate height of element and resize viewport if needed
            const bbox = await element.boundingBox();
            if (bbox) {
                await page.setViewport({ width: 1920, height: Math.ceil(bbox.height + bbox.y + 100) });
            }

            imageBuffer = await element.screenshot();
        }

        await browser.close();
        return imageBuffer; // Send data back to server

    } catch (error) {
        console.error("❌ Bot Error:", error.message);
        if (browser) await browser.close();
        throw error;
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        console.log(`📸 Processing: ${url}...`);

        let imageBuffer;
        try {
            // Capture screenshot using Puppeteer
            imageBuffer = await captureProblem(url);
        } catch (botError) {
            console.error("Capture Error:", botError);
            return NextResponse.json({ error: "Failed to capture screenshot: " + botError.message }, { status: 500 });
        }

        console.log("🚀 Uploading to ImageKit...");

        // Upload to ImageKit
        const uploadResponse = await new Promise((resolve, reject) => {
            imagekit.upload({
                file: imageBuffer,
                fileName: `problem-${Date.now()}.png`,
                folder: "/codearena_problems"
            }, (error, result) => {
                if (error) {
                    console.error("ImageKit Upload Error:", error);
                    reject(error);
                }
                else resolve(result);
            });
        });

        console.log(`✅ Done! URL: ${uploadResponse.url}`);

        return NextResponse.json({
            success: true,
            imageUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl,
            originalProblemUrl: url
        });

    } catch (error) {
        console.error("❌ Error in capture:", error.message);
        return NextResponse.json({ error: "Failed to process problem", details: error.message }, { status: 500 });
    }
}
