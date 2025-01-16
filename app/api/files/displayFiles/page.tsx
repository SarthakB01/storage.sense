'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function MyFiles() {
  interface File {
    _id: string;
    filename: string;
    size: number;
    filetype: string; // Add a filetype property to handle fallback
  }

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    async function fetchFiles() {
      const response = await fetch('/api/files'); // Adjust path if necessary
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      } else {
        console.error('Error fetching files:', data.error);
      }
    }

    fetchFiles();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Files</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {files.map((file) => (
          <div
            key={file._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '10px',
              width: '200px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '150px',
                position: 'relative',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f3f3', // Placeholder background
                borderRadius: '8px',
              }}
            >
              {/* Check if thumbnail exists */}
              <Image
                src={`/api/files/thumbnail?filename=${file.filename}`}
                alt={file.filename}
                fill
                onError={(e) => (e.currentTarget.style.display = 'none')} // Hide Image if it fails
                style={{ objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ display: 'none', position: 'absolute' }}>
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#555',
                    textTransform: 'uppercase',
                  }}
                >
                  {file.filetype || file.filename.split('.').pop()}
                </span>
              </div>
            </div>
            <p style={{ fontWeight: 'bold' }}>{file.filename}</p>
            <p>{(file.size / 1024).toFixed(2)} KB</p>
            <a
              href={`/api/files?filename=${file.filename}`} // Download link
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
