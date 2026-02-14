
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log('Starting Test Script...');
    let browser;
    const screenshotDir = path.join(process.cwd(), 'public', 'test_screenshots');

    try {
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        browser = await puppeteer.launch({
            headless: true, // Headless
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // 1. Login
        console.log('Navigating to Login...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 60000 });
        await page.screenshot({ path: path.join(screenshotDir, '01_login.png') });

        console.log('Filling Credentials...');
        try {
            await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
            await page.type('input[type="email"], input[name="email"]', 'test_student_1@example.com');
            await page.type('input[type="password"], input[name="password"]', 'password123');
        } catch (e) {
            console.error('Could not find login inputs:', e.message);
            const html = await page.content();
            fs.writeFileSync(path.join(screenshotDir, 'login_fail.html'), html);
            throw e;
        }
        
        // Find submit button - generic approach
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            await submitBtn.click();
        } else {
            console.log('Submit button not found by type="submit", trying text...');
            const buttons = await page.$$('button');
            let clicked = false;
            for (const btn of buttons) {
                const text = await page.evaluate(el => el.innerText, btn);
                if (text && (text.toLowerCase().includes('sign') || text.toLowerCase().includes('log'))) {
                    await btn.click();
                    clicked = true;
                    break;
                }
            }
            if (!clicked) console.error("Could not find submit button");
        }

        console.log('Waiting for Dashboard...');
        await delay(5000); // Wait for navigation/loading
        await page.screenshot({ path: path.join(screenshotDir, '02_dashboard.png') });

        const url = page.url();
        console.log(`Dashboard URL: ${url}`);
        
        // Check for contest
        const contestTitle = "Automated Test Contest";
        const content = await page.content();
        
        if (content.includes(contestTitle)) {
            console.log(`SUCCESS: Found contest "${contestTitle}"`);
            
             // Use XPath to find the element containing text
             const elements = await page.$x(`//*[contains(text(), '${contestTitle}')]`);
             if (elements.length > 0) {
                 console.log('Clicking contest...');
                 // Click logic might need to be on a parent or interactive element
                 // Just clicking the text node container often works if it bubbles or is the link
                 await elements[0].click();
                 
                 await delay(5000);
                 await page.screenshot({ path: path.join(screenshotDir, '03_contest_details.png') });
                 
                 const problemTitle = "Sum of Two Numbers";
                 const content2 = await page.content();
                 if (content2.includes(problemTitle)) {
                     console.log(`SUCCESS: Found problem "${problemTitle}"`);
                     
                     const pElements = await page.$x(`//*[contains(text(), '${problemTitle}')]`);
                     if (pElements.length > 0) {
                         console.log('Clicking problem...');
                         await pElements[0].click();
                         
                         await delay(5000);
                         await page.screenshot({ path: path.join(screenshotDir, '04_problem_view.png') });
                         
                         // Check for "Submit" button
                         const content3 = await page.content();
                          if (content3.includes("Run Code") || content3.includes("Submit")) {
                                console.log('SUCCESS: Problem view loaded with actions.');
                          } else {
                                console.log('WARNING: Problem view loaded but actions not found immediately.');
                          }
                     }
                 } else {
                     console.error(`FAILURE: Problem "${problemTitle}" not found on contest page.`);
                 }
             }
        } else {
            console.error(`FAILURE: Contest "${contestTitle}" not found on dashboard.`);
        }

    } catch (error) {
        console.error('Test Failed:', error);
        if (browser) await ((await browser.pages())[0]).screenshot({ path: path.join(screenshotDir, 'error_state.png') });
    } finally {
        if (browser) await browser.close();
        console.log('Test Complete.');
    }
})();
