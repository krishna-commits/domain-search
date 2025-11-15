'use client';
import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (domain: string) => void }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const validateDomain = (input: string) => {
    const cleaned = input.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(?:\.[a-zA-Z]{2,})+$/;
    return regex.test(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }
    
    let cleanedDomain = domain.trim().toLowerCase();
    cleanedDomain = cleanedDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (!validateDomain(cleanedDomain)) {
      setError('Invalid domain format. Example: example.com');
      return;
    }
    
    onSearch(cleanedDomain);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Animated Glow Ring */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-30 dark:group-focus-within:opacity-20 transition-opacity duration-500 ${isFocused ? 'animate-pulse' : ''}`}></div>
        
        {/* Main Container */}
        <div className="relative flex flex-col sm:flex-row gap-0 rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border-2 border-slate-200/60 dark:border-slate-700/60 shadow-2xl group-focus-within:border-blue-400/60 dark:group-focus-within:border-blue-500/60 transition-all duration-300 max-w-4xl mx-auto">
          {/* Input Section */}
          <div className="relative flex-grow">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_20s_linear_infinite]"></div>
            </div>
            
            {/* Search Icon */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
                <svg className="relative w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-focus-within:scale-110 group-focus-within:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <input
              type="text"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setError('');
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="relative block w-full pl-14 pr-6 py-6 text-lg sm:text-xl border-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 font-semibold z-10"
              placeholder="Enter domain (example.com)"
              required
            />
            
            {/* Animated Bottom Border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left"></div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="relative px-10 sm:px-14 py-6 text-lg sm:text-xl font-black text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-blue-500/50 overflow-hidden group/btn"
          >
            {/* Shimmer Effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></span>
            
            {/* Ripple Effect Background */}
            <span className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover/btn:scale-100 opacity-0 group-hover/btn:opacity-100 transition-all duration-500"></span>
            
            <span className="relative z-10 flex items-center justify-center space-x-3">
              <svg className="w-6 h-6 transform group-hover/btn:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="tracking-wide">SCAN NOW</span>
            </span>
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 text-center animate-slide-in-up">
          <div className="inline-flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 text-red-700 dark:text-red-300 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-lg">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
