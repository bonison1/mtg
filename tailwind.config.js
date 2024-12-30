module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // New app directory
    './styles/**/*.css',  // Corrected: added missing comma
    './components/**/*.{js,ts,jsx,tsx}', // Include components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
