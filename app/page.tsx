"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

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
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] flex flex-col">
      <header className="w-full px-8 py-6 flex justify-between items-center bg-white shadow-md">
        <h1 className="relative text-4xl font-bold text-[#0F4C75]">
          <span className="font-extrabold" style={{ letterSpacing: "2px" }}>
            Storage
          </span>
          <span
            className="absolute text-2xl font-medium text-gray-700"
            style={{ top: "-5px", right: "-75px" }}
          >
            Sense
          </span>
        </h1>

        <div className="flex items-center space-x-6">
          {isLoggedIn && (
            <div className="flex items-center space-x-2">
              <Image
                src={session?.user?.image || "/default-profile.png"}
                alt="User profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#1B262C]"
              />
              <span className="text-gray-700 font-medium">
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

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-6xl space-x-8">
          <aside className="bg-white p-6 shadow-lg rounded-lg w-64">
            <h2 className="text-xl font-bold text-[#1B262C] mb-4">
              Your Storage
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>
                <Link href="api/files">
                  <span className="hover:text-[#0F4C75] font-semibold">
                    My Files
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/uploads">
                  <span className="hover:text-[#0F4C75] font-semibold">
                    Uploads
                  </span>
                </Link>
              </li>
            </ul>
          </aside>

          <div className="bg-white p-8 rounded-lg shadow-lg flex-grow">
            <div
              {...getRootProps()}
              className={`w-full h-64 border-2 ${
                isDragActive
                  ? "border-[#0F4C75]"
                  : "border-dashed border-gray-300"
              } rounded-lg flex flex-col items-center justify-center gap-4 transition duration-300 ${
                isDragActive ? "shadow-lg bg-[#BBE1FA]" : ""
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
                <ul className="mt-4 w-full space-y-3 overflow-y-auto max-h-40">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow"
                    >
                      <div className="flex items-center space-x-4">
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={40}
                            height={40}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-gray-700">
                              {file.name.split(".").pop()?.toUpperCase() || ""}
                            </span>
                          </div>
                        )}
                        <span className="font-medium">{file.name}</span>
                      </div>
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
