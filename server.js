// server.js
require('dotenv').config();
const express = require('express');
const ImageKit = require('imagekit');
const cors = require('cors');
const { captureProblem } = require('./bot'); // Your existing bot file

const app = express();
app.use(express.json());
app.use(cors());

// 1. Configure ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// 2. The Upload Route
app.post('/api/add-problem', async (req, res) => {
    const { url } = req.body; // Expecting { "url": "https://codeforces..." }

    if (!url) return res.status(400).json({ error: "URL is required" });

    console.log(`📸 Processing: ${url}...`);

    try {
        // A. Get the screenshot buffer from your bot
        // (Make sure your screenshotController.js returns a Buffer!)
        const imageBuffer = await captureProblem(url);

        console.log("🚀 Uploading to ImageKit...");

        // B. Upload directly to ImageKit
        imagekit.upload({
            file: imageBuffer, // The raw image data
            fileName: `problem-${Date.now()}.png`, // Give it a unique name
            folder: "/codearena_problems" // Optional folder in ImageKit
        }, function (error, result) {
            if (error) {
                console.error("❌ Upload Failed:", error);
                return res.status(500).json({ error: "Upload failed", details: error });
            }

            // C. Success! Return the URL to your frontend
            console.log(`✅ Done! URL: ${result.url}`);
            return res.json({
                success: true,
                imageUrl: result.url,
                thumbnailUrl: result.thumbnailUrl, // ImageKit gives a handy thumbnail too
                originalProblemUrl: url
            });
        });

    } catch (error) {
        console.error("❌ Error in capture:", error.message);
        res.status(500).json({ error: "Failed to process problem", details: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));