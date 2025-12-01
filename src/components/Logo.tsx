import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="The Next Dawn Logo"
    >
      {/* The Horizon Line */}
      <rect x="10" y="65" width="80" height="8" rx="2" fill="currentColor" />
      
      {/* The Rising Sun (Split Geometric) */}
      <path 
        d="M20 55 C 20 30, 80 30, 80 55" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      
      {/* The "Spark" (Accent) */}
      <circle cx="50" cy="35" r="6" className="text-indigo-600" fill="currentColor" />
    </svg>
  );
}