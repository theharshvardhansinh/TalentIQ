const express = require('express');
const next = require('next');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure unique filenames with correct extensions
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `manual-problem-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage: storage });

app.prepare().then(() => {
    const server = express();

    // Make the uploads folder publicly accessible using Express static middleware
    server.use('/uploads', express.static(uploadsDir));

    // Express route to handle image uploads via multer
    server.post('/api/upload-image', upload.single('image'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: "Image file required" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        return res.json({
            success: true,
            imageUrl: imageUrl,
            thumbnailUrl: imageUrl
        });
    });

    // Default catch-all handler for Next.js app
    server.use((req, res) => {
        return handle(req, res);
    });

    const port = process.env.PORT || 3000;
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
