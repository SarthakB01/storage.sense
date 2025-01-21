import clientPromise from '../../../mongodb';
import { GridFSBucket } from 'mongodb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');

    // Validate filename
    if (!filename) {
      return new Response('Filename is required', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    // Open a download stream for the file
    const downloadStream = bucket.openDownloadStreamByName(filename);

    if (!downloadStream) {
      return new Response('File not found', { status: 404 });
    }

    // Set content type based on file extension
    const ext = filename.split('.').pop();
    const mimeType = ext === 'pdf' ? 'application/pdf' : 'application/octet-stream'; // Example for PDF, add others as needed

    return new Response(downloadStream as unknown as ReadableStream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error during file retrieval:', error);
    return new Response('Error retrieving file', { status: 500 });
  }
}
