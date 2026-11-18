/**
 * <pokestats-draft> — Self-contained 6-round Pokémon Gen 1 draft game Web Component.
 * Cathode CSS aesthetic, compact 3x2 horizontal cards, 6-segment bar, zero layout shift.
 */

const STATS = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "ATK" },
  { key: "defense", label: "DEF" },
  { key: "special_attack", label: "SPA" },
  { key: "special_defense", label: "SPD" },
  { key: "speed", label: "SPE" },
];

const MODES = {
  arceus: {
    id: "arceus",
    targetTotal: 720,
    individualTarget: 120,
    winCheck: (sum) => sum >= 720,
    isBetter: (a, b) => a > b,
    isGoodDelta: (delta) => delta >= 0,
    hintLabel: { pt: "Meta: 120/slot", en: "Target: 120/stat" },
    formatVerdict: (sum, lang) =>
      lang === "en"
        ? sum >= 720
          ? `Win (+${sum - 720} pts margin)`
          : `Loss (${720 - sum} pts short)`
        : sum >= 720
          ? `Vitória (+${sum - 720} pts de folga)`
          : `Derrota — faltaram ${720 - sum} pts para a meta.`,
  },
  magikarp: {
    id: "magikarp",
    targetTotal: 200,
    individualTarget: 33,
    winCheck: (sum) => sum <= 200,
    isBetter: (a, b) => a < b,
    isGoodDelta: (delta) => delta <= 0,
    hintLabel: { pt: "Meta: 33/slot", en: "Target: 33/stat" },
    formatVerdict: (sum, lang) =>
      lang === "en"
        ? sum <= 200
          ? `Win (${200 - sum} pts below target)`
          : `Loss (${sum - 200} pts over target)`
        : sum <= 200
          ? `Vitória (${200 - sum} pts abaixo da meta)`
          : `Derrota — passou ${sum - 200} pts da meta.`,
  },
};

const I18N = {
  pt: {
    loading: "Carregando Pokédex Gen 1...",
    loadError: (msg) => `Não foi possível carregar os dados (${msg}).`,
    title: "Desafio PokéStats // Gen 1",
    subtitle: "1 atributo por rodada. Escolhas definitivas.",
    hintsToggle: "Dicas visuais",
    lockTitle: "Slot travado",
    lockCue: "TRAVAR",
    idealBadge: "IDEAL",
    finished: "Finalizado",
    round: (r) => `Rodada ${r}/6`,
    lockedSum: (sum, total, hint) => `Soma travada: <strong>${sum}</strong> / ${total} pts ${hint}`,
    progressAria: "Progresso das 6 rodadas",
    playAgain: "Jogar novamente",
    restart: "Reiniciar",
    autoGreedy: "Auto-completar (Guloso)",
    sessionStats: (w, g) => `Sessão: ${w} vitória(s) em ${g} partida(s)`,
  },
  en: {
    loading: "Loading Gen 1 Pokédex...",
    loadError: (msg) => `Failed to load data (${msg}).`,
    title: "PokéStats Challenge // Gen 1",
    subtitle: "1 stat per round. Picks are final.",
    hintsToggle: "Visual hints",
    lockTitle: "Locked stat",
    lockCue: "LOCK",
    idealBadge: "BEST",
    finished: "Finished",
    round: (r) => `Round ${r}/6`,
    lockedSum: (sum, total, hint) => `Locked sum: <strong>${sum}</strong> / ${total} pts ${hint}`,
    progressAria: "6-round progress",
    playAgain: "Play again",
    restart: "Restart",
    autoGreedy: "Auto-complete (Greedy)",
    sessionStats: (w, g) => `Session: ${w} win(s) in ${g} game(s)`,
  },
};

const LOCK_ICON_SVG = `<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 7V5a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1zm2-2v2h4V5a2 2 0 1 0-4 0z"/></svg>`;

const TEMPLATE_STYLES = `
  :host {
    display: block;
    margin: 1.25rem 0;
    --ps-bg: var(--bg, #ffffff);
    --ps-surface: var(--surface, #f8f8f9);
    --ps-surface-active: var(--surface-active, #f1f1f4);
    --ps-border: var(--border, #e4e4e7);
    --ps-border-strong: var(--border-strong, #a1a1aa);
    --ps-text: var(--text, #09090b);
    --ps-muted: var(--text-muted, #3f3f46);
    --ps-dim: var(--text-dim, #52525b);
    --ps-blue: var(--tc-blue, #1d4ed8);
    --ps-emerald: var(--tc-emerald, #047857);
    --ps-amber: var(--tc-amber, #b45309);
    --ps-danger: #dc2626;
    --ps-emerald-bg: color-mix(in srgb, var(--ps-emerald) 12%, transparent);
    --ps-danger-bg: color-mix(in srgb, var(--ps-danger) 12%, transparent);
    --ps-amber-bg: color-mix(in srgb, var(--ps-amber) 14%, transparent);
    font-family: var(--font-sans, "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
    font-variant-numeric: tabular-nums;
    color: var(--ps-text);
  }

  @media (prefers-color-scheme: dark) {
    :host(:not([data-force-theme="light"])) {
      --ps-bg: var(--bg, oklch(13% 0.008 250));
      --ps-surface: var(--surface, oklch(16.5% 0.008 250));
      --ps-surface-active: var(--surface-active, oklch(20% 0.012 250));
      --ps-border: var(--border, color-mix(in oklch, oklch(93% 0.005 90) 12%, transparent));
      --ps-border-strong: var(--border-strong, color-mix(in oklch, oklch(93% 0.005 90) 24%, transparent));
      --ps-text: var(--text, oklch(93% 0.005 90));
      --ps-muted: var(--text-muted, oklch(80% 0.012 245));
      --ps-dim: var(--text-dim, oklch(70% 0.012 250));
      --ps-blue: var(--tc-blue, oklch(71.5% 0.145 255));
      --ps-emerald: var(--tc-emerald, oklch(77.5% 0.145 162));
      --ps-amber: var(--tc-amber, oklch(76.5% 0.145 75));
      --ps-danger: oklch(68% 0.19 25);
    }
  }

  :host-context(html.dark),
  :host-context([data-theme="dark"]),
  :host-context(.dark) {
    --ps-bg: var(--bg, oklch(13% 0.008 250));
    --ps-surface: var(--surface, oklch(16.5% 0.008 250));
    --ps-surface-active: var(--surface-active, oklch(20% 0.012 250));
    --ps-border: var(--border, color-mix(in oklch, oklch(93% 0.005 90) 12%, transparent));
    --ps-border-strong: var(--border-strong, color-mix(in oklch, oklch(93% 0.005 90) 24%, transparent));
    --ps-text: var(--text, oklch(93% 0.005 90));
    --ps-muted: var(--text-muted, oklch(80% 0.012 245));
    --ps-dim: var(--text-dim, oklch(70% 0.012 250));
    --ps-blue: var(--tc-blue, oklch(71.5% 0.145 255));
    --ps-emerald: var(--tc-emerald, oklch(77.5% 0.145 162));
    --ps-amber: var(--tc-amber, oklch(76.5% 0.145 75));
    --ps-danger: oklch(68% 0.19 25);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    border-radius: 0;
    box-shadow: none;
  }

  .widget {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--ps-surface);
    border: 1px solid var(--ps-border);
    padding: 16px 20px;
  }

  /* Merged top bar: title left, game mode + display preference right */
  .header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--ps-border);
  }

  .title-block h3 {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .title-block p {
    margin: 2px 0 0;
    font-size: 0.8rem;
    color: var(--ps-dim);
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .mode-group {
    display: inline-flex;
    background: var(--ps-bg);
    border: 1px solid var(--ps-border);
  }

  .mode-btn {
    border: none;
    background: transparent;
    color: var(--ps-dim);
    font-family: var(--font-mono, "Geist Mono", ui-monospace, monospace);
    font-size: 0.74rem;
    font-weight: 600;
    padding: 6px 11px;
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease;
  }

  .mode-btn + .mode-btn {
    border-left: 1px solid var(--ps-border);
  }

  .mode-btn:hover:not(.active) {
    background: var(--ps-surface-active);
    color: var(--ps-text);
  }

  .mode-btn.active {
    background: var(--ps-text);
    color: var(--ps-bg);
  }

  .toggle-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono, "Geist Mono", ui-monospace, monospace);
    font-size: 0.73rem;
    color: var(--ps-muted);
    cursor: pointer;
    user-select: none;
    padding: 5px 9px;
    border: 1px solid var(--ps-border);
    background: var(--ps-bg);
  }

  .toggle-label:hover {
    border-color: var(--ps-border-strong);
  }

  .toggle-label input {
    accent-color: var(--ps-blue);
    margin: 0;
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .status-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono, "Geist Mono", ui-monospace, monospace);
    font-size: 0.78rem;
    color: var(--ps-muted);
  }

  .status-bar strong {
    color: var(--ps-text);
  }

  .verdict.win {
    color: var(--ps-emerald);
    font-weight: 700;
  }

  .verdict.lose {
    color: var(--ps-danger);
    font-weight: 700;
  }

  /* 6 discrete segments reflecting 6 -> 5 -> 4 -> 3 -> 2 -> 1 rounds */
  .segments {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 5px;
  }

  .segment {
    height: 7px;
    background: var(--ps-bg);
    border: 1px solid var(--ps-border);
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .segment.filled {
    background: var(--ps-blue);
    border-color: var(--ps-blue);
  }

  .segment.filled.win {
    background: var(--ps-emerald);
    border-color: var(--ps-emerald);
  }

  .segment.filled.lose {
    background: var(--ps-danger);
    border-color: var(--ps-danger);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  @media (max-width: 660px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    background: var(--ps-bg);
    border: 1px solid var(--ps-border);
    transition: border-color 0.12s ease, background-color 0.12s ease;
  }

  .card.selectable {
    cursor: pointer;
  }

  .card.selectable:hover,
  .card.selectable:focus-visible {
    outline: none;
    background: var(--ps-surface-active);
    border-color: var(--ps-blue);
  }

  .card.locked {
    background: repeating-linear-gradient(
      135deg,
      var(--ps-surface),
      var(--ps-surface) 6px,
      var(--ps-bg) 6px,
      var(--ps-bg) 12px
    );
    border-style: dashed;
    border-color: var(--ps-border-strong);
  }

  .card.hint-good {
    border-color: var(--ps-emerald);
  }

  .card.hint-bad {
    border-color: var(--ps-danger);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    border-bottom: 1px solid var(--ps-border);
    background: var(--ps-surface);
    font-family: var(--font-mono, "Geist Mono", ui-monospace, monospace);
    text-transform: uppercase;
    min-height: 25px;
  }

  .stat-slot {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .key-hint {
    font-size: 0.66rem;
    color: var(--ps-dim);
    border: 1px solid var(--ps-border);
    padding: 0 4px;
    line-height: 1.3;
  }

  .stat-tag {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--ps-text);
  }

  .top-right {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .hover-cue {
    opacity: 0;
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--ps-blue);
    transition: opacity 0.12s ease;
  }

  .card.selectable:hover .hover-cue,
  .card.selectable:focus-visible .hover-cue {
    opacity: 1;
  }

  .badge-ideal {
    padding: 1px 5px;
    font-size: 0.61rem;
    font-weight: 700;
    background: var(--ps-amber-bg);
    color: var(--ps-amber);
    border: 1px solid var(--ps-amber);
  }

  .lock-icon {
    display: inline-flex;
    color: var(--ps-dim);
  }

  /* Compact horizontal card body: pixelated sprite left, name + stat right */
  .card-body {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    min-height: 88px;
  }

  .sprite-box {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sprite-box img {
    width: 72px;
    height: 72px;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .card.locked .sprite-box img {
    opacity: 0.85;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    flex: 1;
    gap: 4px;
  }

  .poke-name {
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.2;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono, "Geist Mono", ui-monospace, monospace);
  }

  .stat-val {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1;
  }

  .delta {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 1px 5px;
  }

  .delta.good {
    color: var(--ps-emerald);
    background: var(--ps-emerald-bg);
  }

  .delta.bad {
    color: var(--ps-danger);
    background: var(--ps-danger-bg);
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--ps-border);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .btn {
    font-family: var(--font-mono, "Geist Mono", ui-monospace, monospace);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 7px 12px;
    border: 1px solid var(--ps-border);
    background: var(--ps-bg);
    color: var(--ps-text);
    cursor: pointer;
    transition: background-color 0.12s ease, border-color 0.12s ease;
  }

  .btn:hover:not(:disabled) {
    background: var(--ps-surface-active);
    border-color: var(--ps-border-strong);
  }

  .btn.primary {
    background: var(--ps-text);
    border-color: var(--ps-text);
    color: var(--ps-bg);
  }

  .btn.primary:hover:not(:disabled) {
    opacity: 0.88;
  }

  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .session-stats {
    font-family: var(--font-mono, "Geist Mono", ui-monospace, monospace);
    font-size: 0.74rem;
    color: var(--ps-dim);
  }
`;

class PokestatsDraft extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.pokemonList = [];
    this.modeKey = "arceus";
    this.showHints = false;
    this.round = 1;
    this.locked = {}; // statKey -> { pokemon, value }
    this.currentDraw = {}; // statKey -> pokemon
    this.session = { games: 0, wins: 0 };
    this.loading = true;
    this.error = null;
    this._onGlobalKeydown = this.handleGlobalKeydown.bind(this);
  }

  get lang() {
    return this.getAttribute("lang") === "en" ? "en" : "pt";
  }

  get t() {
    return I18N[this.lang];
  }

  async connectedCallback() {
    window.addEventListener("keydown", this._onGlobalKeydown);
    const src = this.getAttribute("data-src") || "./gen1_pokemon.json";
    try {
      const resp = await fetch(src);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.pokemonList = await resp.json();
      this.loading = false;
      this.startNewGame();
    } catch (err) {
      this.loading = false;
      this.error = this.t.loadError(err.message);
      this.render();
    }
  }

  disconnectedCallback() {
    window.removeEventListener("keydown", this._onGlobalKeydown);
  }

  handleGlobalKeydown(e) {
    if (this.loading || this.error || this.isFinished) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    const num = Number(e.key);
    if (num >= 1 && num <= STATS.length) {
      const statKey = STATS[num - 1].key;
      if (!(statKey in this.locked)) {
        e.preventDefault();
        this.pickSlot(statKey);
      }
    }
  }

  get mode() {
    return MODES[this.modeKey];
  }

  get openStats() {
    return STATS.filter((s) => !(s.key in this.locked));
  }

  get currentSum() {
    return Object.values(this.locked).reduce((acc, item) => acc + item.value, 0);
  }

  get isFinished() {
    return Object.keys(this.locked).length === STATS.length;
  }

  startNewGame() {
    this.round = 1;
    this.locked = {};
    this.currentDraw = {};
    this.drawRound();
    this.render();
  }

  drawRound() {
    const lockedNames = new Set(Object.values(this.locked).map((item) => item.pokemon.name));
    const pool = this.pokemonList.filter((p) => !lockedNames.has(p.name));
    const open = this.openStats;

    for (let i = 0; i < open.length; i++) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
      this.currentDraw[open[i].key] = pool[i];
    }
  }

  pickSlot(statKey) {
    if (this.isFinished || !(statKey in this.currentDraw)) return;
    const poke = this.currentDraw[statKey];
    this.locked[statKey] = { pokemon: poke, value: poke[statKey] };
    this.currentDraw = {};

    if (this.isFinished) {
      this.session.games += 1;
      if (this.mode.winCheck(this.currentSum)) {
        this.session.wins += 1;
      }
    } else {
      this.round += 1;
      this.drawRound();
    }
    this.render();
  }

  autoFinishGreedy() {
    while (!this.isFinished) {
      const open = this.openStats;
      let bestStat = open[0].key;
      let bestVal = this.currentDraw[bestStat][bestStat];
      for (const s of open.slice(1)) {
        const val = this.currentDraw[s.key][s.key];
        if (this.mode.isBetter(val, bestVal)) {
          bestVal = val;
          bestStat = s.key;
        }
      }
      this.pickSlot(bestStat);
    }
  }

  findBestRoundSlot() {
    const open = this.openStats;
    if (open.length <= 1) return null;
    let bestKey = open[0].key;
    let bestVal = this.currentDraw[bestKey][bestKey];
    for (const s of open.slice(1)) {
      const val = this.currentDraw[s.key][s.key];
      if (this.mode.isBetter(val, bestVal)) {
        bestVal = val;
        bestKey = s.key;
      }
    }
    return bestKey;
  }

  render() {
    const t = this.t;
    const lang = this.lang;
    if (this.loading) {
      this.shadowRoot.innerHTML = `<style>${TEMPLATE_STYLES}</style><div class="widget">${t.loading}</div>`;
      return;
    }
    if (this.error) {
      this.shadowRoot.innerHTML = `<style>${TEMPLATE_STYLES}</style><div class="widget">${this.error}</div>`;
      return;
    }

    const mode = this.mode;
    const sum = this.currentSum;
    const lockedCount = Object.keys(this.locked).length;
    const finished = this.isFinished;
    const won = finished && mode.winCheck(sum);
    const bestSlot = !finished && this.showHints ? this.findBestRoundSlot() : null;

    const segmentsHtml = Array.from({ length: STATS.length }, (_, idx) => {
      const isFilled = idx < lockedCount;
      const cls = ["segment"];
      if (isFilled) cls.push("filled");
      if (finished) cls.push(won ? "win" : "lose");
      return `<div class="${cls.join(" ")}"></div>`;
    }).join("");

    const cardsHtml = STATS.map((stat, idx) => {
      const isLocked = stat.key in this.locked;
      const poke = isLocked ? this.locked[stat.key].pokemon : this.currentDraw[stat.key];
      const val = poke ? poke[stat.key] : 0;
      const delta = val - mode.individualTarget;
      const isGood = mode.isGoodDelta(delta);

      const classes = ["card"];
      if (isLocked) {
        classes.push("locked");
      } else {
        classes.push("selectable");
      }
      if (this.showHints) {
        classes.push(isGood ? "hint-good" : "hint-bad");
      }

      const isIdeal = !isLocked && this.showHints && stat.key === bestSlot;
      const rightIndicator = isLocked
        ? `<span class="lock-icon" title="${t.lockTitle}">${LOCK_ICON_SVG}</span>`
        : `<span class="top-right">
             <span class="hover-cue">${t.lockCue}</span>
             ${isIdeal ? `<span class="badge-ideal">${t.idealBadge}</span>` : ""}
           </span>`;

      const showVal = this.showHints || isLocked;
      const statsHtml = showVal
        ? `<div class="stat-row">
             <span class="stat-val">${val}</span>
             ${this.showHints ? `<span class="delta ${isGood ? "good" : "bad"}">${delta >= 0 ? "+" : ""}${delta}</span>` : ""}
           </div>`
        : "";

      return `
        <div class="${classes.join(" ")}" data-stat="${stat.key}" role="${isLocked ? "status" : "button"}" tabindex="${isLocked ? "-1" : "0"}">
          <div class="card-top">
            <span class="stat-slot">
              ${!isLocked ? `<span class="key-hint">${idx + 1}</span>` : ""}
              <span class="stat-tag">${stat.label}</span>
            </span>
            ${rightIndicator}
          </div>
          <div class="card-body">
            <div class="sprite-box">
              <img src="${poke.spriteUrl}" alt="${poke.displayName}" loading="lazy" />
            </div>
            <div class="card-info">
              <div class="poke-name" title="${poke.displayName}">${poke.displayName}</div>
              ${statsHtml}
            </div>
          </div>
        </div>
      `;
    }).join("");

    const leftStatus = finished
      ? `<span class="verdict ${won ? "win" : "lose"}">${t.finished} · ${mode.formatVerdict(sum, lang)}</span>`
      : `<span>${t.round(this.round)}</span>`;

    const hintText = this.showHints ? `(${mode.hintLabel[lang]})` : "";

    this.shadowRoot.innerHTML = `
      <style>${TEMPLATE_STYLES}</style>
      <div class="widget">
        <div class="header">
          <div class="title-block">
            <h3>${t.title}</h3>
            <p>${t.subtitle}</p>
          </div>
          <div class="controls">
            <div class="mode-group">
              <button class="mode-btn ${this.modeKey === "arceus" ? "active" : ""}" data-mode="arceus">Arceus (&ge; 720)</button>
              <button class="mode-btn ${this.modeKey === "magikarp" ? "active" : ""}" data-mode="magikarp">Magikarp (&le; 200)</button>
            </div>
            <label class="toggle-label">
              <input type="checkbox" id="hints-toggle" ${this.showHints ? "checked" : ""} />
              ${t.hintsToggle}
            </label>
          </div>
        </div>

        <div class="progress-section">
          <div class="status-bar">
            ${leftStatus}
            <span>${t.lockedSum(sum, mode.targetTotal, hintText)}</span>
          </div>
          <div class="segments" aria-label="${t.progressAria}">
            ${segmentsHtml}
          </div>
        </div>

        <div class="grid">
          ${cardsHtml}
        </div>

        <div class="footer">
          <div class="actions">
            <button class="btn ${finished ? "primary" : ""}" id="new-game-btn">${finished ? t.playAgain : t.restart}</button>
            <button class="btn" id="auto-btn" ${finished ? "disabled" : ""}>${t.autoGreedy}</button>
          </div>
          <span class="session-stats">${t.sessionStats(this.session.wins, this.session.games)}</span>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextMode = btn.getAttribute("data-mode");
        if (nextMode && nextMode !== this.modeKey) {
          this.modeKey = nextMode;
          this.startNewGame();
        }
      });
    });

    const hintsToggle = this.shadowRoot.getElementById("hints-toggle");
    if (hintsToggle) {
      hintsToggle.addEventListener("change", (e) => {
        this.showHints = e.target.checked;
        this.render();
      });
    }

    this.shadowRoot.querySelectorAll(".card.selectable").forEach((card) => {
      const statKey = card.getAttribute("data-stat");
      card.addEventListener("click", () => this.pickSlot(statKey));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.pickSlot(statKey);
        }
      });
    });

    const newGameBtn = this.shadowRoot.getElementById("new-game-btn");
    if (newGameBtn) newGameBtn.addEventListener("click", () => this.startNewGame());

    const autoBtn = this.shadowRoot.getElementById("auto-btn");
    if (autoBtn) autoBtn.addEventListener("click", () => this.autoFinishGreedy());
  }
}

if (!customElements.get("pokestats-draft")) {
  customElements.define("pokestats-draft", PokestatsDraft);
}
