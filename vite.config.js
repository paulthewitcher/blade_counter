import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative assets make GitHub Pages project sites work without
  // depending on the repository name or GitHub Actions environment.
  base: './',
  plugins: [react()],
});
