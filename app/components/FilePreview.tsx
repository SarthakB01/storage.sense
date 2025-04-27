import React from 'react';
import Image from 'next/image';

interface FilePreviewProps {
  file: {
    name: string;
    type: string;
    url?: string;
  };
}

export default function FilePreview({ file }: FilePreviewProps) {
  return (
    <div className="p-4 border rounded-lg">
      {file.type.startsWith('image/') && file.url ? (
        <Image src={file.url} alt={file.name} width={200} height={200} />
      ) : (
        <p>Preview not available for {file.type}</p>
      )}
    </div>
  );
} 