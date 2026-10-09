export interface InlineButtonBinding {
  selector: string;
  paramKey: string;
  valueAttr: string;
}

export interface FilterManagerConfig {
  /** Root container selector to scope this filter manager and avoid cross-page leaks */
  rootSelector?: string;
  /** Selector for top filter buttons */
  topButtonSelector?: string;
  /** Attribute name storing button filter value (default: 'data-value' or 'data-tag') */
  buttonValueAttr?: string;
  /** Attribute name storing button filter key (e.g. 'data-param') */
  buttonParamKeyAttr?: string;
  /** Default single param key if buttonParamKeyAttr is not used */
  defaultParamKey?: string;

  /** Multiple inline button bindings (e.g. stage buttons + tag buttons) */
  inlineBindings?: InlineButtonBinding[];

  /** Legacy single inline button selector */
  inlineButtonSelector?: string;
  inlineButtonValueAttr?: string;
  inlineButtonParamKey?: string;

  /** Selector for items to filter */
  itemSelector: string;

  /** Matcher function returning true if item satisfies active filters */
  itemMatcher: (item: HTMLElement, activeFilters: Record<string, string | null>) => boolean;

  /** Elements for status banner and empty states */
  bannerId?: string;
  bannerCountId?: string;
  bannerLabelId?: string;
  formatBannerLabel?: (activeFilters: Record<string, string | null>) => string;
  clearBtnId?: string;

  emptyStateId?: string;
  listContainerId?: string;
}

export function setupFilterManager(config: FilterManagerConfig): void {
  const {
    rootSelector,
    topButtonSelector = '.tag-filter-btn',
    buttonValueAttr = 'data-value',
    buttonParamKeyAttr,
    defaultParamKey = 'tag',
    inlineBindings,
    inlineButtonSelector,
    inlineButtonValueAttr = 'data-tag',
    inlineButtonParamKey = 'tag',
    itemSelector,
    itemMatcher,
    bannerId,
    bannerCountId,
    bannerLabelId,
    formatBannerLabel,
    clearBtnId,
    emptyStateId,
    listContainerId
  } = config;

  // Build list of inline bindings
  const allInlineBindings: InlineButtonBinding[] = inlineBindings
    ? [...inlineBindings]
    : [];

  if (inlineButtonSelector) {
    allInlineBindings.push({
      selector: inlineButtonSelector,
      paramKey: inlineButtonParamKey,
      valueAttr: inlineButtonValueAttr
    });
  }

  let pageController: AbortController | null = null;

  function init(): void {
    // 1. Verify if the current page contains the root element for this filter instance
    const rootElement = rootSelector
      ? document.querySelector<HTMLElement>(rootSelector)
      : document.body;

    if (!rootElement) {
      if (pageController) {
        pageController.abort();
        pageController = null;
      }
      return;
    }
    const root: HTMLElement = rootElement;

    // 2. Abort prior listeners to prevent duplicate handlers across SPA navigation
    if (pageController) {
      pageController.abort();
    }
    pageController = new AbortController();
    const signal = pageController.signal;

    // 3. Query elements strictly within root container
    const topButtons = root.querySelectorAll<HTMLButtonElement>(topButtonSelector);
    const items = root.querySelectorAll<HTMLElement>(itemSelector);
    const banner = bannerId ? root.querySelector<HTMLElement>(`#${bannerId}`) || document.getElementById(bannerId) : null;
    const bannerCount = bannerCountId ? root.querySelector<HTMLElement>(`#${bannerCountId}`) || document.getElementById(bannerCountId) : null;
    const bannerLabel = bannerLabelId ? root.querySelector<HTMLElement>(`#${bannerLabelId}`) || document.getElementById(bannerLabelId) : null;
    const clearBtn = clearBtnId ? root.querySelector<HTMLButtonElement>(`#${clearBtnId}`) || document.getElementById(clearBtnId) : null;
    const emptyState = emptyStateId ? root.querySelector<HTMLElement>(`#${emptyStateId}`) || document.getElementById(emptyStateId) : null;
    const listContainer = listContainerId ? root.querySelector<HTMLElement>(`#${listContainerId}`) || document.getElementById(listContainerId) : null;

    if (items.length === 0 && topButtons.length === 0) return;

    function getActiveFiltersFromUrl(): Record<string, string | null> {
      const params = new URLSearchParams(window.location.search);
      const filters: Record<string, string | null> = {};

      for (const [key, value] of params.entries()) {
        filters[key] = value || null;
      }
      return filters;
    }

    function setFiltersInUrl(filters: Record<string, string | null>): void {
      const url = new URL(window.location.href);

      for (const [key, val] of Object.entries(filters)) {
        if (val && val !== 'all') {
          url.searchParams.set(key, val);
        } else {
          url.searchParams.delete(key);
        }
      }

      window.history.replaceState(null, '', url.toString());
    }

    function applyFilters(filters: Record<string, string | null>, updateUrl = true): void {
      if (updateUrl) {
        setFiltersInUrl(filters);
      }

      // Update top buttons active classes
      topButtons.forEach((btn) => {
        const paramKey = (buttonParamKeyAttr ? btn.getAttribute(buttonParamKeyAttr) : null) || defaultParamKey;
        const btnVal = btn.getAttribute(buttonValueAttr) || btn.getAttribute('data-tag') || btn.getAttribute('data-stage');
        const activeVal = filters[paramKey] ?? null;

        const isActive = (!activeVal && btnVal === 'all') || (activeVal === btnVal);
        btn.classList.toggle('is-active', isActive);
      });

      // Update inline buttons active classes across all bindings
      allInlineBindings.forEach(({ selector, paramKey, valueAttr }) => {
        const btns = root.querySelectorAll<HTMLButtonElement>(selector);
        const activeVal = filters[paramKey] ?? null;

        btns.forEach((btn) => {
          const btnVal = btn.getAttribute(valueAttr);
          btn.classList.toggle('is-active', Boolean(btnVal && activeVal && btnVal === activeVal));
        });
      });

      // Filter items using native HTML5 hidden attribute and inline display fallback
      let visibleCount = 0;
      items.forEach((item) => {
        const matches = itemMatcher(item, filters);
        item.hidden = !matches;
        if (matches) {
          item.style.removeProperty('display');
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      // Check if any filter is active
      const hasActiveFilters = Object.values(filters).some((v) => Boolean(v && v !== 'all'));

      // Update Banner
      if (banner) {
        if (hasActiveFilters) {
          banner.style.display = 'flex';
          if (bannerCount) bannerCount.textContent = String(visibleCount);
          if (bannerLabel && formatBannerLabel) {
            bannerLabel.textContent = formatBannerLabel(filters);
          }
        } else {
          banner.style.display = 'none';
        }
      }

      // Update Empty State
      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.style.display = 'block';
          if (listContainer) listContainer.style.display = 'none';
        } else {
          emptyState.style.display = 'none';
          if (listContainer) listContainer.style.display = '';
        }
      }
    }

    // Bind Top Buttons with abort signal
    topButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const paramKey = (buttonParamKeyAttr ? btn.getAttribute(buttonParamKeyAttr) : null) || defaultParamKey;
        const btnVal = btn.getAttribute(buttonValueAttr) || btn.getAttribute('data-tag') || btn.getAttribute('data-stage');
        const currentFilters = getActiveFiltersFromUrl();
        const currentVal = currentFilters[paramKey] ?? null;

        const nextVal = (btnVal === currentVal || btnVal === 'all') ? null : btnVal;
        currentFilters[paramKey] = nextVal;
        applyFilters(currentFilters);
      }, { signal });
    });

    // Bind Inline Buttons across all bindings with abort signal
    allInlineBindings.forEach(({ selector, paramKey, valueAttr }) => {
      const btns = root.querySelectorAll<HTMLButtonElement>(selector);

      btns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const btnVal = btn.getAttribute(valueAttr);
          const currentFilters = getActiveFiltersFromUrl();
          const currentVal = currentFilters[paramKey] ?? null;

          const nextVal = (btnVal === currentVal) ? null : btnVal;
          currentFilters[paramKey] = nextVal;
          applyFilters(currentFilters);
        }, { signal });
      });
    });

    // Bind Clear Button with abort signal
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const cleared: Record<string, string | null> = {};
        const current = getActiveFiltersFromUrl();
        for (const k of Object.keys(current)) {
          cleared[k] = null;
        }
        applyFilters(cleared);
      }, { signal });
    }

    // Bind Escape Key with abort signal
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        const current = getActiveFiltersFromUrl();
        const hasActive = Object.values(current).some(Boolean);
        if (hasActive) {
          const cleared: Record<string, string | null> = {};
          for (const k of Object.keys(current)) {
            cleared[k] = null;
          }
          applyFilters(cleared);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown, { signal });

    // Initial check from URL
    applyFilters(getActiveFiltersFromUrl(), false);
  }

  // Run on initial script execution if DOM is ready, or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle Astro View Transitions
  document.addEventListener('astro:page-load', init);

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    init();
  });

  // Cleanup on Astro before-swap
  document.addEventListener('astro:before-swap', () => {
    pageController?.abort();
    pageController = null;
  });
}
