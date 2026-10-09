export interface NavItem {
  href: string;
  label: string;
  code: string;
}

export interface ExternalChannel {
  href: string;
  label: string;
  id: string;
}

export const NAV_LINKS: readonly NavItem[] = [
  { href: "/", label: "Índice", code: "00" },
  { href: "/about", label: "Sobre", code: "01" },
  { href: "/projects", label: "Projetos", code: "02" },
  { href: "/writing", label: "Artigos", code: "03" },
  { href: "/notes", label: "Digital Garden", code: "04" },
  { href: "/field-notes", label: "Notas de Campo", code: "05" },
  { href: "/now", label: "Agora", code: "06" },
  { href: "/curriculum", label: "Currículo", code: "07" },
  { href: "/search", label: "Busca", code: "08" },
] as const;

/**
 * Normaliza trailing slashes e valida se a rota atual pertence ao link sem falsos positivos.
 * Evita que /notes coincida erroneamente com /notes-archive ou que /field-notes coincida com /notes.
 */
export function isRouteActive(href: string, currentPath: string): boolean {
  const cleanCurrent = currentPath.replace(/\/+$/, "") || "/";
  const cleanHref = href.replace(/\/+$/, "") || "/";

  if (cleanHref === "/") {
    return cleanCurrent === "/";
  }

  // Corresponde a rota exata ou sub-rotas (/writing/meu-post), evitando falsos positivos como /notes-archive
  return cleanCurrent === cleanHref || cleanCurrent.startsWith(`${cleanHref}/`);
}
