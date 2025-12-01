/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Reverting to standard 'tailwindcss' for stability (v3.4)
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;