import React from 'react';
import Image from 'next/image';
import { DocumentIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  lastModified?: number;
}

interface FileListProps {
  files: File[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  viewMode: 'grid' | 'list';
}

export default function FileList({ files, onRemove, onRetry, viewMode }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string | undefined) => {
    if (!type) return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    
    if (type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    } else if (type.includes('word')) {
      return <DocumentIcon className="h-8 w-8 text-blue-600" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp).toLocaleDateString();
  };

  const renderFileThumbnail = (file: File) => {
    if (!file.type) return getFileIcon(undefined);
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative w-24 h-24 mb-3">
          <Image
            src={URL.createObjectURL(file)}
            alt={file.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      );
    }
    return <div className="mb-3">{getFileIcon(file.type)}</div>;
  };

  const renderFileListThumbnail = (file: File) => {
    if (!file.type) {
      return (
        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {getFileIcon(undefined)}
        </div>
      );
    }
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={URL.createObjectURL(file)}
            alt={file.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        {getFileIcon(file.type)}
      </div>
    );
  };

  if (viewMode === 'grid') {
    return (
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              {renderFileThumbnail(file)}
              <div className="w-full">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(file.lastModified)}
                </p>
              </div>
            </div>

            {file.status === 'uploading' && (
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-1 bg-violet-600 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {file.status === 'success' && (
              <div className="absolute top-2 right-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
            )}

            {file.status === 'error' && (
              <div className="absolute top-2 right-2">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <button
                  onClick={() => onRetry(file.id)}
                  className="mt-1 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  Retry
                </button>
              </div>
            )}

            <button
              onClick={() => onRemove(file.id)}
              className="absolute top-2 left-2 p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4">
            {renderFileListThumbnail(file)}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                {file.name}
              </p>
              <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.lastModified)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {file.status === 'uploading' && (
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-violet-600 rounded-full transition-all duration-300"
                  style={{ width: `${file.progress}%` }}
                ></div>
              </div>
            )}

            {file.status === 'success' && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}

            {file.status === 'error' && (
              <div className="flex items-center space-x-2">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <button
                  onClick={() => onRetry(file.id)}
                  className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  Retry
                </button>
              </div>
            )}

            <button
              onClick={() => onRemove(file.id)}
              className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 