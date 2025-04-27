import React from 'react';

interface AnalyticsProps {
  data: {
    storageUsed: number;
    totalStorage: number;
    filesUploaded: number;
  };
}

export default function Analytics({ data }: AnalyticsProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3>Storage Usage</h3>
      <p>{data.storageUsed} / {data.totalStorage} GB used</p>
      <p>{data.filesUploaded} files uploaded</p>
    </div>
  );
} 