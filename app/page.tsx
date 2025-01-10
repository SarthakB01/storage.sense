"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [files, setFiles] = useState<File[]>([]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
    },
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
    multiple: true,
  });

  return (
    <div className="h-screen overflow-hidden">
      {/* NavBar */}
      <header className="bg-gray-950 p-6 shadow-md rounded-lg flex justify-between items-center text-gray-200">
        <h1
          className={`text-3xl font-bold tracking-wide ${
            isLoggedIn ? "text-blue-500" : "text-blue-400"
          }`}
        >
          Storage Sense
        </h1>
        <div className="flex items-center space-x-6">
          <span className="text-gray-400 text-xl font-medium">
            {session?.user?.name || ""}
          </span>
          <Link
            href={isLoggedIn ? "/api/auth/signout" : "/api/auth/signin/github"}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </Link>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex h-[calc(100vh-5rem)] bg-gray-900">
        {/* Left Menu */}
        <aside className="w-1/3 bg-gray-900 p-6 border-r border-gray-50">
          <h2 className="text-lg font-bold text-gray-200 mb-4">Menu</h2>
          <ul className="space-y-3 text-gray-400">
            <li>Store your files</li>
            <li>Resize images</li>
            <li>Other features (coming soon)</li>
          </ul>
        </aside>

        {/* Right Drag-and-Drop Area */}
        <section className="flex-1 flex items-center justify-center border-l border-gray-50 p-4">
          <div
            {...getRootProps()}
            className={`w-3/4 ${files.length > 0 ? "h-[50%]" : "h-3/4"} border-4 ${
              isDragActive ? "border-blue-500" : "border-dashed border-gray-400"
            } rounded-2xl flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform ${
              isDragActive ? "scale-105" : ""
            }`}
          >
            <input {...getInputProps()} />

            {/* Show Drop Message only if no files are present */}
            {files.length === 0 && (
              <p
                className={`text-lg font-semibold ${
                  isDragActive ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {isDragActive
                  ? "Drop it like its hot♨️"
                  : "Drop your files here..."}
              </p>
            )}

            {/* List of Uploaded Files */}
            {files.length > 0 && (
              <ul className="mt-4 space-y-2 w-full px-4 overflow-y-auto max-h-40">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="text-gray-800 bg-gray-200 rounded-lg px-4 py-2 flex justify-between items-center"
                  >
                    <span>{file.name}</span>
                    <span className="text-gray-500 text-sm">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* "Go" Button placed outside of the dropzone */}
          {files.length > 0 && (
            <button
              className="mt-4 ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              onClick={() => console.log("Go button clicked!")}
            >
              Upload
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
