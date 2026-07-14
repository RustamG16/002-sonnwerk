import { defineConfig } from 'astro/config';

// Static output (stack decision 2026-07-10): performance/SEO as a property of the stack.
export default defineConfig({
  output: 'static',
  site: 'https://sonn-werk.at',
  devToolbar: { enabled: false },
});
