'use client';
import React from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export default function FloatingCard({ 
  children, 
  className = '',
  delay = 0,
  duration = 3
}: FloatingCardProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

