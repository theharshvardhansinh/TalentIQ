// bot.js (Updated for Server)
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function captureProblem(problemUrl) {
    console.log(`🤖 Bot starting for: ${problemUrl}`);
    let browser = null;

    try {
        browser = await puppeteer.launch({
            // 👇 KEEP YOUR CHROME PATH HERE (Double backslashes!)
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Go to the page
        await page.goto(problemUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait for the problem box
        await page.waitForSelector('.problem-statement', { timeout: 10000 });

        const element = await page.$('.problem-statement');
        if (!element) throw new Error("Problem statement not found!");

        // ⏳ Wait for 3 seconds to ensure MathJax/content is fully rendered
        await new Promise(r => setTimeout(r, 3000));

        // 📸 Capture screenshot as a BUFFER (Data) instead of a file
        const imageBuffer = await element.screenshot();

        await browser.close();
        return imageBuffer; // Send data back to server

    } catch (error) {
        console.error("❌ Bot Error:", error.message);
        if (browser) await browser.close();
        throw error;
    }
}

// Export the function so server.js can use it
module.exports = { captureProblem };