// /app/home/page.js
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white p-4 rounded-lg flex justify-between items-center">
      <p className="text-blue-500 text-3xl font-bold leading-none">
        Storage Sense
      </p>

      {/* Login button for GitHub */}
      <Link
        href="/api/auth/signin/github"
        className="bg-blue-500 hover:bg-blue-700 text-white text-xl font-bold py-2 px-4 rounded-lg"
      >
        Login
      </Link>
    </div>
  );
}
