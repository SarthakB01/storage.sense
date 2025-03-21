import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    // Handle the file upload directly in the request body
    const data = await req.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Save the uploaded file to your desired directory
    const uploadDir = path.join(process.cwd(), 'public/uploads'); // Save to 'public/uploads' folder
    const filePath = path.join(uploadDir, file.name);

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write the file to the server
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return NextResponse.json({ pdfFilePath: filePath });
  } catch (error) {
    console.error('Error in file upload:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
