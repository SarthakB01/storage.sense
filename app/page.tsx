/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";
import {
  CloudArrowUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  BellIcon,
  PlusIcon,
  TrashIcon,
  PaperClipIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTheme } from "next-themes";
import DarkModeToggle from "@/app/components/DarkModeToggle";
import TimerStopwatch from "@/app/components/TimerStopwatch";

import MyFiles from "@/app/MyFiles/page";

//MyFiles code here:
// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
import {
  ArrowLeftIcon,
  XMarkIcon,
  EllipsisVerticalIcon as DotsVerticalIcon,
} from "@heroicons/react/24/solid";
import { Menu } from "@headlessui/react";
// import { useTheme } from "next-themes";
// import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
// import DarkModeToggle from "../components/DarkModeToggle";



type Task = {
  id: number;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  attachments?: File[];
};

interface CustomFile extends File {
  _id: string;
  filename: string;
  size: number;
  mimetype: string;
  type: string;
}

export default function Home() {

  //MyFiles Functions:

  // interface File {
  // const [files, setFiles] = useState<CustomFile[]>([]);
  //   _id: string;
  //   filename: string;
  //   size: number;
  //   mimetype: string; // Changed from metadata.mimetype
  // }

  // const [files, setFiles] = useState<CustomFile[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CustomFile | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<CustomFile | null>(null);

  const handleProperties = (file: CustomFile) => {
    setSelectedFile(file);
    setShowSidebar(true);
  };

  const handleFileOpen = (file: CustomFile) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (fileId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
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
        setFiles(files.filter((file) => file?._id !== fileId));
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
          // Explicitly type the `file` object as `CustomFile`
          const validFiles = data.files.filter((file: CustomFile) =>
            file && file.filename && file.size !== undefined
          );
          setFiles(validFiles);
        } else {
          console.error("Error fetching files:", data.error);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }
    fetchFiles();
  }, []);

  const getFileIcon = (file: CustomFile) => {
    // Ensure file.filename is defined
    const filename = file.filename || file.name || "";
    const fileExtension = filename?.split(".").pop()?.toLowerCase() || "";

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension)) {
      return (
        <div className="relative w-32 h-32">
          <Image
            src={file.filename ? `/api/files/ServeDownloads?filename=${file.filename}` : URL.createObjectURL(file)}
            alt={filename}
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
          <span className="text-black dark:text-white text-xl font-bold">
            Preview Not Available
          </span>
        </div>
      );
    }
  };




  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [files, setFiles] = useState<CustomFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("storage");
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your file was uploaded successfully", time: "2 min ago" },
    { id: 2, text: "Meeting reminder: Team sync at 3pm", time: "1 hour ago" },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Complete UI redesign", completed: false, priority: "high" },
    { id: 2, text: "Meeting with design team", completed: true, priority: "medium" },
    { id: 3, text: "Review project requirements", completed: false, priority: "low" },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const customFiles = acceptedFiles.map((file) => {
        const bytes = async () => {
          const arrayBuffer = await file.arrayBuffer();
          return new Uint8Array(arrayBuffer);
        };
      
        return {
          _id: '', // You may need to generate a unique ID for each file
          filename: file.name,
          size: file.size,
          mimetype: file.type,
          type: 'file', // You may need to adjust this based on your requirements
          lastModified: file.lastModified,
          name: file.name,
          webkitRelativePath: file.webkitRelativePath,
          arrayBuffer: () => file.arrayBuffer(),
          slice: (start: number | undefined, end: number | undefined) => file.slice(start, end),
          text: () => file.text(),
          stream: () => file.stream(),
          bytes,
        };
      });
      setFiles(customFiles);

    },
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
    multiple: true,
  });

  // Pre-warm the API endpoint
  useEffect(() => {
    fetch("/api/files/ping")
      .then(() => console.log("API pre-warmed"))
      .catch((err) => console.error("Pre-warm failed:", err));
  }, []);

  // Fetch uploaded files
  useEffect(() => {
    async function fetchUploadedFiles() {
      try {
        const response = await fetch("/api/files/displayFiles");
        if (response.ok) {
          const data = await response.json();
          setUploadedFiles(data);
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
        setUploadProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        alert("Files uploaded successfully!");
        setFiles([]);
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

  const addTask = () => {
    if (newTaskText.trim() === "") return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
    };
    setTasks([...tasks, newTask]);
    setNewTaskText("");
    setNewTaskDueDate("");
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const validFiles = files.filter(
    (file) => file && file.name && file.size !== undefined
  );

  const getMimeTypeFromExtension = (filename: string | null | undefined): string => {
    // Ensure filename is defined and not null
    if (!filename) {
      return "application/octet-stream"; // Default MIME type
    }

    const extension = filename?.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      default:
        return "application/octet-stream"; // Default MIME type
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "storage":
        return (
          <>
            {/* File Upload Section */}

            <div
              {...getRootProps()}
              className={`w-full h-64 border-2 ${isDragActive
                ? "border-[#0F4C75]"
                : "border-dashed border-gray-300 dark:border-gray-600"
                } rounded-lg flex flex-col items-center justify-center gap-4 transition duration-300 ${isDragActive ? "shadow-lg bg-[#BBE1FA]" : ""
                }`}
            >
              <input {...getInputProps()} />
              {files.length === 0 ? (
                <div className="text-center">

                  <CloudArrowUpIcon className="h-24 w-24 ml-14 text-gray-400 dark:text-gray-500" />
                  <p
                    className={`text-2xl font-semibold ${isDragActive ? "text-[#0F4C75]" : "text-gray-600 dark:text-gray-300"
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
                  className={`mt-4 py-2 px-6 font-bold text-white bg-[#0F4C75] rounded-lg transition duration-300 ${isUploading
                    ? "cursor-not-allowed bg-gray-500"
                    : "hover:bg-[#1B262C]"
                    }`}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>

              </div>

            )}

            {/* Uploaded Files Section */}


          </>

        );

      case "calendar":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Calendar</h2>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-300">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="p-2 text-center text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      case "tasks":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">To-Do List</h2>

            {/* Add Task Input */}
            <div className="flex items-center mb-6">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as "high" | "medium" | "low")}
                className="ml-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="ml-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              <button
                onClick={addTask}
                className="ml-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <PlusIcon className="h-5 w-5" />
              </button>

            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-3 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span
                    className={`ml-3 flex-grow ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"
                      }`}
                  >
                    {task.text}
                  </span>
                  {task.dueDate && (
                    <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span
                    className={`ml-3 text-sm font-medium ${task.priority === "high"
                      ? "text-red-500"
                      : task.priority === "medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                      }`}
                  >
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "timer":
        return <TimerStopwatch />;
      case "analytics":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tasks Completed</h3>
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">12</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tasks Pending</h3>
                <div className="text-4xl font-bold text-yellow-500">5</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#BBE1FA] to-[#3282B8] dark:from-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
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
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
            >
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                  <button className="text-indigo-600 dark:text-indigo-400 text-sm">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <p className="text-gray-800 dark:text-gray-200">{notification.text}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* User Profile */}
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

          {/* Login/Logout Button */}
          <Link
            href={isLoggedIn ? "/api/auth/signout" : "/api/auth/signin/github"}
            className="bg-[#0F4C75] hover:bg-[#1B262C] text-white text-lg font-bold py-2 px-5 rounded-lg transition duration-300 transform hover:scale-105"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex overflow-y-auto mt-6 mb-6">
        {/* Left Sidebar - Fixed to the left */}
        <aside className="w-64 bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg ml-6">
          {/* Tools Section */}
          <h2 className="text-xl font-bold text-[#1B262C] dark:text-white mb-4">
            Tools
          </h2>

          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li>
              <button
                onClick={() => setActiveTab("timer")}
                className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold"
              >
                <ClockIcon className="h-5 w-5" />
                <span>Timer</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("calendar")}
                className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Calendar</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("tasks")}
                className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Tasks</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("analytics")}
                className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold"
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Analytics</span>
              </button>
            </li>
          </ul>

          {/* Storage Section */}
          <h2 className="text-xl font-bold text-[#1B262C] dark:text-white mt-6 mb-4">
            Storage
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li>
              <Link href="/MyFiles">
                <span className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                  <PaperClipIcon className="h-5 w-5" />
                  <span>My Files</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/uploads">
                <span className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                  <CloudArrowUpIcon className="h-5 w-5" />
                  <span>Uploads</span>

                </span>
              </Link>

            </li>
            <li>
              <Link href="/api/files/resize">
                <span className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                  <ArrowUpIcon className="h-5 w-5" />
                  <span>Resize Images</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/api/files/manage">
                <span className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                  <TrashIcon className="h-5 w-5" />
                  <span>Manage Files</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/Convert_Docs_Frontend">
                <span className="flex items-center space-x-2 hover:text-[#0F4C75] dark:hover:text-[#BBE1FA] font-semibold">
                  <ArrowDownIcon className="h-5 w-5" />
                  <span>Convert PDF to Word</span>
                </span>
              </Link>
            </li>
          </ul>
        </aside>


        {/* Right Section - Takes remaining space */}
        <div className="flex-grow bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mx-6 overflow-y-auto">
          {/* Render Active Tab Content */}
          {activeTab === "storage" && (
            <>
              {/* File Upload Section */}
              <div
                {...getRootProps()}
                className={`w-full h-5/6 border-2 ${isDragActive
                  ? "border-[#0F4C75]"
                  : "border-dashed border-gray-300 dark:border-gray-600"
                  } rounded-lg flex flex-col items-center justify-center gap-4 transition duration-300 ${isDragActive ? "shadow-lg bg-[#BBE1FA]" : ""
                  }`}
              >
                <input {...getInputProps()} />

                {files.length === 0 ? (
                  <div className="text-center">
                    <CloudArrowUpIcon className="h-24 w-24 ml-14 text-gray-400 dark:text-gray-500" />

                    <p
                      className={`text-2xl font-semibold ${isDragActive ? "text-[#0F4C75]" : "text-gray-600 dark:text-gray-300"
                        }`}
                    >
                      {isDragActive ? "Release to Upload" : "Drag your files here"}
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
                    className={`mt-4 py-2 px-6 font-bold text-white bg-[#0F4C75] rounded-lg transition duration-300 ${isUploading
                      ? "cursor-not-allowed bg-gray-500"
                      : "hover:bg-[#1B262C]"
                      }`}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              )}




              {/* <MyFiles /> */}
              <div className="h-screen flex flex-col bg-gradient-to-br from-[#BBE1FA] to-[#d7e7f2] dark:from-gray-800 dark:to-gray-900">
                {/* <header className="fixed top-0 left-0 right-0 w-full px-8 py-6 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md z-50">
                      <div className="flex items-center space-x-3">
                        <Link href="/" className="flex items-center space-x-3">
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
                        </Link>
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
                    </header> */}

                <div className="flex-1 relative overflow-auto ">
                  <main
                    className={`min-h-full  bg-white dark:bg-gray-800 transition-all duration-300  ${showSidebar ? "mr-[400px] rounded-tr-xl rounded-br-xl" : ""
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
                            onClick={() => handleProperties(file)}
                            className={`border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow ${Math.floor(index / 4) % 2 === 0
                              ? "bg-[#e8f2fa] dark:bg-gray-700"
                              : "bg-white dark:bg-gray-800"
                              }`}
                          >
                            <div className="flex justify-between items-center mb-2" onClick={(e) => e.stopPropagation()}>
                              <p
                                className="font-bold text-gray-900 dark:text-gray-200 text-lg truncate"
                                title={file.filename}
                              >
                                {file.filename.length > 15
                                  ? `${file.filename.substring(0, 15)}...${file.filename
                                    ?.split(".")
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
                                          className={`block px-4 py-2 text-gray-900 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-400 ${active ? "bg-gray-100 dark:bg-gray-700" : ""
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
                                          className={`block px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 ${active ? "bg-gray-100 dark:bg-gray-700" : ""
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
                                          className={`block px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600 ${active ? "bg-gray-100 dark:bg-gray-700" : ""
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
                                          className={`block px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 ${active ? "bg-gray-100 dark:bg-gray-700" : ""
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
                    <aside className="rounded-tl-xl rounded-bl-xl fixed top-[88px] right-0 w-[400px] h-[calc(100vh-88px)] bg-white dark:bg-gray-800 shadow-lg">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            File Properties
                          </h3>
                          <button
                            onClick={() => setShowSidebar(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                          </button>
                        </div>
                        <div className="flex flex-col items-center mb-6">
                          {getFileIcon(selectedFile)}
                          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 text-center">
                            {selectedFile?.filename ?? "Unnamed file"}
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div className="border-t pt-4">
                            <h5 className="text-l font-bold text-gray-800 dark:text-gray-400 mb-2">
                              File Details
                            </h5>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Size</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {((selectedFile?.size ?? 0) / 1024).toFixed(2)} KB
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Type</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {selectedFile?.mimetype ?? "Unknown"}
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
                      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          setIsPreviewOpen(false);
                        }
                      }}
                    >
                      <div className="bg-gray-200 dark:bg-gray-500 p-4 rounded-lg w-4/5 h-4/5 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPreviewOpen(false);
                          }}
                          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50"
                        >
                          <XMarkIcon className="w-10 h-10 text-red-600" />
                        </button>
                        <div className="relative w-full h-full">
                          <div className="absolute top-4 left-4 p-3 bg-black bg-opacity-50 text-white rounded-lg max-w-[80%] z-10">
                            <p className="truncate font-medium" title={previewFile?.filename ?? "Unnamed file"}>
                              {previewFile?.filename ?? "Unnamed file"}
                            </p>
                          </div>
                          <div className="relative w-full h-full flex justify-center items-center">
                            <Image
                              src={`/api/files/ServeDownloads?filename=${previewFile?.filename}`}
                              alt="Preview not available for this file."
                              fill={true}
                              className="object-contain rounded-lg"
                              sizes="80vw"
                            />
                            {(previewFile?.filename?.endsWith(".pdf") ||
                              previewFile?.filename?.endsWith(".docx")) && (
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

            </>
          )}

          {activeTab === "calendar" && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Calendar
              </h2>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center font-medium text-gray-600 dark:text-gray-300"
                  >
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2 text-center text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                To-Do List
              </h2>

              {/* Add Task Input */}
              <div className="flex items-center mb-6">
                <input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask();
                  }}
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(e.target.value as "high" | "medium" | "low")
                  }
                  className="ml-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="ml-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                <button
                  onClick={addTask}
                  className="ml-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-3 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span
                      className={`ml-3 flex-grow ${task.completed
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : "text-gray-800 dark:text-gray-200"
                        }`}
                    >
                      {task.text}
                    </span>
                    {task.dueDate && (
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span
                      className={`ml-3 text-sm font-medium ${task.priority === "high"
                        ? "text-red-500"
                        : task.priority === "medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                        }`}
                    >
                      {task.priority}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "timer" && <TimerStopwatch />}

          {activeTab === "analytics" && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Tasks Completed
                  </h3>
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    12
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Tasks Pending
                  </h3>
                  <div className="text-4xl font-bold text-yellow-500">5</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMimeTypeFromExtension(name: string): any {
  throw new Error("Function not implemented.");
}
