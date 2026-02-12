
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
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
        // Launch vanilla puppeteer
        // Dynamic Path: Uses server's Chrome in production, local Windows Chrome in development
        const IS_PRODUCTION = process.env.NODE_ENV === 'production';
        const browserPath = IS_PRODUCTION
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

        browser = await puppeteer.launch({
            executablePath: browserPath,
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Vital for cloud memory limits
                '--single-process',         // Improves stability on smaller instances
                '--no-zygote',
                '--disable-blink-features=AutomationControlled' // Retaining this for bot evasion
            ]
        });

        const page = await browser.newPage();

        // Set a realistic User-Agent to avoid basic bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        await page.setViewport({ width: 1920, height: 1080 });

        let selector = '.problem-statement'; // Default for Codeforces
        let captureFullPage = false;

        if (problemUrl.includes('codechef.com')) {
            console.log("Detecting CodeChef URL...");
            await page.goto(problemUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // ⏳ Initial breather for React hydration (5s)
            await new Promise(r => setTimeout(r, 5000));

            // CodeChef dynamic selector search
            try {
                // Expanded list of selectors including generic containers & Course page specific
                const possibleSelectors = [
                    '#problem-statement',
                    'div[class*="ProblemStatement"]',
                    'div[class*="_problemBody_"]',
                    'div[class*="_statement_"]', // Course pages often use this
                    'div[class*="problem-statement"]',
                    'main',
                    'div.content'
                ];

                // Wait longer for slow connections (30s)
                await page.waitForFunction((selectors) => {
                    return selectors.some(s => document.querySelector(s));
                }, { timeout: 30000 }, possibleSelectors);

                // Find which one exists
                const foundSelector = await page.evaluate((selectors) => {
                    return selectors.find(s => document.querySelector(s));
                }, possibleSelectors);

                if (foundSelector) {
                    selector = foundSelector;
                    console.log(`Found CodeChef selector: ${selector}`);
                }
            } catch (e) {
                console.warn("CodeChef specific selector wait timed out, falling back to full page");
                captureFullPage = true;
            }

        } else if (problemUrl.includes('leetcode.com')) {
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
        // CodeChef gets 15s, LeetCode & Codeforces get 8s
        const waitTime = problemUrl.includes('codechef.com') ? 15000 : 8000;
        await new Promise(r => setTimeout(r, waitTime));

        let imageBuffer;
        if (captureFullPage) {
            if (problemUrl.includes('leetcode.com')) {
                console.log("Capturing left-side clip for LeetCode fallback...");
                // Capture roughly the left half (description area)
                imageBuffer = await page.screenshot({ clip: { x: 0, y: 0, width: 900, height: 1080 } });
            } else {
                console.log("Capturing full page screenshot as fallback...");
                imageBuffer = await page.screenshot({ fullPage: true });
            }
        } else {
            const element = await page.$(selector);
            if (!element) throw new Error(`Problem statement element (${selector}) not found!`);
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
