import { NextResponse } from 'next/server';
import CloudConvert from 'cloudconvert';
import { Readable } from 'stream';
// import { File, Blob } from 'buffer';

interface FormDataFile {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

interface CloudConvertError extends Error {
  response?: {
    data: unknown;
  };
}

// Validate API key before initializing CloudConvert
const apiKey = process.env.CLOUDCONVERT_API_KEY;
if (!apiKey) {
  throw new Error('CLOUDCONVERT_API_KEY is not set in environment variables');
}

const cloudConvert = new CloudConvert(apiKey);

export async function POST(req: Request) {
  try {
    // First verify the API key is working
    try {
      await cloudConvert.users.me();
    } catch (error) {
      console.error('CloudConvert authentication failed:', error);
      return NextResponse.json({ 
        error: 'API authentication failed', 
        details: 'Please check your CloudConvert API key'
      }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get('file') as unknown as FormDataFile;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Creating job for file:', file.name);

    // Create a job with all tasks
    const job = await cloudConvert.jobs.create({
      tasks: {
        'import-my-file': {
          operation: 'import/upload'
        },
        'convert-my-file': {
          operation: 'convert',
          input: ['import-my-file'],
          output_format: 'docx',
          engine: 'libreoffice',  // Changed from 'office' to 'libreoffice'
          input_format: 'pdf',
          filename: file.name.replace('.pdf', '.docx')
        },
        'export-my-file': {
          operation: 'export/url',
          input: ['convert-my-file'],
          inline: false,
          archive_multiple_files: false
        }
      }
    });

    console.log('Job created:', job.id);

    // Get the upload task
    const uploadTask = job.tasks.filter(task => task.operation === 'import/upload')[0];
    console.log('Upload task created:', uploadTask.id);

    // Convert the file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readable = Readable.from(buffer);

    // Upload the file
    console.log('Starting file upload...');
    await cloudConvert.tasks.upload(uploadTask, readable, file.name);
    console.log('File uploaded successfully');

    // Wait for job completion with better error handling
    console.log('Waiting for job completion...');
    const jobResult = await cloudConvert.jobs.wait(job.id);
    console.log('Job completed. Status:', jobResult.status);

    // Check if any task has failed
    const failedTask = jobResult.tasks.find(task => task.status === 'error');
    if (failedTask) {
      console.error('Task failed:', failedTask);
      throw new Error(`Task ${failedTask.name} failed: ${failedTask.message || 'Unknown error'}`);
    }

    // Get the export task with better error handling
    const exportTask = jobResult.tasks.find(task => task.operation === 'export/url');
    if (!exportTask) {
      throw new Error('Export task not found in job result');
    }

    if (exportTask.status === 'error') {
      console.error('Export task error:', exportTask);
      throw new Error(`Export task failed: ${exportTask.message || 'Unknown error'}`);
    }

    if (!exportTask.result) {
      console.error('Export task has no result:', exportTask);
      throw new Error('Export task completed but no result available');
    }

    if (!exportTask.result.files || exportTask.result.files.length === 0) {
      throw new Error('No files found in export task result');
    }

    if (!exportTask.result.files[0].url) {
      throw new Error('No URL found in export task result file');
    }

    const fileUrl = exportTask.result.files[0].url;
    console.log('Conversion successful. File URL:', fileUrl);

    return NextResponse.json({ 
      success: true,
      convertedFileUrl: fileUrl 
    });

  } catch (error) {
    console.error('Error in conversion:', error);
    // If error is from CloudConvert API, it might have more details
    if (error instanceof Error && 'response' in error) {
      const apiError = error as CloudConvertError;
      console.error('Full API Error:', JSON.stringify(apiError.response?.data, null, 2));
      
      // Handle authentication errors specifically
      if (apiError.response?.data && typeof apiError.response.data === 'object' && 'code' in apiError.response.data) {
        if (apiError.response.data.code === 'UNAUTHENTICATED') {
          return NextResponse.json({ 
            error: 'Authentication failed',
            details: 'Invalid or expired API key'
          }, { status: 401 });
        }
      }
    }
    return NextResponse.json({ 
      error: 'Conversion failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}