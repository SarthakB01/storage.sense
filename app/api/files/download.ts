import clientPromise from '../../mongodb';
import { GridFSBucket } from 'mongodb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return new Response('Filename is required', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const downloadStream = bucket.openDownloadStreamByName(filename);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
