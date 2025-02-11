/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import DarkModeToggle from '@/app/components/DarkModeToggle';




export default function Home() {

  
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
    },
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
    },
    multiple: true,
  });

  // Pre-warm the API endpoint
  useEffect(() => {
    fetch("/api/files/ping")
      .then(() => console.log("API pre-warmed"))
      .catch((err) => console.error("Pre-warm failed:", err));
  }, []);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch uploaded files
  useEffect(() => {
    async function fetchUploadedFiles() {
      try {
        const response = await fetch("/api/files/displayFiles");
        if (response.ok) {
          const data = await response.json();
          setUploadedFiles(data); // Set fetched file metadata
        } else {
          console.error("Failed to fetch files:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    }

    fetchUploadedFiles();
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("No files to upload!");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentage); // Set the upload progress
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        alert("Files uploaded successfully!");
        setFiles([]); // Clear the uploaded files
      } else {
        alert("Error uploading files: " + xhr.statusText);
      }
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.onerror = () => {
      alert("Error uploading files");
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] dark:from-gray-800 dark:to-gray-900 flex flex-col">
      <header className="w-full px-8 py-6 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center space-x-3">
          {/* Minimal Icon */}
          <div className="bg-gradient-to-r from-[#3282B8] to-[#0F4C75] p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10l9-7 9 7v7a4 4 0 01-4 4H7a4 4 0 01-4-4v-7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 21V9l6 3m-6 0l6-3"
              />
            </svg>
          </div>
          {/* Text Section */}
          <h1 className="text-3xl font-bold flex items-center space-x-1">
            <span className="font-extrabold bg-gradient-to-r from-[#3282B8] to-[#0F4C75] bg-clip-text text-transparent animate-gradient leading-none">
              STORAGE
            </span>
            <span className="text-2xl font-medium text-[#0F4C75] dark:text-white">Sense</span>
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          

          <DarkModeToggle />

          {/* <DarkModeToggleButton /> */}






          {isLoggedIn && (
            <div className="flex items-center space-x-2">
              <Image
                src={session?.user?.image || "/default-profile.png"}
                alt="User profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#1B262C]"
              />
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {session?.user?.name}
              </span>
            </div>
          )}
          <Link
            href={isLoggedIn ? "/api/auth/signout" : "/api/auth/signin/github"}
            className="bg-[#0F4C75] hover:bg-[#1B262C] text-white text-lg font-bold py-2 px-5 rounded-lg transition duration-300 transform hover:scale-105"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col place-items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="flex w-full max-w-6xl space-x-8 scale-110 ">
          {/* Folders Section (on the left) */}
          <aside className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg w-96">
            <h2 className="text-xl  font-bold text-[#1B262C] dark:text-white mb-4">
              Your Folders
            </h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li>
                <Link href="/Convert_Docs_Frontend">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Convert PDF to WORD
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/folder/Component2">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Folder 2
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/folder/Component3">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Folder 3
                  </span>
                </Link>
              </li>
            </ul>
          </aside>

          {/* Dropzone Area (in the middle) */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex-grow w-full max-w-2xl flex flex-col items-center justify-center">
            <div
              {...getRootProps()}
              className={`w-full h-64 border-2 ${
                isDragActive
                  ? "border-[#0F4C75]"
                  : "border-dashed border-gray-300 dark:border-gray-600"
              } rounded-lg flex flex-col items-center justify-center gap-4 transition duration-300 ${
                isDragActive ? "shadow-lg bg-[#BBE1FA]" : ""
              }`}
            >
              <input {...getInputProps()} />
              {files.length === 0 ? (
                <div className="text-center">
                  <CloudArrowUpIcon className="h-24 w-24 ml-14 text-gray-400 dark:text-gray-500" />
                  <p
                    className={`text-2xl font-semibold ${
                      isDragActive ? "text-[#0F4C75]" : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {isDragActive
                      ? "Release to Upload"
                      : "Drag your files here"}
                  </p>
                </div>
              ) : (
                <ul className="mt-4 w-full space-y-3 overflow-y-auto max-h-40">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow"
                    >
                      <div className="flex items-center space-x-4 scale-110 ml-4 ">
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={40}
                            height={40}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-gray-700 dark:text-gray-300">
                              {file.name.split(".").pop()?.toUpperCase() || ""}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {file.name.length > 15
                            ? `${file.name.substring(0, 15)}...${file.name
                                .split(".")
                                .pop()}`
                            : file.name}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="mt-6 flex justify-center">
                <div className="w-2/3 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-[#0F4C75] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`mt-4 py-2 px-6 font-bold text-white bg-[#0F4C75] rounded-lg transition duration-300 ${
                    isUploading
                      ? "cursor-not-allowed bg-gray-500"
                      : "hover:bg-[#1B262C]"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}
          </div>

          {/* Right Area (on the right) */}
          <aside className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg w-64">
            <h2 className="text-xl font-bold text-[#1B262C] dark:text-white mb-4">
              Your Storage
            </h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li>
                <Link href="/MyFiles">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    My Files
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/uploads">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Uploads
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/api/files/resize">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Resize Images
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/api/files/manage">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Manage Files (Add/Delete/Recycle Bin)
                  </span>
                </Link>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-[#1B262C] dark:text-white mt-6 mb-4">
              Account Settings
            </h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li>
                <Link href="/account/settings">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Account Settings
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <span className="hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                    Help
                  </span>
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
