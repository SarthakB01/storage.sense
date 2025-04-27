import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import DarkModeToggle from '../DarkModeToggle';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  notifications,
  showNotifications,
  setShowNotifications,
}: HeaderProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <header className="w-full px-4 md:px-8 py-4 flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
      <div className="flex items-center">
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

        <DarkModeToggle />

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
  );
} 