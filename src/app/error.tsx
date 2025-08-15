'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error while loading this page. Please try again.
        </p>

        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Error Details (Development Only)
            </h3>
            <div className="text-sm text-red-700">
              <p className="font-medium mb-1">{error.name}</p>
              <p className="mb-2">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-600">Error ID: {error.digest}</p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Try again
          </button>
          
          <a
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Go to home page
          </a>
        </div>

        {/* Help text */}
        <p className="mt-6 text-sm text-gray-500">
          If this problem continues, please contact our support team.
        </p>
      </div>
    </div>
  );
}