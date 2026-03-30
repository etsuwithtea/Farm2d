import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Farm2d/', // ตั้งค่า url base ให้ตรงกับชื่อ repository
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'ES2020',
  },
});
