import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: "Image base64 data required" }, { status: 400 });
        }

        // Upload to ImageKit
        const uploadResponse = await new Promise((resolve, reject) => {
            imagekit.upload({
                file: imageBase64,
                fileName: `manual-problem-${Date.now()}.png`,
                folder: "/codearena_problems"
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        return NextResponse.json({
            success: true,
            imageUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl,
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload image", details: error.message }, { status: 500 });
    }
}
