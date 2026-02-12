export const dynamic = 'force-dynamic';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Helper function to fetch Codeforces unique problem metadata via API
async function fetchCodeforcesMetadata(contestId, index) {
    try {
        const url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1&showUnofficial=false`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();

        if (data.status !== 'OK') return null;

        // The problems list is usually in data.result.problems
        const problem = data.result.problems.find(p => p.index === index.toUpperCase());
        return problem ? { title: problem.name, tags: problem.tags } : null;
    } catch (e) {
        console.error("Error fetching Codeforces API:", e);
        return null;
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { platform, prompt, imageUrl } = body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined");
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("Using Gemini model: gemini-flash-latest");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let finalProblemData = null;

        if (platform === 'codeforces') {
            const { contestId, index } = body;
            if (!contestId || !index) return NextResponse.json({ error: "Contest ID and Index required" }, { status: 400 });

            // 1. Fetch Metadata from Official Codeforces API
            const metadata = await fetchCodeforcesMetadata(contestId, index);
            if (!metadata) {
                return NextResponse.json({ error: "Problem not found in Codeforces API. Please check Contest ID and Index." }, { status: 404 });
            }

            // 2. Use Gemini to RECALL/GENERATE problem content based on verified metadata
            console.log(`Generating content for verified Codeforces problem: ${metadata.title}`);

            const problemPrompt = `
                I need the full details for the Codeforces problem: "${metadata.title}" (Contest ${contestId}, Problem ${index}).
                
                Please RECALL/RETRIEVE the problem statement from your training data if you know it.
                If you don't know this specific problem perfectly, generate a HIGH-QUALITY competitive programming problem that MATCHES this title and tags (${metadata.tags.join(', ')}).
                
                Format the response as a JSON object with:
                {
                    "title": "${metadata.title}",
                    "description": "Clear and detailed problem statement...",
                    "difficulty": "Medium",
                    "constraints": "Time limit, memory limit, input constraints...",
                    "inputFormat": "Detailed input format...",
                    "outputFormat": "Detailed output format...",
                    "tags": ${JSON.stringify(metadata.tags)},
                    "testCases": [
                        { "input": "...", "output": "...", "isPublic": true },
                        { "input": "...", "output": "...", "isPublic": true },
                        { "input": "...", "output": "...", "isPublic": false },
                        { "input": "...", "output": "...", "isPublic": false }
                    ],
                    "starterCode": {
                        "cpp": "// C++ starter...",
                        "java": "// Java starter...",
                        "python": "# Python starter...",
                        "javascript": "// JS starter..."
                    }
                }
                
                Ensure there are exactly 2 public and 3 hidden test cases.
                For "starterCode":
                1. Class-based structure (e.g., class Solution) where applicable.
                2. Empty method body (do NOT solve).
                3. Include main/driver code to parse input and print output.
                
                Return ONLY the JSON.
            `;

            const result = await model.generateContent(problemPrompt);
            const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            try {
                finalProblemData = JSON.parse(text);
                finalProblemData.title = metadata.title;
            } catch (e) {
                console.error("Gemini parse error:", e);
                // Fallback approach if JSON fails? Or just return error.
                // Let's retry simple extraction if JSON.parse fails
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    finalProblemData = JSON.parse(jsonMatch[0]);
                    finalProblemData.title = metadata.title;
                } else {
                    return NextResponse.json({ error: "Failed to generate problem content" }, { status: 500 });
                }
            }

        } else if (imageUrl) {
            // Image-Based Generation (from Screenshot)
            console.log("Generating problem from image URL:", imageUrl);

            const imageResp = await fetch(imageUrl);
            if (!imageResp.ok) throw new Error("Failed to fetch image from URL");

            const arrayBuffer = await imageResp.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString("base64");

            const prompt = `
                Analyze this image of a competitive programming problem.
                Extract the problem details and generate a JSON object with the following structure:
                {
                    "title": "Problem Title (extract from image)",
                    "description": "Create a short summary of the problem logic. Do not write the full story if it's long, just the core task.",
                    "difficulty": "Medium",
                    "constraints": "Extract constraints (e.g. N <= 10^5)",
                    "inputFormat": "Extract input format",
                    "outputFormat": "Extract output format",
                    "tags": ["Array", "Math", " Greedy"],
                    "testCases": [
                        { "input": "...", "output": "...", "isPublic": true },
                        { "input": "...", "output": "...", "isPublic": true },
                        { "input": "...", "output": "...", "isPublic": false },
                        { "input": "...", "output": "...", "isPublic": false },
                         { "input": "...", "output": "...", "isPublic": false }
                    ],
                    "starterCode": {
                        "cpp": "// C++ starter...",
                        "java": "// Java starter...",
                        "python": "# Python starter...",
                        "javascript": "// JS starter..."
                    }
                }
                
                Ensure there are exactly 2 public and 3 hidden test cases.
                For "starterCode", create a class-based solution with an empty method body.
                
                Return ONLY the JSON.
            `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: "image/png" // Assuming PNG from ImageKit, but could check
                    }
                }
            ]);

            const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

            // Try parsing JSON
            try {
                finalProblemData = JSON.parse(text);
                // Force description to be the image markdown if desired, 
                // but user asked for Gemini to give test cases primarily. 
                // The frontend handles the description image rendering.
            } catch (e) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    finalProblemData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error("Failed to parse AI response as JSON");
                }
            }

        } else {
            // Original Logic for Custom/LeetCode (Full AI Generation)
            let userPrompt = "";
            if (platform === 'leetcode') {
                if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });
                userPrompt = `LeetCode Problem: ${prompt}. Retrieve/Recall the actual problem details if known.`;
            } else {
                if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });
                userPrompt = `Topic/Title: ${prompt}`;
            }

            const instruction = `
                Generate a competitive programming problem based on this request: "${userPrompt}".
                
                If it refers to a specific real-world problem (LeetCode), try to providing the ACTUAL details (Description, Constraints, Input/Output) as accurately as possible.
                If it's a generic topic, generate a high-quality original problem.

                Provide the following in JSON format:
                {
                    "title": "Problem Title",
                    "description": "Clear and detailed problem statement",
                    "difficulty": "Easy/Medium/Hard",
                    "constraints": "Constraints for the problem",
                    "inputFormat": "Format of input",
                    "outputFormat": "Format of output",
                    "tags": ["tag1", "tag2"],
                    "testCases": [
                        { "input": "input1", "output": "output1", "isPublic": true },
                        { "input": "input2", "output": "output2", "isPublic": true },
                        { "input": "hidden1", "output": "hidden_output1", "isPublic": false },
                        { "input": "hidden2", "output": "hidden_output2", "isPublic": false },
                        { "input": "hidden3", "output": "hidden_output3", "isPublic": false }
                    ],
                    "starterCode": {
                        "cpp": "// Generated C++ starter code with main function and Solution class",
                        "java": "// Generated Java starter code with main class and Solution class",
                        "python": "# Generated Python starter code with Solution class and driver code",
                        "javascript": "// Generated JavaScript starter code with Solution class and driver code"
                    }
                }
                Ensure there are exactly 2 public and 3 hidden test cases as requested.
                
                For "starterCode":
                1. Provide a Class-based structure (e.g., class Solution).
                2. Define the correct method signature based on the problem (e.g., int solve(int n)).
                3. CRITICAL: DO NOT IMPLEMENT THE SOLUTION LOGIC. The method body MUST be empty or return a default/dummy value (e.g. return 0; or return "";).
                4. Include a main method/driver code that reads Input according to inputFormat, calls the Solution method, and prints the Output.
                
                Return ONLY the JSON. No markdown, no extra text.
            `;

            const result = await model.generateContent(instruction);
            const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

            // Try parsing JSON
            try {
                finalProblemData = JSON.parse(text);
            } catch (e) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    finalProblemData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error("Failed to parse AI response as JSON");
                }
            }
        }

        return NextResponse.json({ success: true, problem: finalProblemData });

    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json({ error: "Failed to generate problem: " + error.message }, { status: 500 });
    }
}
