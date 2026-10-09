import type { APIRoute } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import {
  getPublishedWritings,
  getSortedNotes,
  getSortedFieldNotes,
} from '../../utils/content';
import { SITE } from '../../site.config';

export async function getStaticPaths() {
  const writings = await getPublishedWritings();
  const notesList = await getSortedNotes();
  const fieldNotesList = await getSortedFieldNotes();

  const staticPages = [
    {
      slug: 'index',
      title: SITE.author,
      subtitle: `${SITE.title} — Ciência da Computação (UERJ) • Visão Computacional & Sistemas`,
      category: 'INDEX // ROOT'
    },
    {
      slug: 'about',
      title: 'Sobre — Síntese Profissional',
      subtitle: 'Histórico de engenharia, filosofia de sistemas e ecossistema de software',
      category: 'SYSTEM // PROFILE'
    },
    {
      slug: 'projects',
      title: 'Projetos & Demonstrações',
      subtitle: 'Aplicações web ativas, visão computacional na UERJ e homelab autônomo',
      category: 'PROJECTS // SHOWCASE'
    },
    {
      slug: 'writing',
      title: 'Artigos Técnicos',
      subtitle: 'Ensaios profundos sobre sistemas distribuídos, algoritmos e performance',
      category: 'WRITING // ARCHIVE'
    },
    {
      slug: 'notes',
      title: 'Digital Garden (Zettelkasten)',
      subtitle: 'Rede de notas atômicas interconectadas em desenvolvimento contínuo',
      category: 'GARDEN // ATOMIC'
    },
    {
      slug: 'field-notes',
      title: 'Notas de Campo & Fotografia Documental',
      subtitle: 'Registros técnicos de expedições, trilhas e documentação geográfica',
      category: 'FIELD // DOCUMENTARY'
    },
    {
      slug: 'now',
      title: 'Agora (Now Page)',
      subtitle: 'O que estou construindo, estudando e lendo no momento presente',
      category: 'NOW // CURRENT'
    },
    {
      slug: 'curriculum',
      title: 'Currículo Técnico (CV)',
      subtitle: 'Trajetória profissional, stack de especialidade e disponibilidade',
      category: 'CV // SPEC'
    },
    {
      slug: 'search',
      title: 'Busca Global Indexada',
      subtitle: 'Mecanismo de busca instantâneo para artigos, projetos e notas',
      category: 'SEARCH // INDEX'
    }
  ];

  const paths = [
    ...staticPages.map((page) => ({
      params: { slug: page.slug },
      props: page
    })),
    ...writings.map((item) => ({
      params: { slug: `writing/${item.id}` },
      props: {
        title: item.data.title,
        subtitle: item.data.description,
        category: `WRITING // ${(item.data.tags[0] || 'ENGINEERING').toUpperCase()}`
      }
    })),
    ...notesList.map((item) => ({
      params: { slug: `notes/${item.id}` },
      props: {
        title: item.data.title,
        subtitle: item.data.description || 'Nota atômica do Digital Garden',
        category: `GARDEN // ${item.data.stage.toUpperCase()}`
      }
    })),
    ...fieldNotesList.map((item) => ({
      params: { slug: `field-notes/${item.id}` },
      props: {
        title: item.data.title,
        subtitle: `${item.data.location} [${item.data.coordinates}]`,
        category: 'FIELD NOTES // EXPEDITION'
      }
    }))
  ];

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const {
    title = SITE.author,
    subtitle = `${SITE.title} — ${SITE.domain}`,
    category = 'SYSTEM // NODE'
  } = props as { title: string; subtitle: string; category: string };

  const cleanTitle = escapeXml(title);
  const cleanSubtitle = escapeXml(subtitle);
  const cleanCategory = escapeXml(category);

  // Split title if long
  const titleLines = wrapText(cleanTitle, 32);
  const titleSvgText = titleLines
    .slice(0, 3)
    .map((line, i) => `<text x="80" y="${260 + i * 56}" class="title">${line}</text>`)
    .join('\n');

  const subtitleY = 280 + Math.min(titleLines.length, 3) * 56;

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .meta { font-family: monospace; font-size: 20px; fill: #71717a; letter-spacing: 0.05em; }
      .category { font-family: monospace; font-size: 22px; fill: #a1a1aa; font-weight: 600; letter-spacing: 0.08em; }
      .title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 48px; font-weight: 700; fill: #fafafa; letter-spacing: -0.02em; }
      .subtitle { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 24px; fill: #a1a1aa; line-height: 1.4; }
      .foot-name { font-family: monospace; font-size: 19px; fill: #fafafa; font-weight: 600; }
      .foot-meta { font-family: monospace; font-size: 19px; fill: #71717a; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#09090b" />

  <!-- Outer Hairline Frame -->
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="#27272a" stroke-width="1.5" />

  <!-- Top Metadata Bar -->
  <text x="80" y="95" class="meta">// ${SITE.domain} — TECHNICAL EDITORIAL</text>
  <text x="1000" y="95" class="meta" text-anchor="end">[DETERMINISTIC]</text>
  <line x1="80" y1="125" x2="1120" y2="125" stroke="#27272a" stroke-width="1" />

  <!-- Section Category Indicator -->
  <text x="80" y="175" class="category">${cleanCategory}</text>

  <!-- Main Title -->
  ${titleSvgText}

  <!-- Subtitle -->
  <text x="80" y="${subtitleY}" class="subtitle">${cleanSubtitle}</text>

  <!-- Footer Hairline Divider -->
  <line x1="80" y1="485" x2="1120" y2="485" stroke="#27272a" stroke-width="1" />

  <!-- Footer Identity -->
  <text x="80" y="535" class="foot-name">${escapeXml(SITE.author.toUpperCase())}</text>
  <text x="350" y="535" class="foot-meta">|</text>
  <text x="380" y="535" class="foot-meta">${escapeXml(SITE.title.toUpperCase())}</text>
  <text x="1120" y="535" class="foot-meta" text-anchor="end">SYS_NODE_OK</text>
</svg>
`;

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 }
  });
  const pngData = resvg.render().asPng();

  return new Response(new Uint8Array(pngData), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';

  for (const word of words) {
    if ((cur + ' ' + word).trim().length <= maxLen) {
      cur = (cur + ' ' + word).trim();
    } else {
      if (cur) lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [text];
}
