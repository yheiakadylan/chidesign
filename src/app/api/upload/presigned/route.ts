import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    // KEY FIX: Disable automatic checksum calculation so that
    // x-amz-checksum-crc32 and x-amz-sdk-checksum-algorithm
    // are NOT added to the Presigned URL's SignedHeaders.
    // Without this, browser PUT requests need to include those headers
    // which S3 then rejects on CORS preflight (no Access-Control-Allow-Origin).
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { filename, contentType, taskId } = body;

        if (!filename || !contentType || !taskId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const uniqueKey = `tasks/${taskId}/${uuidv4()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME as string,
            Key: uniqueKey,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 120,
        });

        // Build the public URL — prefer CloudFront CDN if configured
        const cdnDomain = process.env.CLOUDFRONT_DOMAIN;
        const fileUrl = cdnDomain
            ? `${cdnDomain.replace(/\/$/, '')}/${uniqueKey}`
            : `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

        return NextResponse.json({
            uploadUrl: presignedUrl,
            fileKey: uniqueKey,
            fileUrl: fileUrl
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
