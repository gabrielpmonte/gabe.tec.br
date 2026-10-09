import { SITE } from "../site.config";

export interface Project {
  title: string;
  category: string;
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
    title: "Puzzles — Desafios Lógicos & Computacionais",
    category: "APLICAÇÃO INTERATIVA // PRODUTO AO VIVO",
    period: "2024 — PRESENTE",
    description:
      "Plataforma interativa de puzzles lógicos e problemas computacionais focada em resolução de problemas algorítmicos. Totalmente auto-hospedada em infraestrutura própria sob o domínio gabe.tec.br com tempo de resposta instantâneo.",
    stack: ["Web Standards", "TypeScript", "Docker", "Caddy", "Tailscale"],
    liveUrl: "https://puzzles.gabe.tec.br",
    badge: "AO VIVO NO SUBDOMÍNIO",
    highlights: [
      "Interface limpa e focada em densidade de raciocínio lógico sem distrações.",
      "Hospedada diretamente na infraestrutura autônoma (nó tachibana / wired) com certificado SSL automático via Caddy.",
      "Alta performance com zero tracking e carregamento leve para dispositivos móveis e desktop.",
    ],
  },
  {
    title: "Pipeline de Visão Computacional & Processamento de Imagens",
    category: "PESQUISA APLICADA // UERJ",
    period: "2023 — PRESENTE",
    description:
      "[PREENCHER: Pipeline experimental para extração de atributos visuais, filtros morfológicos e detecção de padrões de interesse desenvolvido na Universidade do Estado do Rio de Janeiro].",
    stack: ["Python", "OpenCV", "PyTorch", "NumPy", "Scikit-Learn"],
    githubUrl: `${SITE.github.url}/[repo-visao]`,
    badge: "PESQUISA ACADÊMICA",
    highlights: [
      "[PREENCHER: Pré-processamento e equalização de histograma com filtros de convolução customizados].",
      "[PREENCHER: Avaliação de métricas de acurácia, precisão e velocidade de inferência (FPS)].",
      "Código documentado e estruturado para reprodução científica de experimentos.",
    ],
  },
  {
    title: "Infraestrutura Homelab Híbrida (tachibana + wired)",
    category: "INFRAESTRUTURA // DEVOPS & SYSADMIN",
    period: "2023 — PRESENTE",
    description:
      "Cluster pessoal híbrido composto por VPS em nuvem (wired) e servidores bare-metal residenciais com NixOS (tachibana e navi), interconectados via rede privada mesh Tailscale para deploy de serviços públicos e armazenamento seguro.",
    stack: ["NixOS", "Linux", "Docker", "Caddy", "Tailscale", "Bash"],
    internalUrl: "/field-notes/tachibana-homelab",
    badge: "PRODUÇÃO AUTÔNOMA",
    highlights: [
      "Configurações declarativas e reprodutíveis gerenciadas sob controle de versão.",
      "Túneis reversos seguros permitindo expor subdomínios públicos (*.gabe.tec.br) sem abrir portas residenciais inseguras.",
      "Operação com uptime contínuo para suporte a demos interativas e serviços locais.",
    ],
  },
  {
    title: "Website & Portal Editorial de Engenharia (gabe.tec.br)",
    category: "ENGENHARIA FRONTEND // ESTÁTICO",
    period: "2024 — PRESENTE",
    description:
      "Portal pessoal de engenharia de software e pesquisa científica. Desenvolvido para máxima fidelidade tipográfica, ausência de frameworks de estilo inflados e pontuação perfeita em Core Web Vitals.",
    stack: ["Astro", "TypeScript", "Vanilla CSS", "KaTeX", "Shiki"],
    githubUrl: `${SITE.github.url}/website`,
    liveUrl: SITE.url,
    badge: "100% LIGHTHOUSE",
    highlights: [
      "Zero frameworks de UI pesados no cliente; páginas servidas como HTML estático puro.",
      "Suporte a fórmulas matemáticas com KaTeX e realce de sintaxe Shiki.",
      "Otimização estrita de LCP (Largest Contentful Paint) e tipografia editorial monoespaçada.",
    ],
  },
  {
    title: "[PREENCHER: Próximo Projeto / Ex: API em Go ou Ferramenta CLI]",
    category: "[PREENCHER CATEGORIA]",
    period: "2024",
    description:
      "[PREENCHER: Descreva aqui um trabalho de disciplina da UERJ, uma ferramenta de linha de comando que você construiu ou uma biblioteca que gostaria de destacar].",
    stack: ["C++ / Go / Rust", "Linux CLI", "Git"],
    githubUrl: `${SITE.github.url}`,
    badge: "EM ANDAMENTO",
    highlights: [
      "[PREENCHER: Destaque técnico ou algoritmo implementado].",
      "[PREENCHER: Desempenho ou problema prático resolvido].",
    ],
  },
];
