const uiConfig = require('@instasync/ui/tailwind.config.js');

export * from '@instasync/ui/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...uiConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ]
};
