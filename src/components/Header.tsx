"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            TravelBook
          </Link>

          <nav className="flex items-center gap-6">
            {isSignedIn ? (
              <>
                <Link
                  href="/trips"
                  className="text-gray-600 hover:text-gray-900"
                >
                  My Trips
                </Link>
                <Link
                  href="/trips/new"
                  className="text-gray-600 hover:text-gray-900"
                >
                  New Trip
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
