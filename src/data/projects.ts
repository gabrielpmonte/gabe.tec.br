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
    title: "Prato do Dia — Visão Computacional & Segmentação de Alimentos",
    category: "PESQUISA // UERJ",
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
    title: "Puzzles — Desafios Lógicos & Computacionais",
    category: "APP WEB // PRODUTO",
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
    title: "Scopio — Auditor de Métricas de Código & Quality Gates",
    category: "CLI // OPEN SOURCE",
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
    title: "Infraestrutura Homelab Híbrida (tachibana + wired)",
    category: "INFRA // HOMELAB",
    period: "2023 — PRESENTE",
    description:
      "Cluster pessoal híbrido composto por VPS em nuvem (wired) e servidores bare-metal residenciais com NixOS (tachibana e navi), interconectados via rede privada mesh Tailscale para deploy de serviços públicos e armazenamento seguro.",
    stack: ["NixOS", "Linux", "Docker", "Caddy", "Tailscale", "Bash"],
    internalUrl: "/notes/tachibana-homelab",
    badge: "PRODUÇÃO AUTÔNOMA",
    highlights: [
      "Configurações declarativas e reprodutíveis gerenciadas sob controle de versão.",
      "Túneis reversos seguros permitindo expor subdomínios públicos (*.gabe.tec.br) sem abrir portas residenciais inseguras.",
      "Operação com uptime contínuo para suporte a demos interativas e serviços locais.",
    ],
  },
  {
    title: "Website & Portal Editorial de Engenharia (gabe.tec.br)",
    category: "FRONTEND // ESTÁTICO",
    period: "2024 — PRESENTE",
    description:
      "Portal pessoal de engenharia de software e pesquisa científica. Desenvolvido para máxima fidelidade tipográfica, ausência de frameworks de estilo inflados e pontuação perfeita em Core Web Vitals.",
    stack: ["Astro", "TypeScript", "Vanilla CSS", "KaTeX", "Shiki", "Pagefind"],
    githubUrl: `${SITE.github.url}/gabe.tec.br`,
    liveUrl: SITE.url,
    badge: "100% LIGHTHOUSE",
    highlights: [
      "Zero frameworks de UI pesados no cliente; páginas servidas como HTML estático puro.",
      "Suporte a fórmulas matemáticas com KaTeX e realce de sintaxe Shiki.",
      "Otimização estrita de LCP (Largest Contentful Paint) e tipografia editorial monoespaçada.",
    ],
  },
];
