// Import necessary modules
import clientPromise from '../../../mongodb'; // MongoDB connection utility
import { GridFSBucket } from 'mongodb'; // GridFS for storing files

// Handle POST request (file upload)
export async function POST(request: Request) {
  try {
    // Parse the incoming form data to retrieve files
    const formData = await request.formData();
    const files = formData.getAll('files') as File[]; // Get all files from the form data

    // Check if any files were uploaded
    if (files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No files were uploaded' }), // Error response
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare file metadata for saving to MongoDB
    const metadata = files.map((file) => ({
      filename: file.name, // Original name of the file
      size: file.size, // File size in bytes
      type: file.type, // MIME type (e.g., image/jpeg, application/pdf)
      uploadedAt: new Date(), // Timestamp of upload
    }));

    // Connect to MongoDB and initialize GridFS bucket
    const client = await clientPromise; // Get MongoDB client
    const db = client.db(); // Get default database
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' }); // GridFS bucket for file storage
    const collection = db.collection('uploads.files'); // Collection to store file metadata

    // Save metadata to MongoDB
    await collection.insertMany(metadata);

    // Save files to GridFS
    for (const file of files) {
      // Open an upload stream for each file
      const uploadStream = bucket.openUploadStream(file.name, {
        contentType: file.type  // Store content type directly
      });

      // Convert the file to an ArrayBuffer, then to a Buffer for uploading
      const buffer = await file.arrayBuffer();
      uploadStream.end(Buffer.from(buffer)); // Upload the file content to GridFS
    }

    // Respond with a success message
    return new Response(
      JSON.stringify({ success: true, message: 'Files uploaded successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Handle errors and respond with an appropriate error message
    console.error('Error during file upload:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle GET request (file retrieval and metadata fetching)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    // Get all files from GridFS
    const files = await bucket.find({}).toArray();

    // Map the files to include necessary fields including metadata
    const filesData = files.map(file => ({
      _id: file._id.toString(),
      filename: file.filename,
      length: file.length,
      mimetype: file.contentType || 'Unknown'  // Get content type directly
    }));

    return new Response(JSON.stringify({ success: true, files: filesData }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


