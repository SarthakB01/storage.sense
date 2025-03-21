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

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY as string);

export async function POST(req: Request) {
  try {
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
          engine: 'office',
          filename: file.name.replace('.pdf', '.docx')
        },
        'export-my-file': {
          operation: 'export/url',
          input: ['convert-my-file']
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

    // Wait for job completion
    console.log('Waiting for job completion...');
    const jobResult = await cloudConvert.jobs.wait(job.id);
    console.log('Job completed. Status:', jobResult.status);

    // Log all tasks and their statuses
    jobResult.tasks.forEach(task => {
      console.log(`Task ${task.operation} status:`, task.status);
      if (task.result) {
        console.log(`Task ${task.operation} result:`, task.result);
      }
    });

    // Get the export task
    const exportTask = jobResult.tasks.filter(task => task.operation === 'export/url')[0];

    if (!exportTask) {
      throw new Error('Export task not found in job result');
    }

    if (!exportTask.result) {
      throw new Error(`Export task failed with status: ${exportTask.status}`);
    }

    if (!exportTask.result.files || exportTask.result.files.length === 0) {
      throw new Error('No files found in export task result');
    }

    if (!exportTask.result.files[0].url) {
      throw new Error('No URL found in export task result file');
    }

    const fileUrl = exportTask.result.files[0].url;
    console.log('Conversion successful. File URL:', fileUrl);

  } catch (error) {
    console.error('Error in conversion:', error);
    // If error is from CloudConvert API, it might have more details
    if (error instanceof Error && 'response' in error) {
      const apiError = error as CloudConvertError;
      console.error('API Error details:', apiError.response?.data);
    }
    return NextResponse.json({ 
      error: 'Conversion failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}