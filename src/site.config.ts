/**
 * Configuração centralizada do site e dados de perfil.
 * Evita repetições e facilita sincronização de dados pessoais em todo o projeto.
 */

export const SITE = {
  // Identidade & Nome
  author: "Gabriel Pereira Monte",
  shortName: "Gabriel P. Monte",
  handle: "gabrielpmonte",
  title: "Desenvolvedor & Pesquisador",
  headline: "DESENVOLVEDOR & PESQUISADOR // VISÃO COMPUTACIONAL",
  bio: "Desenvolvedor e pesquisador com foco em visão computacional.",

  // Domínio & Hospedagem
  domain: "gabe.tec.br",
  url: "https://gabe.tec.br",

  // Contato & Redes
  email: "gabriel@hotmail.com",
  github: {
    handle: "gabrielpmonte",
    url: "https://github.com/gabrielpmonte",
  },
  linkedin: {
    handle: "gabrielpmonte",
    url: "https://linkedin.com/in/gabrielpmonte",
  },
  twitter: {
    handle: "@gabrielpmonte",
    url: "https://twitter.com/gabrielpmonte",
  },
  pgpKey: "4A9F 1B2C 8E0D 3F4A ...",

  // Localização
  location: {
    city: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    formatted: "Rio de Janeiro, RJ, Brasil",
    formattedUpper: "RIO DE JANEIRO, RJ, BRASIL",
  },

  // Formação Acadêmica & Faculdade 
  education: {
    degree: "Bacharelado em Ciência da Computação",
    institution: "Universidade do Estado do Rio de Janeiro (UERJ)",
    emphasis: "Ênfase em visão computacional.",
  },

  // SEO & Metadados Padrão
  defaultTitle: "Gabriel Pereira Monte — Desenvolvedor & Pesquisador",
  defaultDescription:
    "Website pessoal, artigos técnicos de sistemas, digital garden e notas de campo de Gabriel Pereira Monte (gabe.tec.br).",
  locale: "pt-BR",

  // Disponibilidade Profissional
  availability: {
    status: "DISPONÍVEL PARA CONTRATAÇÃO",
    level: "ESTÁGIO / JÚNIOR",
    location: "RIO DE JANEIRO OU REMOTO",
    badge: "DISPONÍVEL // ESTÁGIO OU JÚNIOR (RJ / REMOTO)",
    fullText: "DISPONÍVEL PARA CONTRATAÇÃO (ESTÁGIO / JÚNIOR) • RIO DE JANEIRO OU REMOTO",
  },

  // Fuso Horário do Host / Telemetria
  timezone: {
    iana: "America/Sao_Paulo",
    label: "BRASILIA",
  },
} as const;

export type SiteConfig = typeof SITE;
export default SITE;
