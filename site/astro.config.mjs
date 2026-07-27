import { defineConfig } from 'astro/config';

// GitHub Pages project URL needs a base path; Netlify / custom domain stay at root.
const githubPages = process.env.GITHUB_PAGES === 'true';

// Static output (stack decision 2026-07-10): performance/SEO as a property of the stack.
export default defineConfig({
  output: 'static',
  site: githubPages ? 'https://rustamg16.github.io' : 'https://sonn-werk.at',
  base: githubPages ? '/002-sonnwerk' : '/',
  devToolbar: { enabled: false },
});
