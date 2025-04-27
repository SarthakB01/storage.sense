import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export default function FileUpload({ onDrop, isUploading, uploadProgress }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
    multiple: true,
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <CloudArrowUpIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive
                ? 'Drop the files here'
                : 'Drag & drop files here, or click to select files'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supports images, PDFs, and Word documents
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
} 