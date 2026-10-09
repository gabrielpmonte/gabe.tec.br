import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedWritings } from '../utils/content';
import { SITE } from '../site.config';

export const GET: APIRoute = async (context) => {
  const writingPosts = await getPublishedWritings();

  return rss({
    title: `${SITE.author} — Ensaios Técnicos & Sistemas`,
    description: `Artigos técnicos sobre sistemas distribuídos, alocadores de memória, concorrência e algoritmos de alto desempenho por ${SITE.author} (${SITE.domain}).`,
    site: context.site ?? SITE.url,
    items: writingPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/writing/${post.id}/`,
      categories: post.data.tags
    })),
    customData: `<language>${SITE.locale}</language><atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2000/svg" />`
  });
};
