import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Vite 6+ requires explicit allowed hosts for security. 
    // Setting to true allows all hosts, which is necessary for Replit's dynamic subdomains.
    allowedHosts: true, 
    hmr: {
      // Ensures Hot Module Replacement works through Replit's HTTPS proxy
      clientPort: 443,
    },
  },
});