'use client';
import React from 'react';

interface SectionCardProps {
  id?: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function SectionCard({ 
  id,
  title, 
  icon, 
  children, 
  className = '',
  collapsible = false,
  defaultExpanded = true 
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div id={id} className={`relative group ${className}`}>
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
      
      {/* Glass card */}
      <div className={`relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-2 border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] transform-style-3d ${className}`}>
        {/* Animated gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient"></div>
        
        <div 
          className={`px-6 py-5 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-white/50 via-white/30 to-white/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 ${
            collapsible ? 'cursor-pointer hover:from-white/70 hover:via-white/50 hover:to-white/70 dark:hover:from-gray-800/70 dark:hover:via-gray-700/50 dark:hover:to-gray-800/70 transition-all duration-300' : ''
          }`}
          onClick={() => collapsible && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center space-x-3">
              {icon && (
                <span className="text-2xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{icon}</span>
              )}
              <span className="gradient-text-rainbow">
                {title}
              </span>
            </h3>
            {collapsible && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/30">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                  {isExpanded ? 'Collapse' : 'Expand'}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        </div>
        {isExpanded && (
          <div className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm animate-slide-in-up">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

