import clientPromise from '../../mongodb';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

// Convert browser's ReadableStream to Node.js Readable stream
function convertReadableStreamToReadable(readableStream: ReadableStream<Uint8Array>): Readable {
  const reader = readableStream.getReader();

  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null); // End the stream
      } else {
        this.push(Buffer.from(value)); // Push data to the stream
      }
    },
  });
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // Check for files
    if (files.length === 0) {
      return new Response('No files uploaded', { status: 400 });
    }

    // Upload each file to GridFS
    for (const file of files) {
      const readableStream = convertReadableStreamToReadable(file.stream());
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: { mimeType: file.type, size: file.size },
      });

      // Pipe the file stream into GridFS
      await new Promise<void>((resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('error', reject)
          .on('finish', resolve);
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    return new Response('Error uploading files', { status: 500 });
  }
}
