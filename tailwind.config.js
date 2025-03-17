// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'nhs-blue': '#005EB8',
        'nhs-dark-blue': '#003087',
        'nhs-light-blue': '#E8F2F9',
      },
    },
  },
  plugins: [],
};
