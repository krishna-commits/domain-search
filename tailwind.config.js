// Tailwind CSS Configuration
// This config disables oklch color output for compatibility with libraries that do not support it.

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  future: {
    useOkLCH: false,
  },
}; 