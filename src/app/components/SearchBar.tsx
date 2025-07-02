import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (domain: string) => void }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  const validateDomain = (input: string) => {
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return regex.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!domain) {
      setError('Please enter a domain');
      return;
    }
    
    if (!validateDomain(domain)) {
      setError('Invalid domain format. Example: example.com');
      return;
    }
    
    onSearch(domain.trim());
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex rounded-md shadow-sm max-w-xl mx-auto">
        <div className="relative flex-grow focus-within:z-10">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="block w-full rounded-none rounded-l-md pl-4 py-4 text-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter domain (example.com)"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-4 text-lg font-medium rounded-r-md hover:bg-indigo-700 transition-colors duration-300"
        >
          Scan Domain
        </button>
      </form>
      {error && <p className="mt-2 text-center text-red-500">{error}</p>}
    </div>
  );
}