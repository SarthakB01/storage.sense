import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { v4 as uuidv4 } from 'uuid';
import { ViewColumnsIcon, ListBulletIcon } from '@heroicons/react/24/outline';

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

export default function FileManager() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleDrop = useCallback(async (acceptedFiles: globalThis.File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream', // Provide default type if undefined
      status: 'uploading' as const,
      progress: 0,
      lastModified: file.lastModified
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload with proper progress tracking
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const totalSteps = 10;
      
      for (let step = 1; step <= totalSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const progress = Math.min(100, (step / totalSteps) * 100);
        
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { ...f, progress }
              : f
          )
        );
        setUploadProgress(progress);
      }

      // Always mark as success for now (remove random failure)
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === file.id
            ? {
                ...f,
                status: 'success',
                progress: 100
              }
            : f
        )
      );
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  }, []);

  const handleRetry = useCallback((id: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === id
          ? { ...file, status: 'uploading', progress: 0, error: undefined }
          : file
      )
    );

    // Simulate retry upload
    const retryFile = files.find(f => f.id === id);
    if (retryFile) {
      const simulateUpload = async () => {
        const totalSteps = 10;
        for (let step = 1; step <= totalSteps; step++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          const progress = Math.min(100, (step / totalSteps) * 100);
          
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === id
                ? { ...f, progress }
                : f
            )
          );
        }

        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === id
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        );
      };

      simulateUpload();
    }
  }, [files]);

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const sortFiles = (files: File[]): File[] => {
    return [...files].sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'size') {
        return sortDirection === 'asc'
          ? a.size - b.size
          : b.size - a.size;
      } else {
        // Sort by date
        const dateA = a.lastModified || 0;
        const dateB = b.lastModified || 0;
        return sortDirection === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              File Manager
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and manage your files with ease
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ViewColumnsIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={toggleSortDirection}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <FileUpload
        onDrop={handleDrop}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      <FileList
        files={sortFiles(files)}
        onRemove={handleRemove}
        onRetry={handleRetry}
        viewMode={viewMode}
      />
    </div>
  );
} 