import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' (relatif) = jalan di repo dengan nama apa pun di GitHub Pages,
// tidak perlu menyesuaikan nama repository lagi.
export default defineConfig({
  plugins: [react()],
  base: './',
});
