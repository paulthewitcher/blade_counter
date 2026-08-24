import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  // GitHub Pages project sites live under /<repo>/.
  // Locally, keep the app at /.
  base: process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/',
  plugins: [react()],
});
