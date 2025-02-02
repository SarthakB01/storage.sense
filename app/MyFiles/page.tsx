"use client";
import { useEffect, useState } from "react";
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
        <div className="w-24 h-24 flex items-center justify-center bg-gray-300 rounded-lg text-gray-700 font-bold text-xl">
          IMG
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
    <div className="h-screen bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] flex flex-col">
      <header className="w-full px-8 py-6 flex justify-between items-center bg-white shadow-md">
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
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl px-4 py-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-[#1B262C] mb-6">
            My Files
          </h1>
          <div className="flex flex-wrap gap-4">
            {files.map((file) => (
              <div
                key={file._id}
                className="border border-gray-300 rounded-lg p-4 w-52 text-center bg-[#F0F8FF] shadow-lg"
              >
                {/* File name on top and Menu in top-right */}
                <div className="flex justify-between items-center mb-2">
                  <p
                    className="font-bold text-gray-900 text-lg truncate"
                    title={file.filename} // Show full name on hover
                  >
                    {file.filename}
                  </p>
                  <Menu as="div" className="relative">
                    <Menu.Button
                      as="div"
                      className="cursor-pointer hover:bg-gray-100 rounded-full"
                      aria-label="Options"
                    >
                      <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item
                          as="a"
                          className="block px-4 py-2 text-gray-600 hover:text-gray-800"
                          // onClick={() => handleOpen(file.filename)}
                        >
                          Open
                        </Menu.Item>
                        <Menu.Item
                          as="a"
                          href={`/api/files/ServeDownloads?filename=${file.filename}`}
                          className="block px-4 py-2 text-blue-600 hover:text-blue-800"
                          // onClick={() => handleDownload(file.filename)}
                        >
                          Download
                        </Menu.Item>
                        <Menu.Item
                          as="a"
                          className="block px-4 py-2 text-red-600 hover:text-red-800"
                          // onClick={() => handleDelete(file.filename)}
                        >
                          Delete
                        </Menu.Item>

                        <Menu.Item
                          as="a"
                          className="block px-4 py-2 text-blue-600 hover:text-blue-800"
                          // onClick={() => handleProperties(file.filename)}
                        >
                          Properties
                        </Menu.Item>

                      </div>
                    </Menu.Items>
                  </Menu>
                </div>

                {/* File Icon */}
                <div className="w-full h-36 mb-4 flex items-center justify-center bg-gray-100 rounded-lg">
                  {getFileIcon(file)}
                </div>

                {/* File Size (below file name) */}
                <p className="text-xs text-gray-800">
                  {(file.length / 1024).toFixed(2)} KB
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
