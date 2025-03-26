import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest } from 'next/server';
import clientPromise from '../../../mongodb';
import { getServerSession } from 'next-auth/next';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ObjectId } from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Get the server-side session
    const session = await getServerSession(authOptions);

    // If no session, return a 200 OK response with a message about logging in
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
    
    // Check collections
    const collections = await db.collections();
    console.log('Available Collections:', collections.map(c => c.collectionName));

    // Investigate uploads collection
    const uploadsCollection = db.collection('uploads.files');
    
    // Comprehensive collection investigation
    const totalDocuments = await uploadsCollection.countDocuments();
    console.log('Total Documents in uploads.files:', totalDocuments);

    // Fetch a few sample documents to inspect
    const sampleDocs = await uploadsCollection.find().limit(5).toArray();
    console.log('Sample Documents:', JSON.stringify(sampleDocs, null, 2));

    // Flexible query approaches
    const queries = [
      { 'metadata.uploadedBy.email': session.user.email },
      { 'metadata.uploadedBy.name': session.user.name },
      { 'metadata.uploadedBy.id': session.user.id },
      // Additional fallback queries
      { 'uploadedBy.email': session.user.email },
      { 'uploadedBy.name': session.user.name },
      { uploadedBy: session.user.email },
      { uploadedBy: session.user.name }
    ];

    // Try multiple query approaches
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let files: any[] = [];
    for (const query of queries) {
      const foundFiles = await uploadsCollection.find(query).toArray();
      console.log(`Query attempted:`, { 
        query, 
        count: foundFiles.length,
        sampleDoc: foundFiles.length > 0 ? foundFiles[0] : null
      });
      
      if (foundFiles.length > 0) {
        files = foundFiles;
        break;
      }
    }
    // Map files to required format
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
      { 
        headers: { 'Content-Type': 'application/json' } 
      }
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



