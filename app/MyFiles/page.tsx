/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  XMarkIcon,
  EllipsisVerticalIcon as DotsVerticalIcon,
} from "@heroicons/react/24/solid";
import { Menu } from "@headlessui/react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import DarkModeToggle from "../components/DarkModeToggle";

export default function MyFiles() {
  interface File {
    length: number;
    _id: string;
    filename: string;
    size: number;
    mimetype: string;  // Changed from metadata.mimetype
  }

  const [files, setFiles] = useState<File[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  
  const handleProperties = (file: File) => {
    setSelectedFile(file);
    setShowSidebar(true);
  };

  const handleFileOpen = (file: File) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (fileId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/files/DeleteFiles", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the file from the frontend state
        setFiles(files.filter((file) => file._id !== fileId));
        alert("File deleted successfully");
      } else {
        alert(`Error deleting file: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error deleting file");
    }
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
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
          <span className="text-black dark:text-white  text-xl font-bold">
            Preview Not Available
          </span>
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#BBE1FA] to-[#d7e7f2] dark:from-gray-800 dark:to-gray-900">
      <header className="fixed top-0 left-0 right-0 w-full px-8 py-6 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md z-50">
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
            <span className="text-2xl font-medium text-[#0F4C75] dark:text-white">
              Sense
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          <DarkModeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="flex-1 relative overflow-auto pt-[88px]">
        <main
          className={`min-h-full  bg-white dark:bg-gray-800 transition-all duration-300  ${
            showSidebar ? "mr-[400px] rounded-tr-xl rounded-br-xl" : ""
          }`}
          // style={{ backgroundColor: "white" }}
        >
          <div className="rounded-tr-xl rounded-br-xl max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-semibold text-[#1B262C] dark:text-white mb-6">
              My Files
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div
                  key={file._id}
                  className={`border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center shadow-lg ${
                    Math.floor(index / 4) % 2 === 0
                      ? "bg-[#e8f2fa] dark:bg-gray-700"
                      : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p
                      className="font-bold text-gray-900 dark:text-gray-200 text-lg truncate"
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
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
                        aria-label="Options"
                      >
                        <DotsVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => handleFileOpen(file)}
                                className={`block px-4 py-2 text-gray-900 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-400 ${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
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
                                className={`block px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 ${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                }`}
                              >
                                Download
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => handleDelete(file._id)}
                                className={`block px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600 ${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
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
                                className={`block px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 ${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
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
                  <div className="w-full scale-105 h-36 mb-2 flex items-center justify-center dark:bg-gray-700 rounded-lg">
                    {getFileIcon(file)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {showSidebar && selectedFile && (
          <aside className=" rounded-tl-xl rounded-bl-xl  fixed top-[88px] right-0 w-[400px] h-[calc(100vh-88px)] bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-6">
              <div className=" flex justify-between items-center mb-6">
                <h3 className="  text-xl font-semibold text-gray-800 dark:text-gray-200">
                  File Properties
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 dark:text-gray-300"
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
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 text-center">
                  {selectedFile.filename}
                </h4>
              </div>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h5 className="text-l font-bold  text-gray-800 dark:text-gray-400 mb-2">
                    File Details
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Size
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {(selectedFile.length / 1024).toFixed(2)} KB
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 block">
                        File ID:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 block">
                        {selectedFile._id}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Type
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {selectedFile.mimetype || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {isPreviewOpen && previewFile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center "
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsPreviewOpen(false);
              }
            }}
          >
            <div className="bg-gray-200 dark:bg-gray-500 p-4 rounded-lg w-4/5 h-4/5 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop event from bubbling up
                  setIsPreviewOpen(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50"
              >
                <XMarkIcon className="w-10 h-10 text-red-600" />
              </button>
              <div className="relative w-full h-full ">
                <div className="absolute top-4 left-4 p-3 bg-black bg-opacity-50 text-white rounded-lg max-w-[80%] z-10 ">
                  <p
                    className="truncate font-medium "
                    title={previewFile.filename}
                  >
                    {previewFile.filename}
                  </p>
                </div>

                <div className="relative w-full h-full flex justify-center items-center">
                  <Image
                    src={`/api/files/ServeDownloads?filename=${previewFile.filename}`}
                    alt="Preview not available for this file."
                    fill={true}
                    className="object-contain rounded-lg"
                    sizes="80vw"
                  />

                  {(previewFile.filename.endsWith(".pdf") ||
                    previewFile.filename.endsWith(".docx")) && (
                    <span className="absolute text-black dark:text-white font-bold text-2xl text-center">
                      Preview not available for this file.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
