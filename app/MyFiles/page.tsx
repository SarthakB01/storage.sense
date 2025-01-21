'use client';
import { useEffect, useState } from 'react';

export default function MyFiles() {
  interface File {
    _id: string;
    filename: string;
    size: number;
    filetype: string;
  }

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const response = await fetch('/api/files/displayFiles'); // Adjusted path
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          return;
        }
        const data = await response.json();
        if (data.success) {
          setFiles(data.files);
        } else {
          console.error('Error fetching files:', data.error);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    }

    fetchFiles();
  }, []);

  const getFileIcon = (file: File) => {
    const fileExtension = file.filename.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension || '')) {
      return (
        <div className="w-24 h-24 flex items-center justify-center bg-gray-300 rounded-lg text-gray-700 font-bold text-xl">
          IMG
        </div>
      );
    } else if (fileExtension === 'pdf') {
      return (
        <div className="w-24 h-24 flex items-center justify-center bg-red-500 rounded-lg text-white font-bold text-xl">
          PDF
        </div>
      );
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      return (
        <div className="w-24 h-24 flex items-center justify-center bg-blue-500 rounded-lg text-white font-bold text-xl">
          WORD
        </div>
      );
    } else {
      return (
        <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 font-bold text-xl">
          FILE
        </div>
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Files</h1>
      <div className="flex flex-wrap gap-6">
        {files.map((file) => (
          <div
            key={file._id}
            className="border border-gray-300 rounded-lg p-4 w-52 text-center"
          >
            <div className="w-full h-36 mb-4 flex items-center justify-center bg-gray-100 rounded-lg">
              {getFileIcon(file)}
            </div>
            <p
              className="font-bold text-sm truncate"
              title={file.filename} // Show full name on hover
            >
              {file.filename}
            </p>
            <p className="text-xs">{(file.size / 1024).toFixed(2)} KB</p>
            <a
              href={`/api/files/ServeDownloads?filename=${file.filename}`} // Download link
              className="text-blue-600 underline text-xs"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
