import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { ObjectId } from 'mongodb';
import clientPromise from '../../mongodb';
import { GridFSBucket } from 'mongodb';
// import { File } from 'formidable';

// Convert ReadableStream to Node.js Readable
const streamToNodeReadable = (stream: ReadableStream<Uint8Array>): Readable => {
  const reader = stream.getReader();
  return new Readable({
    read() {
      reader.read()
        .then(({ done, value }) => {
          if (done) this.push(null);
          else this.push(value);
        })
        .catch((err) => this.destroy(err));
    },
  });
};

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Initialize GridFSBucket
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'File or User ID is missing' }, { status: 400 });
    }

    // Validate user ID
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    // Convert file stream and save to GridFS
    const nodeReadable = streamToNodeReadable(file.stream());
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        contentType: file.type,
        userId: new ObjectId(userId),
        size: file.size,
      },
    });

    await new Promise<void>((resolve, reject) => {
      nodeReadable.pipe(uploadStream);
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    return NextResponse.json({ message: 'File uploaded successfully to database' }, { status: 201 });
  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
