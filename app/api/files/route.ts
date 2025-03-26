/* eslint-disable @typescript-eslint/no-unused-vars */
// import clientPromise from '../../mongodb';
// import { GridFSBucket } from 'mongodb';
// import { Readable } from 'stream';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]/route';

// // Convert browser's ReadableStream to Node.js Readable stream
// function convertReadableStreamToReadable(readableStream: ReadableStream<Uint8Array>): Readable {
//   const reader = readableStream.getReader();

//   return new Readable({
//     async read() {
//       const { done, value } = await reader.read();
//       if (done) {
//         this.push(null); // End the stream
//       } else {
//         this.push(Buffer.from(value)); // Push data to the stream
//       }
//     },
//   });
// }

// export async function POST(request: Request) {
//   try {
//     // Get the server-side session
//     const session = await getServerSession(authOptions);

//     // Check if user is authenticated
//     if (!session || !session.user) {
//       return new Response(JSON.stringify({ 
//         success: false, 
//         message: 'Unauthorized: Please log in' 
//       }), { 
//         status: 401, 
//         headers: { 'Content-Type': 'application/json' } 
//       });
//     }

//     const client = await clientPromise;
//     const db = client.db();
//     const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

//     // Parse form data
//     const formData = await request.formData();
//     const files = formData.getAll('files') as File[];

//     // Check for files
//     if (files.length === 0) {
//       return new Response('No files uploaded', { status: 400 });
//     }

//     // Upload each file to GridFS
//     for (const file of files) {
//       const readableStream = convertReadableStreamToReadable(file.stream());
//       const uploadStream = bucket.openUploadStream(file.name, {
//         metadata: { 
//           mimeType: file.type, 
//           size: file.size,
//           uploadedBy: {
//             email: session.user.email,
//             name: session.user.name,
//             id: session.user.id
//           }
//         },
//       });

//       // Pipe the file stream into GridFS
//       await new Promise<void>((resolve, reject) => {
//         readableStream
//           .pipe(uploadStream)
//           .on('error', reject)
//           .on('finish', resolve);
//       });
//     }

//     return new Response(JSON.stringify({ success: true }), {
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error during file upload:', error);
//     return new Response('Error uploading files', { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../utils/auth';
import clientPromise from '../../mongodb';
import { GridFSBucket } from 'mongodb';

// Convert browser's ReadableStream to Node.js Readable stream
function convertReadableStreamToReadable(readableStream: ReadableStream<Uint8Array>): Readable {
  const reader = readableStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the server-side session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Please log in'
        },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file uploaded'
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db);

    // Convert file to readable stream
    const fileBuffer = await file.arrayBuffer();
    const readableStream = new Readable();
    readableStream.push(Buffer.from(fileBuffer));
    readableStream.push(null);

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        uploadedBy: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email
        },
        mimeType: file.type,
        originalName: file.name,
        uploadedAt: new Date()
      }
    });

    return new Promise((resolve) => {
      readableStream
        .pipe(uploadStream)
        .on('error', (error) => {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: 'File upload failed',
                error: error.message
              },
              { status: 500 }
            )
          );
        })
        .on('finish', () => {
          resolve(
            NextResponse.json(
              {
                success: true,
                fileId: uploadStream.id,
                filename: file.name
              },
              { status: 200 }
            )
          );
        });
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}