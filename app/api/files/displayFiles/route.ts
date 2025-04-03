/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from 'next-auth/next';
import GithubProvider from "next-auth/providers/github";
import { NextRequest } from 'next/server';
import clientPromise from '../../../mongodb';

export async function GET(request: NextRequest) {
  try {
    // Dynamically get session without direct import
    const session = await getServerSession({
      providers: [
        GithubProvider({
          clientId: process.env.GITHUB_CLIENT_ID as string,
          clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }),
      ],
      debug: true,
    });

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          files: [],
          session: false,
          message: 'Login to view your files in the MyFiles section' 
        }), 
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const uploadsCollection = db.collection('uploads.files');

    // Possible query approaches to find user files
    const queries = [
      { 'metadata.uploadedBy.email': session.user.email },
      { 'metadata.uploadedBy.name': session.user.name },
      { 'metadata.uploadedBy.id': session.user.id },
      { 'uploadedBy.email': session.user.email },
      { 'uploadedBy.name': session.user.name },
      { uploadedBy: session.user.email },
      { uploadedBy: session.user.name }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let files: any[] = []; // Explicitly define type as an array of any objects
    for (const query of queries) {
      const foundFiles = await uploadsCollection.find(query).toArray();
      if (foundFiles.length > 0) {
        files = foundFiles;
        break; // Stop if files are found
      }
    }

    const filesData = files.map(file => ({
      _id: file._id.toString(),
      filename: file.filename,
      length: file.length,
      mimetype: file.metadata?.mimeType || file.contentType || 'Unknown',
      uploadedBy: file.metadata?.uploadedBy
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        files: filesData,
        session: true,
        userInfo: {
          email: session.user.email,
          name: session.user.name,
          id: session.user.id
        }
      }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  catch (error) {
    console.error('Error in file retrieval:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        files: [],
        session: false,
        message: 'Failed to fetch files', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
