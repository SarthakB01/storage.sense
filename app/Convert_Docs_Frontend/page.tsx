"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { ButtonProgress } from "../components/ButtonProgress";

export default function ConvertDocs() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>("converted.docx");
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError(null);
    },
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/Convert_docs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success response:', data);

      if (data.success && data.convertedFileUrl) {
        setConvertedUrl(data.convertedFileUrl);
        setConvertedFileName(file.name.replace(".docx", ".pdf"));
        setFile(null);
      } else {
        throw new Error("Conversion failed: No URL received");
      }
    } catch (error) {
      console.error("Conversion error details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to convert file. Please try again."
      );
      setConvertedUrl(null);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] dark:from-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Convert Word to PDF
        </h1>

        {!convertedUrl && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-8 rounded-lg text-center ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-gray-700" : "border-gray-300 dark:border-gray-600"
              }`}
          >
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
              <p className="text-gray-600 dark:text-gray-400">Drag and drop a DOCX file here, or click to select</p>
            )}
          </div>
        )}

        {file && <ButtonProgress onClick={handleConvert} disabled={converting} />}

        {convertedUrl && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 mb-2">Conversion complete!</p>
            <a
              href={convertedUrl}
              download={convertedFileName}
              className="text-blue-500 hover:text-blue-700 hover:underline"
            >
              Download {convertedFileName}
            </a>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <p className="text-red-600 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}