import { SITE } from "../site.config";

export type ProjectGroup = "apps" | "research" | "infra";

export interface Project {
  title: string;
  category: string;
  group: ProjectGroup;
  period: string;
  description: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
  internalUrl?: string;
  badge?: string;
  highlights: string[];
}

export const PROJECTS: Project[] = [
  {
    title: "Prato do Dia — Visão Computacional & Segmentação de Alimentos",
    category: "PESQUISA // UERJ",
    group: "research",
    period: "2024 — PRESENTE",
    description:
      "Projeto de Iniciação Científica desenvolvido na Universidade do Estado do Rio de Janeiro (UERJ). Investiga e implementa um pipeline de visão computacional leve para detecção e segmentação de instâncias de alimentos em fotos de refeições para identificação e estimativa de porções. Combina YOLO11 para detecção de caixas delimitadoras e SAM 2.1 (Segment Anything Model 2 - Hiera Tiny) via ONNX Runtime CPU, conectado a uma API em FastAPI e app Flutter.",
    stack: [
      "Python 3.12",
      "YOLO11",
      "SAM 2.1",
      "ONNX Runtime",
      "FastAPI",
      "OpenCV",
      "Flutter",
      "SQLite",
    ],
    githubUrl: "https://github.com/uerj-prato-do-dia",
    badge: "INICIAÇÃO CIENTÍFICA (UERJ)",
    highlights: [
      "Pipeline experimental acoplando YOLO11 ONNX (detector) e SAM 2.1 Hiera Tiny ONNX (segmentador guiado por prompt) para extração estável de máscaras poligonais diretamente em CPU.",
      "Extração de atributos visuais por instância (cor, textura, forma, área e posicionamento espacial) e validação quantitativa via IoU (Intersection over Union) e Dice score.",
      "Arquitetura modular dividida entre pacote de inferência de ML, backend assíncrono em FastAPI com persistência SQLite e aplicativo mobile em Flutter.",
    ],
  },
  {
    title: "Roleta de Decisões (Decision Wheel)",
    category: "APP WEB // MULTIPLAYER",
    group: "apps",
    period: "2026 — PRESENTE",
    description:
      "Aplicação web para sorteios e tomadas de decisão em tempo real com salas sincronizadas via WebSockets, física de roleta fluida e baixa latência.",
    stack: ["Go", "Svelte 5", "WebSockets", "Podman", "Caddy"],
    liveUrl: "https://roleta.gabe.tec.br",
    badge: "AO VIVO",
    highlights: [
      "Backend em Go servindo estado compartilhado em tempo real via WebSockets.",
      "Frontend reativo em Svelte 5 com animações determinísticas e suporte a salas.",
      "Auto-hospedado no servidor Tachibana via Podman Quadlet e proxy reverso Caddy.",
    ],
  },
  {
    title: "Letterboxd Wall — Gerador de Mural de Filmes",
    category: "APP WEB // CINEMA",
    group: "apps",
    period: "2026 — PRESENTE",
    description:
      "API REST em Go para geração dinâmica de colagens de filmes via parsing resiliente de RSS, download concorrente de cartazes, cache em memória com TTL e streaming direto em JPEG. Inclui proxy de imagens com CORS e frontend interativo com renderização em Canvas via Svelte 5 (TypeScript).",
    stack: ["Golang", "TypeScript", "Svelte 5", "REST API", "Podman"],
    liveUrl: "https://boxd.gabe.tec.br",
    badge: "AO VIVO",
    highlights: [
      "Parsing resiliente de RSS em Go com download concorrente de cartazes e cache em memória com TTL.",
      "Streaming direto em JPEG e proxy de imagens com CORS.",
      "Frontend interativo com renderização em Canvas via Svelte 5 (TypeScript).",
    ],
  },
  {
    title: "Jogo da Forca (Hangman LiveView)",
    category: "JOGO // MULTIPLAYER",
    group: "apps",
    period: "2026 — PRESENTE",
    description:
      "Jogo da forca multijogador em tempo real construído com Elixir e Phoenix LiveView, sincronizando palpites, placar e estado da partida sem JavaScript pesado.",
    stack: ["Elixir", "Phoenix LiveView", "BEAM", "Podman"],
    liveUrl: "https://forca.gabe.tec.br",
    badge: "AO VIVO",
    highlights: [
      "Estado das salas gerenciado nativamente por processos leves na BEAM VM.",
      "Atualizações reativas em tempo real via WebSockets do Phoenix LiveView.",
      "Interface direta e responsiva para partidas rápidas entre amigos.",
    ],
  },
  {
    title: "O Enigma Diário (Puzzles)",
    category: "JOGO // DIÁRIO",
    group: "apps",
    period: "out. de 2026 — PRESENTE",
    description:
      "Interface web reativa de desafios lógicos e quebra-cabeças diários em SvelteKit (TypeScript) empacotada em container, com persistência em SQLite.",
    stack: ["TypeScript", "SvelteKit", "SQLite", "Podman", "Caddy"],
    liveUrl: "https://puzzles.gabe.tec.br",
    badge: "AO VIVO",
    highlights: [
      "Interface web reativa em SvelteKit (TypeScript) empacotada em container.",
      "Persistência em SQLite com geração programada de novos desafios.",
      "Carregamento leve e zero tracking para dispositivos móveis e desktop.",
    ],
  },
  {
    title: "Wrong Web — Agregador Minimalista de Links & Notícias",
    category: "APP WEB // LEITURA",
    group: "apps",
    period: "2026 — PRESENTE",
    description:
      "Agregador brutalista de links técnicos, notícias e discussões sem algoritmos de recomendação nem poluição visual.",
    stack: ["Web", "Podman", "Caddy", "Cathode CSS"],
    liveUrl: "https://news.gabe.tec.br",
    badge: "AO VIVO",
    highlights: [
      "Leitura direta em texto estruturado com foco em densidade informacional.",
      "Estética industrial alinhada ao design system Cathode CSS.",
    ],
  },
  {
    title: "Airstation — Rádio Web Online Sincronizada",
    category: "MÍDIA // ÁUDIO 24/7",
    group: "apps",
    period: "2026 — PRESENTE",
    description:
      "Estação de rádio online autônoma com programação por blocos horários, vinhetas automáticas, lookahead pre-encoding via FFmpeg e streaming HLS sincronizado.",
    stack: ["Go", "FFmpeg", "HLS", "SSE", "Podman"],
    liveUrl: "https://radio.gabe.tec.br",
    badge: "NO AR 24/7",
    highlights: [
      "Transmissão contínua de áudio sincronizada entre todos os ouvintes via HLS.",
      "Ducking automático de vinhetas e anúncios de hora certa nos blocos musicais.",
      "Eventos em tempo real de faixa atual via Server-Sent Events (SSE).",
    ],
  },
  {
    title: "Cathode CSS — Design System Industrial",
    category: "FRONTEND // DESIGN SYSTEM",
    group: "infra",
    period: "2026 — PRESENTE",
    description:
      "Biblioteca CSS minimalista e brutalista construída sobre tokens OKLCH perceptualmente uniformes, bordas ortogonais de 1px, zero border-radius e alto contraste WCAG AA.",
    stack: ["CSS Layers", "OKLCH", "Design Tokens", "HTML5"],
    liveUrl: "https://css.gabe.tec.br",
    badge: "DESIGN SYSTEM",
    highlights: [
      "Paleta semântica em OKLCH projetada para prevenir fadiga visual (anti-halation).",
      "Componentes de telemetria, tabelas densas e tipografia técnica em ~16 KB minificado.",
    ],
  },
  {
    title: "Scopio — Auditor de Métricas de Código & Quality Gates",
    category: "CLI // OPEN SOURCE",
    group: "research",
    period: "2024",
    description:
      "Ferramenta CLI e auditor de engenharia de software distribuída publicamente no PyPI. Analisa complexidade ciclomática (CCN), linhas lógicas de código (NLOC) e histórico em SQLite, fornecendo quality gates automatizados e detecção de regressões para pipelines de CI.",
    stack: ["Python", "CLI", "SQLite", "PyPI", "CI/CD", "uv"],
    githubUrl: `${SITE.github.url}/scopio`,
    liveUrl: "https://pypi.org/project/scopio/",
    badge: "PACOTE NO PyPI",
    highlights: [
      "Distribuído no repositório oficial Python PyPI (`pip install scopio`) com testes automatizados e integração contínua via GitHub Actions.",
      "Histórico incremental de métricas em banco SQLite por commit/branch, gerando diffs comparativos com baseline.",
      "Identificação de hotspots críticos de manutenção (Complexidade x Churn) e suporte a regras de falha em CI (--fail-on-regression).",
    ],
  },
  {
    title: "Infraestrutura Homelab Tachibana (Quadlets + Caddy + Tailscale)",
    category: "INFRA // HOMELAB",
    group: "infra",
    period: "2023 — PRESENTE",
    description:
      "Infraestrutura declarativa rootless em Fedora com Podman Quadlets gerenciados via systemd, túneis reversos via Wired Gateway, proxy Caddy, observabilidade com Beszel/Gatus/ntfy e backups incrementais Restic.",
    stack: ["Podman Quadlets", "Linux", "Caddy", "Tailscale", "Restic", "Astro"],
    internalUrl: "/notes/tachibana-homelab",
    liveUrl: "https://docs.gabe.tec.br",
    badge: "PRODUÇÃO AUTÔNOMA",
    highlights: [
      "Mais de 40 serviços declarativos em Podman Quadlets com AutoUpdate=registry.",
      "Portal completo de documentação técnica e arquitetura em docs.gabe.tec.br.",
      "Backups atômicos diários de SQLite e alertas em tempo real via ntfy.",
    ],
  },
  {
    title: "Website & Portal Editorial de Engenharia (gabe.tec.br)",
    category: "FRONTEND // ESTÁTICO",
    group: "infra",
    period: "2024 — PRESENTE",
    description:
      "Portal pessoal de engenharia de software, pesquisa científica e vitrine de aplicações autorais. Desenvolvido para máxima fidelidade tipográfica com tokens Cathode CSS e HTML estático puro.",
    stack: ["Astro", "TypeScript", "Cathode CSS", "KaTeX", "Shiki", "Pagefind"],
    githubUrl: `${SITE.github.url}/gabe.tec.br`,
    liveUrl: SITE.url,
    badge: "100% LIGHTHOUSE",
    highlights: [
      "Zero frameworks de UI pesados no cliente; páginas servidas como HTML estático puro.",
      "Suporte a fórmulas matemáticas com KaTeX, realce Shiki e busca local via Pagefind.",
      "Vitrine interativa unificada de projetos autorais com filtro por categoria e busca.",
    ],
  },
];
