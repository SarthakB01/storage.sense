'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { ButtonProgress } from "../components/ButtonProgress";


export default function ConvertDocs() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/Convert_docs/pdftoword', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.convertedFileUrl) {
        setConvertedUrl(data.convertedFileUrl);
      }
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] dark:from-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Convert PDF to Word</h1>
        
        <div {...getRootProps()} className={`border-2 border-dashed p-8 rounded-lg text-center 
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'}`}>
          <input {...getInputProps()} />
          {file ? (
            <div>
              <p className="text-gray-700 dark:text-gray-300">Selected file: {file.name}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop a PDF file here, or click to select
            </p>
          )}
        </div>

        {file && (
          <>
          <ButtonProgress onClick={handleConvert} disabled={converting} />
          </>
        )}

        {convertedUrl && (
          <div className="mt-4 p-4 bg-green-50  dark:bg-gray-900 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 mb-2">Conversion complete!</p>
            <a
              href={convertedUrl}
              download
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Download {file?.name || 'converted file'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
