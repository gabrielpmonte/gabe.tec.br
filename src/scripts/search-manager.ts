export interface SearchIndexItem {
  url: string;
  title: string;
  category: string;
  excerpt: string;
  tags?: string[];
}

interface IndexedSearchItem extends SearchIndexItem {
  _searchBlob: string;
}

interface PagefindSearchResult {
  url: string;
  excerpt: string;
  meta?: {
    title?: string;
  };
}

interface PagefindInstance {
  init: () => Promise<void>;
  search: (query: string) => Promise<{
    results: Array<{
      data: () => Promise<PagefindSearchResult>;
    }>;
  }>;
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeExcerpt(html: string): string {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const allowedTags = new Set(["MARK"]);

    function cleanNode(node: Node): Node {
      if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent || "");
      }
      if (node.nodeType === Node.ELEMENT_NODE && allowedTags.has(node.nodeName.toUpperCase())) {
        const el = document.createElement("mark");
        node.childNodes.forEach((child) => el.appendChild(cleanNode(child)));
        return el;
      }
      const fragment = document.createDocumentFragment();
      node.childNodes.forEach((child) => fragment.appendChild(cleanNode(child)));
      return fragment;
    }

    const container = document.createElement("div");
    doc.body.childNodes.forEach((child) => container.appendChild(cleanNode(child)));
    return container.innerHTML;
  } catch {
    return escapeHtml(html);
  }
}

function normalizeText(text: string): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

let pagefindInstance: PagefindInstance | null = null;
let isPagefindReady = false;
let isPagefindLoading = false;

async function loadPagefind(): Promise<boolean> {
  if (isPagefindReady) return true;
  if (isPagefindLoading) return false;

  isPagefindLoading = true;
  try {
    // Usamos URL absoluta em runtime para contornar o analisador de /public do Vite sem violar CSP
    const pagefindUrl = `${window.location.origin}/pagefind/pagefind.js`;
    const pf = (await import(/* @vite-ignore */ pagefindUrl)) as PagefindInstance;
    await pf.init();
    pagefindInstance = pf;
    isPagefindReady = true;
    return true;
  } catch (err) {
    console.info("Pagefind não disponível, utilizando índice local.", err);
    isPagefindReady = false;
    return false;
  } finally {
    isPagefindLoading = false;
  }
}

export function initSearch(): void {
  const input = document.getElementById("search-input") as HTMLInputElement | null;
  const status = document.getElementById("search-status");
  const placeholder = document.getElementById("search-placeholder");
  const resultsList = document.getElementById("search-results-list");
  const dataScript = document.getElementById("local-search-data");

  if (!input || !status || !resultsList) return;

  // Evita re-atachar listeners no mesmo elemento durante transições do Astro
  if (input.dataset.searchBound === "true") return;
  input.dataset.searchBound = "true";

  // Pré-indexa os dados locais uma única vez
  let localItems: IndexedSearchItem[] = [];
  try {
    if (dataScript?.textContent) {
      const raw: SearchIndexItem[] = JSON.parse(dataScript.textContent);
      localItems = raw.map((item) => ({
        ...item,
        _searchBlob: normalizeText(
          `${item.title} ${item.excerpt} ${item.category} ${(item.tags || []).join(" ")}`
        ),
      }));
    }
  } catch (e) {
    console.error("Erro ao carregar dados locais de busca:", e);
  }

  // Inicializa o Pagefind
  void loadPagefind().then((ready) => {
    if (!input.value.trim() && status) {
      status.textContent = ready ? "[INDEX READY]" : "[LOCAL READY]";
    }
  });

  function renderItems(items: SearchIndexItem[], query: string, isFromPagefind = false): void {
    if (!resultsList) return;

    if (!items || items.length === 0) {
      if (placeholder) {
        placeholder.style.display = "block";
        placeholder.textContent = `// NENHUM RESULTADO ENCONTRADO PARA "${query}".`;
      }
      resultsList.style.display = "none";
      resultsList.innerHTML = "";
      return;
    }

    if (placeholder) placeholder.style.display = "none";
    resultsList.style.display = "flex";

    resultsList.innerHTML = items
      .map(
        (item) => `
        <article class="result-card hairline-box">
          <header class="result-header font-mono">
            <span class="result-category">[${escapeHtml(item.category || "GERAL")}]</span>
            <a href="${escapeHtml(item.url)}" class="result-url no-underline">${escapeHtml(item.url)}</a>
          </header>
          <div class="result-body">
            <h2 class="result-title">
              <a href="${escapeHtml(item.url)}" class="no-underline">${escapeHtml(item.title)}</a>
            </h2>
            <p class="result-excerpt">${isFromPagefind ? sanitizeExcerpt(item.excerpt) : escapeHtml(item.excerpt)}</p>
            ${item.tags && item.tags.length > 0
            ? `<div class="result-tags font-mono">${item.tags
              .map((t) => `<span class="tag-badge">#${escapeHtml(t)}</span>`)
              .join(" ")}</div>`
            : ""
          }
          </div>
        </article>
      `
      )
      .join("");
  }

  function searchLocal(query: string): SearchIndexItem[] {
    const qNorm = normalizeText(query);
    const terms = qNorm.split(/\s+/).filter(Boolean);

    return localItems.filter((item) =>
      terms.every((term) => item._searchBlob.includes(term))
    );
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let activeSearchId = 0;

  function handleSearch(): void {
    const query = input?.value.trim() ?? "";

    if (!query) {
      if (placeholder) {
        placeholder.style.display = "block";
        placeholder.textContent =
          "// DIGITE QUALQUER TERMO ACIMA PARA BUSCAR NOS ARTIGOS E NOTAS.";
      }
      resultsList!.style.display = "none";
      resultsList!.innerHTML = "";
      status!.textContent = isPagefindReady ? "[INDEX READY]" : "[LOCAL READY]";
      return;
    }

    status!.textContent = "[SEARCHING...]";

    if (debounceTimer) clearTimeout(debounceTimer);

    // 200ms é uma faixa equilibrada para digitação contínua
    debounceTimer = setTimeout(async () => {
      const searchId = ++activeSearchId;

      if (isPagefindReady && pagefindInstance) {
        try {
          const pfSearch = await pagefindInstance.search(query);

          // Descarta se uma consulta mais recente já começou
          if (searchId !== activeSearchId) return;

          const loadedResults = await Promise.all(
            pfSearch.results.slice(0, 10).map((r) => r.data())
          );

          if (searchId !== activeSearchId) return;

          status!.textContent = `[${loadedResults.length} RESULTADOS]`;
          renderItems(
            loadedResults.map((r) => ({
              url: r.url,
              title: r.meta?.title || r.url,
              category: "PAGEFIND",
              excerpt: r.excerpt,
              tags: [],
            })),
            query,
            true
          );
          return;
        } catch (e) {
          console.warn("Falha no Pagefind, acionando fallback local:", e);
        }
      }

      // Executa busca local caso o Pagefind não esteja pronto ou falhe
      const localResults = searchLocal(query);
      if (searchId !== activeSearchId) return;

      status!.textContent = `[${localResults.length} RESULTADOS]`;
      renderItems(localResults, query, false);
    }, 200);
  }

  input.addEventListener("input", handleSearch);

  if (input.value.trim()) {
    handleSearch();
  }
}

// Lifecycle listeners compatíveis com Astro
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearch);
} else {
  initSearch();
}

document.addEventListener("astro:page-load", initSearch);
