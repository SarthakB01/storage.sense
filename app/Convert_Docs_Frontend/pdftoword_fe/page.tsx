'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface PdfToWordComponentProps {
    apiEndpoint?: string;  // Allow custom API endpoint
    acceptedFileTypes?: {
        [key: string]: string[];
    };
}

export const PdfToWordComponent: React.FC<PdfToWordComponentProps> = ({ 
    apiEndpoint = '/api/files/Convert_docs/pdftoword_be',
    acceptedFileTypes = { 'application/pdf': ['.pdf'] }
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => setFile(acceptedFiles[0]),
        accept: acceptedFileTypes,
        multiple: false,
    });

    const handleConvert = async () => {
        if (!file) return;

        setConverting(true);
        setProgress(10);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
            }

            setProgress(70);

            const data = await response.json();
            if (data.convertedFileUrl) {
                setProgress(100);
                setConvertedUrl(data.convertedFileUrl);
            } else {
                throw new Error('No converted file URL in response');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            setError(error instanceof Error ? error.message : 'Failed to convert file. Please try again.');
            setProgress(0);
        } finally {
            setTimeout(() => setConverting(false), 500);
        }
    };

    const resetState = () => {
        setFile(null);
        setConvertedUrl(null);
        setError(null);
    };

    return (
        <div className="min-h-36 rounded-xl bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] dark:from-gray-800 dark:to-gray-900 p-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Convert PDF to Word</h1>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-all 
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'}`}
                >
                    <input {...getInputProps()} />
                    {file ? (
                        <div>
                            <p className="text-gray-700 dark:text-gray-300">Selected file: {file.name}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resetState();
                                }}
                                className="mt-2 text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">Drag and drop a PDF file here, or click to select</p>
                    )}
                </div>

                {error && (
                    <div className="mt-4 text-red-500 text-center">
                        {error}
                    </div>
                )}

                {file && (
                    <button
                        onClick={handleConvert}
                        disabled={converting}
                        className="mt-4 w-full bg-[#0F4C75] hover:bg-[#1B262C] text-white py-2 px-4 rounded-lg disabled:bg-gray-400 transition-all"
                    >
                        {converting ? 'Converting...' : 'Convert to Word'}
                    </button>
                )}

                {/* Progress Bar */}
                {converting && (
                    <motion.div className="mt-4 w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500 dark:bg-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: 'easeOut', duration: 0.5 }}
                        />
                    </motion.div>
                )}

                {convertedUrl && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-gray-800 dark:text-gray-200 mb-2">Conversion completed successfully.</p>
                        <a
                            href={convertedUrl}
                            download
                            className="inline-block bg-[#0F4C75] hover:bg-[#1B262C] text-white font-semibold py-2 px-2 rounded-lg transition-all"
                        >
                            Download {file?.name.replace('.pdf', '.docx')}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfToWordComponent; 