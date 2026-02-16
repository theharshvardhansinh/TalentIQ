
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

async function scrapeCodeChef(url) {
    let browser = null;
    try {
        const IS_PRODUCTION = process.env.NODE_ENV === 'production';
        const browserPath = IS_PRODUCTION
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

        browser = await puppeteer.launch({
            executablePath: browserPath,
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        console.log(`Navigating to ${url}...`);
        // Use domcontentloaded to avoid waiting for analytics/ads that cause timeouts
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait for the problem statement container with a generous timeout
        try {
            await page.waitForSelector('#problem-statement', { timeout: 45000 });
        } catch (e) {
            console.warn("Wait for #problem-statement timed out, trying to proceed with available content");
        }

        // Extract data directly from the DOM using page.evaluate
        const extractedData = await page.evaluate(() => {
            const cleanText = (text) => text?.replace(/\s+/g, ' ').trim() || '';

            const statementContainer = document.querySelector('#problem-statement');
            if (!statementContainer) return null;

            // Remove MathJax and scripts to clean up
            const removeElements = (selector) => statementContainer.querySelectorAll(selector).forEach(el => el.remove());
            removeElements('.MathJax');
            removeElements('script');

            // 1. Title
            let title = cleanText(document.querySelector('h1')?.innerText);
            if (!title) {
                // Fallback for some CodeChef layouts
                const titleEl = document.querySelector('span[class^="ProblemTitle_title__"]');
                if (titleEl) title = cleanText(titleEl.innerText);
            }

            // 2. Sample Test Cases
            const testCases = [];

            // Strategy: Look for "Input" and "Output" headers or pre tags
            const preTags = Array.from(statementContainer.querySelectorAll('pre'));

            // Heuristic A: alternating pre tags
            if (preTags.length > 0 && preTags.length % 2 === 0) {
                for (let i = 0; i < preTags.length; i += 2) {
                    testCases.push({
                        input: preTags[i].innerText.replace(/Input:?/i, '').trim(),
                        output: preTags[i + 1].innerText.replace(/Output:?/i, '').trim(),
                        isPublic: true
                    });
                }
            }
            // Heuristic B: Single pre tag with "Input" and "Output"
            else if (preTags.length > 0) {
                preTags.forEach(pre => {
                    const text = pre.innerText;
                    if (text.toLowerCase().includes('input') && text.toLowerCase().includes('output')) {
                        const parts = text.split(/Output:?/i);
                        if (parts.length > 1) {
                            testCases.push({
                                input: parts[0].replace(/Input:?/i, '').trim(),
                                output: parts[1].trim(),
                                isPublic: true
                            });
                        }
                    }
                });
            }

            // 3. Sections (Description, Constraints, Input Format, Output Format)
            // We'll iterate through children to build these up.
            // This is simplified; specialized parsing is brittle.

            let description = "";
            let constraints = "";
            let inputFormat = "";
            let outputFormat = "";

            // Helper to clean and format text
            const getTextContent = (node) => node.innerText.trim();

            const sections = {
                desc: [],
                input: [],
                output: [],
                constraints: []
            };

            let currentSection = 'desc';

            // Iterate through direct children of problem statement
            const children = Array.from(statementContainer.children);

            for (const child of children) {
                const text = child.innerText.trim();
                const lowerText = text.toLowerCase();

                // Detect headers
                if (['H2', 'H3', 'H4'].includes(child.tagName) || (child.tagName === 'P' && child.querySelector('strong') && text.length < 50)) {
                    if (lowerText.includes('input format') || lowerText.includes('input')) currentSection = 'input';
                    else if (lowerText.includes('output format') || lowerText.includes('output')) currentSection = 'output';
                    else if (lowerText.includes('constraints')) currentSection = 'constraints';
                    else if (lowerText.includes('sample') || lowerText.includes('example')) currentSection = 'ignore'; // Handled by testCases extraction
                    continue;
                }

                if (currentSection === 'ignore') continue;
                if (!text) continue;

                if (currentSection === 'desc') sections.desc.push(text);
                else if (currentSection === 'input') sections.input.push(text);
                else if (currentSection === 'output') sections.output.push(text);
                else if (currentSection === 'constraints') sections.constraints.push(text);
            }

            description = sections.desc.join('\n\n');
            inputFormat = sections.input.join('\n\n');
            outputFormat = sections.output.join('\n\n');
            constraints = sections.constraints.join('\n\n');

            // Collect all text for AI analysis fallback
            const rawText = statementContainer.innerText;

            return {
                title,
                description,
                constraints,
                inputFormat,
                outputFormat,
                testCases,
                rawText
            };
        });

        if (!extractedData) {
            throw new Error("Failed to extract data from problem statement. The layout might be different.");
        }

        return {
            ...extractedData,
            originalUrl: url,
            platform: 'CodeChef'
        };

    } catch (error) {
        console.error("CodeChef Scrape Error:", error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

export async function POST(req) {
    try {
        const { url, platform, useAI } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        let data = {};
        if (platform === 'codechef' || url.includes('codechef.com')) {
            data = await scrapeCodeChef(url);

            // If AI enhancement is requested or if critical data is missing (like test cases), use Gemini
            if (useAI || !data.testCases || data.testCases.length === 0) {
                try {
                    // Import dynamically to avoid top-level await issues if not needed
                    const { GoogleGenerativeAI } = await import("@google/generative-ai");
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                    const prompt = `
                    You are an expert competitive programming assistant.
                    I have scraped a problem from CodeChef but might have missed some details.
                    
                    Here is the raw text content of the problem statement:
                    """
                    ${data.rawText}
                    """

                    Please analyze this text and extract the following in valid JSON format:
                    - "testCases": An array of objects with "input" and "output" strings. Ensure you capture ALL sample test cases found.
                    - "constraints": The constraints string if available.
                    - "inputFormat": The input format description.
                    - "outputFormat": The output format description.
                    - "tags": An array of probable tags (e.g., "DP", "Greedy", "Math").
                    - "difficulty": Estimate difficulty (Easy, Medium, Hard).

                    JSON Output:
                    `;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    // Simple JSON extraction
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const aiData = JSON.parse(jsonMatch[0]);

                        // Merge AI data with scraped data (preferring AI for missing/empty fields)
                        if ((!data.testCases || data.testCases.length === 0) && aiData.testCases) {
                            data.testCases = aiData.testCases.map(tc => ({ ...tc, isPublic: true }));
                        }
                        if (!data.constraints && aiData.constraints) data.constraints = aiData.constraints;
                        if (!data.inputFormat && aiData.inputFormat) data.inputFormat = aiData.inputFormat;
                        if (!data.outputFormat && aiData.outputFormat) data.outputFormat = aiData.outputFormat;
                        if (aiData.tags) data.tags = aiData.tags; // scrape doesn't get tags usually
                        if (aiData.difficulty) data.difficulty = aiData.difficulty;
                    }

                } catch (aiError) {
                    console.warn("AI Enhancement failed:", aiError);
                    // Continue with scraped data
                }
            }

        } else {
            return NextResponse.json({ error: "Platform not supported for scraping" }, { status: 400 });
        }

        // Clean up rawText before sending
        delete data.rawText;

        return NextResponse.json({ success: true, problem: data });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
