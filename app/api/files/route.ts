/* eslint-disable @typescript-eslint/no-explicit-any */
import clientPromise from '../../mongodb';
import { GridFSBucket } from 'mongodb';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No files were uploaded' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare file metadata for saving to MongoDB
    const metadata = files.map((file) => ({
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    }));

    // Save metadata to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    const collection = db.collection('file_metadata');
    await collection.insertMany(metadata);

    // Save files to GridFS
    for (const file of files) {
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: { type: file.type, uploadedAt: new Date() },
      });
      const buffer = await file.arrayBuffer();
      uploadStream.end(Buffer.from(buffer));
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Files uploaded successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename'); // Example: /api/files?filename=myfile.txt

    if (!filename) {
      return new Response('Filename is required', { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    // Open a download stream for the file
    const downloadStream = bucket.openDownloadStreamByName(filename);

    return new Response(downloadStream as any, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error during file retrieval:', error);
    return new Response('Error retrieving file', { status: 500 });
  }
}
