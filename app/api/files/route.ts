import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const clientPromise = new MongoClient(process.env.MONGODB_URI!).connect(); // Ensure URI is loaded from environment

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
    const collection = db.collection('file_metadata'); // Store metadata in this collection
    await collection.insertMany(metadata);

    // Save files locally
    const fileDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir);
    }

    // Save each file to the server
    for (const file of files) {
      const filePath = path.join(fileDir, file.name);
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
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
