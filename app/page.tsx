"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = session?.user ? true : false;

  return (
    <>
      {/* NavBar */}
      <div>
        <div className="bg-white p-4 rounded-lg flex justify-between items-center">
          <p
            className={`text-3xl font-bold leading-none ${
              isLoggedIn ? "text-blue-700" : "text-blue-500"
            }`}
          >
            Storage Sense
          </p>

          <div className="flex items-center space-x-4">
            {/* Logged In/Not Logged In text */}
            <p className="text-blue-800 text-xl">
              {isLoggedIn ? session.user.name : ""}
            </p>

            {/* Login/Logout button */}
            <Link
              href={
                isLoggedIn ? "/api/auth/signout" : "/api/auth/signin/github"
              }
              className="bg-blue-500 hover:bg-blue-700 text-white text-xl font-bold py-2 px-4 rounded-lg"
            >
              {isLoggedIn ? "Logout" : "Login"}
            </Link>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="flex items-center justify-center min-h-screen">
        <form
          action="/DragDrop"
          method="POST"
          className="bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <label
            htmlFor="file"
            className="block text-2xl font-medium text-gray-700"
          >
            Drop it like its hot!
          </label>
          <input
            type="file"
            name="input file"
            id="file"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Upload
          </button>
        </form>
      </div>
    </>
  );
}
