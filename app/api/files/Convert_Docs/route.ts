import { NextResponse } from 'next/server';
import CloudConvert from 'cloudconvert';
import { Readable } from 'stream';
// import { File, Blob } from 'buffer';

interface FormDataFile {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Create job with tasks
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

    // Upload file
    const uploadTask = job.tasks.find(task => task.operation === 'import/upload');
    if (!uploadTask) throw new Error('Upload task not found');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readable = Readable.from(buffer);
    
    await cloudConvert.tasks.upload(uploadTask, readable, file.name);

    // Wait and check job status
    const jobResult = await cloudConvert.jobs.wait(job.id);
    
    // Check if any task failed
    const failedTask = jobResult.tasks.find(task => task.status === 'error');
    if (failedTask) {
      throw new Error(`Task ${failedTask.operation} failed: ${failedTask.message || 'Unknown error'}`);
    }

    // Get export task result
    const exportTask = jobResult.tasks.find(task => task.operation === 'export/url');
    if (!exportTask?.result?.files?.[0]?.url) {
      throw new Error('No converted file URL found');
    }

    const fileUrl = exportTask.result.files[0].url;
    return NextResponse.json({ convertedFileUrl: fileUrl });

  } catch (error) {
    console.error('Error in conversion:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Conversion failed',
      message: errorMessage
    }, { status: 500 });
  }
}