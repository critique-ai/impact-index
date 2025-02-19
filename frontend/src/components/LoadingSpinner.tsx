'use client';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-gray-700 border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-b-purple-500 animate-spin animation-delay-150"></div>
      </div>
    </div>
  );
} 