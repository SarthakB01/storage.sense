import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { ObjectId } from 'mongodb';
import clientPromise from '../../mongodb';

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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'File or User ID is missing' }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, file.name);
    const nodeReadable = streamToNodeReadable(file.stream());

    // Write file to disk
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      nodeReadable.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Save metadata to MongoDB
    const newFile = {
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId: new ObjectId(userId),
    };

    await db.collection('files').insertOne(newFile);
    return NextResponse.json({ message: 'File uploaded and metadata saved successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
