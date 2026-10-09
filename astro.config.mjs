// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import { remarkWikilinks } from './src/plugins/remark-wikilinks.mjs';
import { remarkCallouts } from './src/plugins/remark-callouts.mjs';
import { rehypeOptimizeImages } from './src/plugins/rehype-optimize-images.mjs';

import { SITE } from './src/site.config.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  output: 'static',
  trailingSlash: 'never',
  compressHTML: true,
  build: {
    format: 'file'
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/og/')
    })
  ],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      wrap: true
    },
    processor: unified({
      remarkPlugins: [
        remarkMath,
        remarkWikilinks,
        remarkCallouts
      ],
      rehypePlugins: [
        [
          rehypeKatex,
          {
            output: 'htmlAndMathml',
            strict: false
          }
        ],
        rehypeOptimizeImages
      ]
    })
  }
});
