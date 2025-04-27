/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { JSX, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "@/app/components/DarkModeToggle";
import FileUpload from './components/FileUpload';

// Import Icons
import {
  CloudArrowUpIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowPathIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  BellIcon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  HomeIcon,
  UserCircleIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  ShareIcon,
  StarIcon,
  CalendarDaysIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// Import Components 
import FileCard from "@/app/components/FileCard";
import ConversionTool from "@/app/components/ConversionTool";
import FilePreview from "@/app/components/FilePreview";
import ImageResizer from "@/app/components/ImageResizer";
import Analytics from "@/app/components/Analytics";
import MobileNav from "@/app/components/MobileNav";
import FileManager from "@/app/components/FileManager";

// Type Definitions
interface File extends globalThis.File {
  starred?: boolean;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

interface ConversionTool {
  id: string;
  name: string;
  icon: JSX.Element;
}

type ViewMode = "grid" | "list";
type SortBy = "date" | "name" | "size";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "images" | "documents";
type ActiveTab = "storage" | "myFiles" | "starred" | "analytics" | "tools";
type ActiveTool = "wordToPdf" | "pdfToWord" | "imageResize" | "imageConvert" | "pdfMerge" | null;

interface StorageStats {
  total: number;
  used: number;
  available: number;
  percentage: number;
}

interface QuickAction {
  id: string;
  name: string;
  icon: JSX.Element;
  action: () => void;
}

// Add this function before the Home component
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  
  // File management states
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<ActiveTab>("storage");
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: "Your file was uploaded successfully", time: "2 min ago", read: false },
    { id: 2, text: "Storage capacity at 75%", time: "1 hour ago", read: false },
    { id: 3, text: "New conversion feature added", time: "1 day ago", read: true },
  ]);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Tool options
  const conversionTools: ConversionTool[] = [
    { id: "wordToPdf", name: "Word to PDF", icon: <DocumentIcon className="h-5 w-5" /> },
    { id: "pdfToWord", name: "PDF to Word", icon: <DocumentIcon className="h-5 w-5" /> },
    { id: "imageResize", name: "Image Resizer", icon: <PhotoIcon className="h-5 w-5" /> },
    { id: "imageConvert", name: "Image Converter", icon: <ArrowPathIcon className="h-5 w-5" /> },
    { id: "pdfMerge", name: "PDF Merger", icon: <DocumentIcon className="h-5 w-5" /> },
  ];

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload API response:', result);
        if (result && Array.isArray(result.files)) {
          setUploadedFiles((prev) => [...result.files, ...prev]);
          addNotification('Files uploaded successfully!');
        } else {
          addNotification('Upload succeeded but response format was unexpected.');
          console.error('Expected an array at result.files, got:', result.files);
        }
        setFiles([]);
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      addNotification('Error uploading files: ' + (error as Error).message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const addNotification = (text: string): void => {
    const newNotification: Notification = {
      id: Date.now(),
      text,
      time: "Just now",
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (id: number): void => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = (): void => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) {
      addNotification("No files selected for upload");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [...result.files, ...prev]);
        addNotification("Files uploaded successfully!");
        setFiles([]);
        
        // Reset progress after a delay
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      addNotification("Error uploading files: " + (error as Error).message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    // Click outside to close sidebar on mobile
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) && 
        window.innerWidth < 768
      ) {
        setShowSidebar(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchUploadedFiles() {
      try {
        const response = await fetch("/api/files/displayFiles");
        const data = await response.json();

        if (!data.session) {
          return;
        }

        if (response.ok && data.success) {
          setUploadedFiles(data.files);
        } else {
          addNotification("Failed to fetch files: " + data.message);
        }
      } catch (err) {
        addNotification("Error loading files");
      }
    }

    fetchUploadedFiles();

    // Add window resize listener for responsive layout
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSortDirection = (): void => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const filterFiles = (files: File[]): File[] => {
    // Apply search filter
    let filtered = files;
    
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(file => {
        if (filterType === "images") {
          return file.type.startsWith("image/");
        } else if (filterType === "documents") {
          return file.type.includes("pdf") || 
                 file.type.includes("word") || 
                 file.type.includes("doc");
        }
        return true;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "size") {
        return sortDirection === "asc" 
          ? a.size - b.size
          : b.size - a.size;
      } else {
        // Sort by date
        return sortDirection === "asc" 
          ? new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          : new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });
    return filtered;
  };

  const getFileTypeIcon = (type: string | undefined): JSX.Element => {
    if (!type) return <DocumentIcon className="h-6 w-6" />;
    
    if (type.startsWith("image/")) {
      return <PhotoIcon className="h-6 w-6" />;
    } else if (type.includes("pdf")) {
      return <DocumentIcon className="h-6 w-6" />;
    } else if (type.includes("word") || type.includes("doc")) {
      return <DocumentIcon className="h-6 w-6" />;
    }
    return <DocumentIcon className="h-6 w-6" />;
  };

  // Add new states for enhanced functionality
  const [storageStats, setStorageStats] = useState<StorageStats>({
    total: 100 * 1024 * 1024 * 1024, // 100GB
    used: 0,
    available: 100 * 1024 * 1024 * 1024,
    percentage: 0
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFileActions, setShowFileActions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [recentFiles, setRecentFiles] = useState<File[]>([]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'upload',
      name: 'Upload Files',
      icon: <ArrowUpTrayIcon className="h-6 w-6" />,
      action: () => setActiveTab('storage')
    },
    {
      id: 'organize',
      name: 'Organize Files',
      icon: <FolderIcon className="h-6 w-6" />,
      action: () => setActiveTab('myFiles')
    },
    {
      id: 'analytics',
      name: 'View Analytics',
      icon: <ChartBarIcon className="h-6 w-6" />,
      action: () => setActiveTab('analytics')
    }
  ];

  // Calculate storage stats
  useEffect(() => {
    const calculateStorage = () => {
      const used = uploadedFiles.reduce((total, file) => {
        const size = file.size || 0;
        return total + size;
      }, 0);
      const available = Math.max(0, storageStats.total - used);
      const percentage = Math.min(100, Math.max(0, (used / storageStats.total) * 100));

      setStorageStats(prev => ({
        ...prev,
        used,
        available,
        percentage
      }));
    };

    calculateStorage();
  }, [uploadedFiles, storageStats.total]);

  // Get recent files
  useEffect(() => {
    const recent = [...uploadedFiles]
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
      .slice(0, 5);
    setRecentFiles(recent);
  }, [uploadedFiles]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFiles(prev => {
      if (prev.some(f => f.name === file.name)) {
        return prev.filter(f => f.name !== file.name);
      }
      return [...prev, file];
    });
  };

  // Handle file actions
  const handleFileAction = (action: string) => {
    switch (action) {
      case 'delete':
        setUploadedFiles(prev => prev.filter(f => !selectedFiles.some(sf => sf.name === f.name)));
        setSelectedFiles([]);
        addNotification('Selected files deleted');
        break;
      case 'share':
        setShowShareModal(true);
        setShareLink(`https://cloudvault.com/share/${selectedFiles.map(f => f.name).join(',')}`);
        break;
      case 'star':
        setUploadedFiles(prev => 
          prev.map(f => 
            selectedFiles.some(sf => sf.name === f.name)
              ? { ...f, starred: !f.starred }
              : f
          )
        );
        addNotification('Files starred/unstarred');
        break;
    }
    setShowFileActions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-4 flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <ViewColumnsIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-2 rounded-xl">
              <CloudArrowUpIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center space-x-1">
              <span className="font-extrabold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                Cloud
              </span>
              <span className="text-xl md:text-2xl font-medium text-gray-800 dark:text-white">
                Vault
              </span>
            </h1>
          </div>
        </div>
        
        {/* Search bar - desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500"
          />
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
            >
              <BellIcon className="h-6 w-6" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* User Profile */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <div className="hidden md:block">
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {session?.user?.name}
                </span>
              </div>
              <Image
                src={session?.user?.image || "/default-profile.png"}
                alt="User profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-violet-200 dark:border-gray-700"
              />
            </div>
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
          )}

          {/* Login/Logout Button */}
          <Link
            href={isLoggedIn ? "/api/auth/signout" : "/api/auth/signin/github"}
            className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-base font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            <span>{isLoggedIn ? "Logout" : "Login"}</span>
            {isLoggedIn ? (
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            ) : null}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-grow min-h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {showSidebar && (
            <motion.aside
              ref={sidebarRef}
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-lg md:shadow-none fixed md:sticky top-[73px] h-[calc(100vh-73px)] z-20 overflow-y-auto"
            >
              {/* Main Navigation */}
              <nav className="mb-8">
                <h2 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Main
                </h2>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("storage");
                        setActiveTool(null);
                        if (window.innerWidth < 768) setShowSidebar(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === "storage" && !activeTool
                          ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <HomeIcon className="h-5 w-5" />
                      <span className="font-medium">Home</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-grow p-4 md:p-8">
          {activeTab === "storage" && !activeTool ? (
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <FileUpload
                  onDrop={handleDrop}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              </div>

              {/* Storage Overview */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Storage Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Used: {formatFileSize(storageStats.used)}</span>
                      <span>Total: {formatFileSize(storageStats.total)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${storageStats.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Available: {formatFileSize(storageStats.available)}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-4">
                  {quickActions.map(action => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {action.icon}
                      <span className="mt-2 text-sm text-gray-700 dark:text-gray-300">{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Files */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Files</h3>
                <div className="space-y-3">
                  {recentFiles.length > 0 ? (
                    recentFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {file.type && file.type.startsWith('image/') ? (
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            {getFileTypeIcon(file.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(file.size || 0)}</span>
                            <span>•</span>
                            <span>{new Date(file.lastModified || 0).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent files
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Welcome to Cloud Vault
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Start by uploading your files or exploring the available tools.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Actions Modal */}
      {showFileActions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              File Actions
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => handleFileAction('delete')}
                className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Delete Selected Files</span>
              </button>
              <button
                onClick={() => handleFileAction('share')}
                className="w-full flex items-center space-x-2 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 p-2 rounded-lg"
              >
                <ShareIcon className="h-5 w-5" />
                <span>Share Selected Files</span>
              </button>
              <button
                onClick={() => handleFileAction('star')}
                className="w-full flex items-center space-x-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-2 rounded-lg"
              >
                <StarIcon className="h-5 w-5" />
                <span>Star/Unstar Files</span>
              </button>
            </div>
            <button
              onClick={() => setShowFileActions(false)}
              className="mt-4 w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Share Files
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    addNotification('Link copied to clipboard');
                  }}
                  className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActiveTool={setActiveTool}
      />
    </div>
  );
} 