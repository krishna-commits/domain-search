'use client';
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  gradient?: boolean;
}

export default function GlassCard({ children, className = '', glow = false, gradient = false }: GlassCardProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect */}
      {glow && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      )}
      
      {/* Glass card */}
      <div className={`relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl ${
        gradient ? 'bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/70' : ''
      } transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]`}>
        {children}
      </div>
    </div>
  );
}

