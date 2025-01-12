"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [files, setFiles] = useState<File[]>([]);

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

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("No files to upload!");
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert("Files uploaded successfully!");
        setFiles([]);
      } else {
        alert("Error uploading files: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error uploading files");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#BBE1FA] to-[#3282B8]">
      <header className="w-full px-8 py-6 flex justify-between items-center text-[#1B262C]">
        <h1 className="relative text-4xl font-bold tracking-wide text-[#0F4C75]">
          <span
            className="font-black"
            style={{
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "2px",
            }}
          >
            storage
          </span>
          <span
            className="absolute text-3xl font-medium text-[#1B262C]"
            style={{
              fontFamily: "'Poppins', sans-serif",
              top: "-5px",
              right: "-85px",
            }}
          >
            sense
          </span>
        </h1>

        <div className="flex items-center space-x-6">
          {isLoggedIn && (
            <div className="flex items-center">
              <Image
                src={session?.user?.image || "/default-profile.png"}
                alt="User profile"
                width={40}
                height={40}
                className="rounded-full mr-2"
              />
              <span className="text-gray-700 font-medium">
                {session?.user?.name}
              </span>
            </div>
          )}
          <Link
            href={isLoggedIn ? "/api/auth/signout" : "/api/auth/signin/github"}
            className="bg-[#0F4C75] hover:bg-[#1B262C] text-white text-lg font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </Link>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-grow flex items-start justify-center py-8 px-4">
        <div className="flex w-full justify-around mt-20">
          <aside className="bg-white p-6 shadow-md rounded-lg w-64">
            <h2 className="text-xl font-bold text-[#1B262C] mb-4">
              Your Storage
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>
                <Link href="api/files">
                  <span className="hover:text-[#0F4C75]">My Files</span>
                </Link>
              </li>
              <li>
                <Link href="/uploads">
                  <span className="hover:text-[#0F4C75]">Uploads</span>
                </Link>
              </li>
              {/* ... more menu items */}
            </ul>
          </aside>

          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl flex flex-col items-center ml-2">
            <div
              {...getRootProps()}
              className={`w-full h-64 border-2 ${
                isDragActive
                  ? "border-[#0F4C75]"
                  : "border-dashed border-gray-300"
              } rounded-lg flex flex-col items-center justify-center gap-4 hover:shadow-xl transition duration-300 ease-in-out transform ${
                isDragActive ? "scale-105" : ""
              }`}
            >
              <input {...getInputProps()} />

              {files.length === 0 ? (
                <div className="text-center">
                  <CloudArrowUpIcon className="h-24 w-24 text-gray-400" />
                  <p
                    className={`text-2xl font-semibold ${
                      isDragActive ? "text-[#0F4C75]" : "text-gray-600"
                    }`}
                  >
                    {isDragActive
                      ? "Release to Upload"
                      : "Drag your files here"}
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-2 w-full px-4 overflow-y-auto max-h-40">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="text-gray-800 bg-white rounded-lg px-4 py-2 flex justify-between items-center shadow-md"
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

            {files.length > 0 && (
              <button
                className="mt-4 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                onClick={handleUpload}
              >
                Upload
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
