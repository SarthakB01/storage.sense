/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../mongodb'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../utils/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
   try {
     // Get the server-side session
     const session = await getServerSession(authOptions);
     
     // If no session, return a 401 Unauthorized response
     if (!session || !session.user) {
       return NextResponse.json(
         {
            success: false,
            files: [],
            message: 'Login to view your files in the MyFiles section'
         },
         { status: 401 }
       );
     }
     
     // Connect to MongoDB
     const client = await clientPromise;
     const db = client.db();
     const uploadsCollection = db.collection('uploads.files');
     
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
     let files: any[] = [];
     for (const query of queries) {
       const foundFiles = await uploadsCollection.find(query).toArray();
       
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
     
     return NextResponse.json({
        success: true,
        files: filesData,
        userInfo: {
          email: session.user.email,
          name: session.user.name,
          id: session.user.id
        }
     });
   }
   catch (error) {
     console.error('Error in file retrieval:', error);
     return NextResponse.json(
       {
          success: false,
          files: [],
          message: 'Failed to fetch files',
          details: error instanceof Error ? error.message : 'Unknown error'
       },
       { status: 500 }
     );
   }
}