"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon as DotsVerticalIcon } from "@heroicons/react/24/solid";

export default function MyFiles() {
  interface File {
    length: number;
    _id: string;
    filename: string;
    size: number;
    filetype: string;
  }

  const [files, setFiles] = useState<File[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleProperties = (file: File) => {
    setSelectedFile(file);
    setShowSidebar(true);
  };

  useEffect(() => {
    async function fetchFiles() {
      try {
        const response = await fetch("/api/files/displayFiles");
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          return;
        }
        const data = await response.json();
        if (data.success) {
          setFiles(data.files);
        } else {
          console.error("Error fetching files:", data.error);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }
    fetchFiles();
  }, []);

  const getFileIcon = (file: File) => {
    const fileExtension = file.filename.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension || "")) {
      return (
        <div className="relative w-32 h-32">
          <Image
            src={`/api/files/ServeDownloads?filename=${file.filename}`}
            alt={file.filename}
            fill
            className="object-cover rounded-lg"
            sizes="96px"
            onError={(e) => {
              // TypeScript requires type assertion for error event
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-image.png";
            }}
          />
        </div>
      );
    } else if (fileExtension === "pdf") {
      return (
        <div className="w-24 h-24 flex items-center justify-center bg-red-500 rounded-lg text-white font-bold text-xl">
          PDF
        </div>
      );
    } else if (fileExtension === "docx" || fileExtension === "doc") {
      return (
        <div className="w-24 h-24 flex items-center justify-center bg-blue-500 rounded-lg text-white font-bold text-xl">
          WORD
        </div>
      );
    } else {
      return (
        <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 font-bold text-xl">
          FILE
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] pt-[88px]">
      <header className="fixed top-0 left-0 right-0 w-full px-8 py-6 flex justify-between items-center bg-white shadow-md z-50">
        <div className="flex items-center space-x-3">
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
          <h1 className="text-3xl font-bold flex items-center space-x-1">
            <span className="font-extrabold bg-gradient-to-r from-[#3282B8] to-[#0F4C75] bg-clip-text text-transparent animate-gradient leading-none">
              STORAGE
            </span>
            <span className="text-2xl font-medium text-[#0F4C75]">Sense</span>
          </h1>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Home
        </Link>
      </header>

      <div className="flex-1 relative">
        <main
          className={`h-full bg-white transition-all duration-300 ${
            showSidebar ? "mr-[400px]" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-semibold text-[#1B262C] mb-6">
              My Files
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div
                  key={file._id}
                  className={`border border-gray-300 rounded-lg p-4 text-center shadow-lg
                  ${
                    Math.floor(index / 4) % 2 === 0
                      ? "bg-[#e8f2fa]"
                      : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p
                      className="font-bold text-gray-900 text-lg truncate"
                      title={file.filename}
                    >
                      {file.filename.length > 15
                        ? `${file.filename.substring(0, 15)}...${file.filename
                            .split(".")
                            .pop()}`
                        : file.filename}
                    </p>
                    <Menu as="div" className="relative">
                      <Menu.Button
                        className="cursor-pointer hover:bg-gray-100 rounded-full p-1"
                        aria-label="Options"
                      >
                        <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                className={`block px-4 py-2 text-gray-900 hover:text-gray-800 ${
                                  active ? "bg-gray-100" : ""
                                }`}
                                href="#"
                              >
                                Open
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href={`/api/files/ServeDownloads?filename=${file.filename}`}
                                className={`block px-4 py-2 text-blue-600 hover:text-blue-800 ${
                                  active ? "bg-gray-100" : ""
                                }`}
                              >
                                Download
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                className={`block px-4 py-2 text-red-600 hover:text-red-800 ${
                                  active ? "bg-gray-100" : ""
                                }`}
                                href="#"
                              >
                                Delete
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => handleProperties(file)}
                                className={`block px-4 py-2 text-gray-600 ${
                                  active ? "bg-gray-100" : ""
                                }`}
                              >
                                Properties
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Menu>
                  </div>
                  <div className="w-full h-36 mb-4 flex items-center justify-center bg-gray-100 rounded-lg">
                    {getFileIcon(file)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {showSidebar && selectedFile && (
          <aside className="fixed top-[88px] right-0 w-[400px] h-[calc(100vh-88px)] bg-white shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  File Properties
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col items-center mb-6">
                {getFileIcon(selectedFile)}
                <h4 className="text-lg font-medium text-gray-800 mt-4 text-center">
                  {selectedFile.filename}
                </h4>
              </div>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">
                    File Details
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="text-gray-800">
                        {(selectedFile.length / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="text-gray-800">
                        {selectedFile.filetype || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
