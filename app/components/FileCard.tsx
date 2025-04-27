import React from 'react';

interface FileCardProps {
  file: {
    name: string;
    size: number;
    type: string;
  };
}

export default function FileCard({ file }: FileCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{file.name}</h3>
      <p>Size: {file.size} bytes</p>
      <p>Type: {file.type}</p>
    </div>
  );
} 