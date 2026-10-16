import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PENTING: nilai base HARUS sama persis dengan nama repository GitHub Anda,
// diawali dan diakhiri garis miring. Contoh repo "manajemen-apar" -> '/manajemen-apar/'
export default defineConfig({
  plugins: [react()],
  base: '/manajemen-apar/',
});
