import clientPromise from '../../../mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    // Parse JSON data to get the file ID
    const { fileId } = await request.json();

    // Ensure fileId is provided
    if (!fileId) {
      return new Response('File ID is required', { status: 400 });
    }

    // Convert the fileId string to a MongoDB ObjectId
    const objectId = new ObjectId(fileId);

    // Try to delete the file from GridFS
    const file = await bucket.find({ _id: objectId }).toArray();
    if (file.length === 0) {
      return new Response('File not found', { status: 404 });
    }

    // Delete the file from GridFS
    await bucket.delete(objectId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during file deletion:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
