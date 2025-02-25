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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

type Task = {
  id: number;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  attachments?: File[];
};

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [files, setFiles] = useState<File[]>([]);
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span
                              className={`ml-3 flex-grow ${
                                task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"
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
                              className={`ml-3 text-sm font-medium ${
                                task.priority === "high"
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        );
      case "timer":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Timer & Stopwatch</h2>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 dark:text-white mb-6">25:00</div>
              <div className="flex justify-center space-x-4">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Start
                </button>
                <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                  Reset
                </button>
              </div>
            </div>
          </div>
        );
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
              WORKSPACE
            </span>
            <span className="text-2xl font-medium text-[#0F4C75] dark:text-white">Pro</span>
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
          <h2 className="text-xl font-bold text-[#1B262C] dark:text-white mb-4">
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

          <h2 className="text-xl font-bold text-[#1B262C] dark:text-white mt-6 mb-4">
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
                  Manage Files
                </span>
              </Link>
            </li>
          </ul>
        </aside>

        {/* Right Section - Takes remaining space */}
        <div className="flex-grow bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mx-6 overflow-y-auto">
          {/* Tabs for Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("storage")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "storage"
                  ? "bg-[#0F4C75] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Storage
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "calendar"
                  ? "bg-[#0F4C75] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "tasks"
                  ? "bg-[#0F4C75] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("timer")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "timer"
                  ? "bg-[#0F4C75] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Timer
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "analytics"
                  ? "bg-[#0F4C75] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Render Active Tab Content */}
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}