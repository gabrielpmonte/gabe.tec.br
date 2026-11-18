---
title: "Beating Arceus or losing to Magikarp: the math behind the Gen 1 draft challenge"
description: "Exact combinatorial analysis of all 10.72 trillion ordered teams in Generation 1 and a 50,000-game simulation of the 6-round draft, with a playable demo."
publishDate: 2026-11-18
tags: ["python", "matematica", "pokemon", "dados"]
lang: "en"
translationKey: "arceus-vs-magikarp-gen1"
repoUrl: "https://github.com/gabrielpmonte/pokestats"
hasDemo: true
---

<style>
  .themed-chart {
    margin: 2rem 0;
    border: 1px solid var(--border);
    background: var(--bg);
  }
  .themed-chart-head {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .themed-chart-idx {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-dim);
    letter-spacing: 0.06em;
  }
  .themed-chart-title {
    font-size: 1rem;
    color: var(--text);
  }
  .themed-chart-sub {
    font-size: 0.84rem;
    color: var(--text-muted);
  }
  .themed-chart-frame {
    padding: 0.5rem;
  }
  .prose-content figure.themed-chart img.chart-img {
    width: 100%;
    height: auto;
    margin: 0;
    border: none;
    background: transparent;
    cursor: zoom-in;
    transition: opacity 120ms ease;
  }
  .prose-content figure.themed-chart img.chart-img:hover {
    opacity: 0.94;
  }
  html:not(.dark) .prose-content figure.themed-chart img.chart-dark {
    display: none;
  }
  html:not(.dark) .prose-content figure.themed-chart img.chart-light {
    display: block;
  }
  html.dark .prose-content figure.themed-chart img.chart-light {
    display: none;
  }
  html.dark .prose-content figure.themed-chart img.chart-dark {
    display: block;
  }
  .themed-chart-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 0.75rem;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--text-dim);
  }
  .themed-chart-foot::before {
    content: "[CLICK IMAGE TO ZOOM]";
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }
  dialog.chart-lightbox {
    margin: auto;
    padding: 0;
    border: 1px solid var(--border-strong);
    background: var(--bg);
    color: var(--text);
    width: min(96vw, 1320px);
    max-width: 96vw;
    max-height: 92vh;
  }
  dialog.chart-lightbox::backdrop {
    background: color-mix(in srgb, #000000 78%, transparent);
  }
  .chart-lightbox-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    font-family: var(--font-mono);
    font-size: 0.76rem;
  }
  .chart-lightbox-title {
    color: var(--text);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chart-lightbox-close {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--border-strong);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;
  }
  .chart-lightbox-close:hover {
    background: var(--surface-active);
  }
  .chart-lightbox-body {
    padding: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
    max-height: calc(92vh - 3rem);
    background: var(--bg);
  }
  .chart-lightbox-body img {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: calc(92vh - 5rem);
    height: auto;
    margin: 0;
    border: none;
    background: transparent;
  }
  .demo-stage {
    margin: 2.25rem 0;
    padding: 0.5rem 0;
  }
  .method-box {
    margin: 2rem 0;
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 0.9rem 1.1rem;
  }
  .method-box summary {
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
  }
  .method-box[open] summary {
    margin-bottom: 0.8rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border);
  }
  sup a[data-footnote-ref] {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0 3px;
    margin-left: 1px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--tc-blue);
    text-decoration: none;
  }
  sup a[data-footnote-ref]:hover {
    border-color: var(--border-strong);
    background: var(--surface-active);
  }
  section[data-footnotes] {
    margin-top: 3rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
    font-size: 0.88rem;
    color: var(--text-muted);
  }
  section[data-footnotes] ol {
    padding-left: 1.25rem;
  }
</style>

I came across a Reel by [@malamarisuno](https://www.instagram.com/malamarisuno/) featuring two randomized Pokémon draft challenges and decided to compute the exact odds behind each one:

1. **Arceus Challenge (`≥ 720` pts):** Across 6 rounds, random [Generation 1](https://bulbapedia.bulbagarden.net/wiki/Generation_I) Pokémon are drawn for each of your team's 6 stats. In round 1, you get 6 options (one per open stat), pick 1, and lock that Pokémon in place without being able to swap positions later. Round 2 gives 5 options, then 4, 3, 2, and 1. The goal is to finish with a total greater than or equal to Arceus (720 points).
2. **Magikarp Challenge (`≤ 200` pts):** The same rules, except you are trying to finish at or below Magikarp (200 points).

To find out which mode is actually harder, I wrote a Python script that computes all ordered 6-Pokémon arrangements in Gen 1 and simulates 50,000 games of the draft.

---

## Try the simulator before looking at the numbers

> [!tip] How to play the simulator
> You can play by clicking the cards or pressing keys `1` through `6`. By default, the simulator matches the original filter experience (sprite and name only); check **Visual hints** if you want to explore the strategy.

<div class="demo-stage">
  <pokestats-draft data-src="/demos/pokestats/gen1_pokemon.json" lang="en"></pokestats-draft>
  <script type="module" src="/demos/pokestats/pokestats-draft.js"></script>
</div>

---

## The search space: 10.72 trillion arrangements

Every Pokémon has 6 [base stats](https://pokemondb.net/pokedex/all)[^1]: `HP` (Hit Points), `Atk` (Attack), `Def` (Defense), `SpA` (Special Attack), `SpD` (Special Defense), and `Spe` (Speed).

- **Arceus** totals 720 points (an exact 120 in all 6 stats).
- **Magikarp** totals 200 points (33.3 on average per stat).

Since [Generation 1](https://bulbapedia.bulbagarden.net/wiki/Generation_I) has 151 Pokémon and species cannot repeat across the 6 positions, order matters and the full universe is the number of 6-permutations:

$$P(151, 6) = 151 \times 150 \times 149 \times 148 \times 147 \times 146 = 10,719,792,543,600$$

That is **10.72 trillion** distinct ordered teams. If you filled all 6 positions completely blind, the average Gen 1 team would sum to just 407.64 points, leaving it 312.36 points below Arceus and 207.64 points above Magikarp.

---

## Challenge 1: Beating Arceus (≥ 720 pts)

No single Gen 1 Pokémon reaches 720 points on its own. Comparing each stat against the 120-point benchmark, even the two strongest icons of the generation finish in the red:

- **Mew** (600 pts): `100` across the board, giving a uniform `-20` deficit in every stat (-120 pts total).
- **Mewtwo** (680 pts): gains ground in `SpA (+34)` and `Spe (+10)`, but loses in `HP (-14)`, `Atk (-10)`, `Def (-30)`, and `SpD (-30)`, finishing at -40 pts.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 01/10 • BASELINE REFERENCE</span>
    <strong class="themed-chart-title">The Arceus Challenge: Gen 1 Margin vs. 120 pts</strong>
    <span class="themed-chart-sub">Even Mewtwo (680 pts) finishes at -40 pts; Mew (600 pts) sits at -120 pts</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/01_alvo_referencias-light.webp" alt="Diverging bar chart showing Mew and Mewtwo stat margins relative to 120 points" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/01_alvo_referencias-dark.webp" alt="Diverging bar chart showing Mew and Mewtwo stat margins relative to 120 points" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

Picking the top specialist for each stat yields a 6-species team totaling 993 points, a +273 pt surplus over Arceus. That margin is heavily concentrated: Chansey (`+130`) and Cloyster (`+60`) account for nearly 70% of the surplus, while Articuno (`+5`) barely clears 120 in `SpD`.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 02/10 • THEORETICAL CEILING</span>
    <strong class="themed-chart-title">Surplus of Gen 1 Top Specialists</strong>
    <span class="themed-chart-sub">Total surplus = +273 pts (993 vs. 720) • 6 distinct Pokémon</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/02_especialistas_maximos-light.webp" alt="Bar chart of points above 120 for the 6 highest Gen 1 specialists" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/02_especialistas_maximos-dark.webp" alt="Bar chart of points above 120 for the 6 highest Gen 1 specialists" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

### The SpD bottleneck, the "Chansey Effect", and wildcards

If we enforce a strict rule requiring all 6 stats to be `≥ 120` individually, valid teams become scarce. Gen 1 stat medians sit around 60 to 70 points, and only 3 Pokémon (`2.0%` of the Pokédex) reach `120+` in `SpD` (Articuno at 125, Mr. Mime at 120, and Tentacruel at 120). Because of this funnel, there are only **35,880** strict valid arrangements in the entire universe.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 03/10 • COMBINATORIAL BOTTLENECK</span>
    <strong class="themed-chart-title">Stat Distribution and the SpD Bottleneck</strong>
    <span class="themed-chart-sub">Strict scenario: only 35,880 arrangements keep all 6 stats ≥ 120</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/03_distribuicao_gargalo-light.webp" alt="Violin plot of Gen 1 stat distributions highlighting only 3 eligible species in SpD" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/03_distribuicao_gargalo-dark.webp" alt="Violin plot of Gen 1 stat distributions highlighting only 3 eligible species in SpD" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

What changes the math is **compensation**: when we allow extreme specialists to offset teammates below 120, the count of `≥ 720` teams jumps from 35,880 to **1,620,378,634** (45,161× more solutions).

> [!note] The Gen 1 wildcards (Mew and Ditto)
> At the bottom of the chart below (`std dev = 0`), Mew (`100 ± 0`) and Ditto (`48 ± 0`) are the only Pokémon with six identical stats. They act as **wildcards** in late rounds: Mew guarantees `100` points in any open stat for the Arceus run (handy for `SpD`), while Ditto provides a steady `48` in the Magikarp challenge when a round only offers high-BST evolved species.

At the top of the chart sit the extreme specialists: all 10 Pokémon with the widest stat spread have a mean below Mew's 100, yet pack massive points into one stat. **Chansey** leads by a wide margin, ranging from 5 (`Atk` and `Def`) up to 250 (`HP`), a 245-point spread (`Δ 245`).

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 04/10 • COMPENSATION &amp; WILDCARDS</span>
    <strong class="themed-chart-title">Mean Stat vs. Stat Spread</strong>
    <span class="themed-chart-sub">Compensation adds +1,620,342,754 valid arrangements (total: 1,620,378,634)</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/04_media_vs_variacao-light.webp" alt="Scatter plot of mean stat vs. standard deviation highlighting extreme specialists and Mew/Ditto" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/04_media_vs_variacao-dark.webp" alt="Scatter plot of mean stat vs. standard deviation highlighting extreme specialists and Mew/Ditto" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 05/10 • STAT SPREAD</span>
    <strong class="themed-chart-title">The Chansey Effect: Spread of Top Specialists</strong>
    <span class="themed-chart-sub">Top 10 widest spreads in Gen 1 compared to Mew (all averaging below 100)</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/05_amplitude_especialistas-light.webp" alt="Dumbbell chart of min, mean, and max stats for the 10 widest-spread Gen 1 Pokémon" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/05_amplitude_especialistas-dark.webp" alt="Dumbbell chart of min, mean, and max stats for the 10 widest-spread Gen 1 Pokémon" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

In the margin breakdown below, you can see compensation in action: in the second team, Chansey (`+130` `HP`) and Mewtwo (`+10` `Spe`) cancel out the deficits of Poliwhirl (`-55`), Persian (`-60`), Omastar (`-5`), and Muk (`-20`), landing on an exact 720 pts (`+0`).

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 06/10 • MARGINS VS. ARCEUS</span>
    <strong class="themed-chart-title">Stat Margins vs. 120-pt Baseline (Arceus)</strong>
    <span class="themed-chart-sub">Positive and negative stat margins for 3 teams that reach 720+ pts</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/06_times_vs_arceus-light.webp" alt="Stat margins above and below 120 for 3 teams that beat Arceus" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/06_times_vs_arceus-dark.webp" alt="Stat margins above and below 120 for 3 teams that beat Arceus" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

---

## Challenge 2: Losing to Magikarp (≤ 200 pts)

At the opposite end, I used the Hungarian Algorithm to find the lowest possible sum without repeating species:

- **Lowest possible arrangement:** 80 points (Diglett `10` `HP`, Magikarp `10` `Atk`, Chansey `5` `Def`, Caterpie `20` `SpA`, Weedle `20` `SpD`, Slowpoke `15` `Spe`).
- **Lowest fully-evolved arrangement:** 175 points (Dugtrio `35` `HP`, Chansey `5` `Atk`, Jynx `35` `Def`, Onix `30` `SpA`, Tangela `40` `SpD`, Parasect `30` `Spe`).

> [!warning] Chansey's double-edged sword
> Chansey helps you beat Arceus (`250` `HP`) and also helps you lose to Magikarp (`5` `Atk` and `5` `Def`). If it shows up in the wrong stat mid-draft, it can ruin an attempt in either mode.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 07/10 • MARGINS VS. MAGIKARP</span>
    <strong class="themed-chart-title">Stat Margins vs. 33-pt Baseline (Magikarp)</strong>
    <span class="themed-chart-sub">Comparison of the weakest Gen 1 teams against the 200-pt ceiling</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/07_piores_times_vs_magikarp-light.webp" alt="Stat margins of the weakest Gen 1 teams compared to 33 points" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/07_piores_times_vs_magikarp-dark.webp" alt="Stat margins of the weakest Gen 1 teams compared to 33 points" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

---

## The blind-draw baseline

Computing the exact sum distribution over all 10.72 trillion arrangements[^2] gives the complete Gen 1 curve:

| Scenario | Valid Arrangements | Probability | Approximate Odds |
| :--- | ---: | ---: | :--- |
| **≤ Magikarp (≤ 200 pts)** | 1,426,963,484 | 0.013311% | **1 in 7,512** |
| **Middle Range (201 to 719 pts)** | 10,716,745,201,482 | 99.971573% | Vast majority |
| **≥ Arceus (≥ 720 pts)** | 1,620,378,634 | 0.015116% | **1 in 6,616** |

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 08/10 • EXACT DISTRIBUTION</span>
    <strong class="themed-chart-title">The Full Curve of 10.72 Trillion Teams</strong>
    <span class="themed-chart-sub">Exact universe: 10,719,792,543,600 ordered teams (Gen 1) • 5-pt bins</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/08_distribuicao_probabilidade-light.webp" alt="Complete probability distribution curve zooming into the Magikarp and Arceus tails" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/08_distribuicao_probabilidade-dark.webp" alt="Complete probability distribution curve zooming into the Magikarp and Arceus tails" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

**In a blind draw:** without choosing between rounds, losing to Magikarp (1 in 7,512) is slightly rarer than beating Arceus (1 in 6,616). From the cumulative geometric curve $1 - (1 - p)^k$, it takes 4,586 attempts for Arceus and 5,207 attempts for Magikarp just to reach a 50% chance of getting at least one win.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 09/10 • BLIND BASELINE</span>
    <strong class="themed-chart-title">How Many Blind Attempts Does It Take?</strong>
    <span class="themed-chart-sub">Without round choices, cumulative win probability follows 1 − (1 − p)^k</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/09_curva_tentativas-light.webp" alt="Cumulative win probability curves up to 20,000 blind attempts" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/09_curva_tentativas-dark.webp" alt="Cumulative win probability curves up to 20,000 blind attempts" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

---

## The real game: the `6 → 5 → 4 → 3 → 2 → 1` draft

In the actual challenge, you pick 1 `(Pokémon, stat)` pair per round. If Chansey appears under `Def` in round 1 of an Arceus run, you can skip it and still hope to see it under `HP` later.

Simulating 50,000 games[^3] with a simple greedy heuristic (which serves as a conservative lower bound, since an experienced player or an optimal Expectimax policy can achieve higher rates), we compare picking the highest or lowest raw value against picking by best percentile within the stat:

- **Arceus Challenge (`≥ 720`):** the average score jumps from 407.6 to 541.2 pts, and the win rate rises to **1.05%** (~1 in 96, or 69× higher than a blind draw).
- **Magikarp Challenge (`≤ 200`):** the average drops from 407.6 to 287.3 pts, and the win rate climbs to **1.97%** (~1 in 51, or 148× higher than a blind draw).
- **Why does raw value beat percentile (`1.05%` vs. `0.95%`)?** Because the 720 target depends on absolute point sums and stat distributions are heavily asymmetric: the top percentile of `HP` reaches 250 points, whereas `SpD` tops out at 125. Locking a `130` in `Atk` adds `10` more points to your total than locking a `120` in `SpD`, even if `120` sits at the very top of `SpD`.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 10/10 • REAL DRAFT SIMULATION</span>
    <strong class="themed-chart-title">The 6-Round Draft (No Stat Swapping)</strong>
    <span class="themed-chart-sub">Picking 1 option per round makes losing to Magikarp nearly 2× easier than beating Arceus</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/10_simulacao_draft-light.webp" alt="Comparison of score distributions and win rates across 50,000 simulated draft games" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/10_simulacao_draft-dark.webp" alt="Comparison of score distributions and win rates across 50,000 simulated draft games" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">SOURCE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • EXACT COMBINATORIAL ANALYSIS</figcaption>
</figure>

**In the real draft:** Pokédex asymmetry flips the difficulty. Gen 1 has far more pre-evolutions with low stats (`≤ 25`) than extreme specialists (`≥ 120`). Choosing from `6 → 5 → 4 → 3 → 2 → 1` options makes losing to Magikarp (~1 in 51) nearly twice as easy as beating Arceus (~1 in 96).

<details class="method-box">
  <summary>// VIEW BITMASK DP CODE (HOW WE COMPUTED 10.72 TRILLION IN &lt; 1s)</summary>

Instead of enumerating `10.72` trillion arrangements, we represent the set of filled stats as a `6`-bit mask (`0` to `63`). The core loop in `src/pokestats/analysis.py` computes the exact distribution in a few milliseconds:

```python
dp = np.zeros((1 << n_stats, max_sum + 1), dtype=np.int64)
dp[0, 0] = 1

for poke_stats in stats_matrix:
    for mask in range(full_mask - 1, -1, -1):
        if not dp[mask].any():
            continue
        source_slice = dp[mask, : max_by_mask[mask] + 1]
        for j, val in enumerate(poke_stats):
            if not (mask & (1 << j)):
                dp[mask | (1 << j), val : val + max_by_mask[mask] + 1] += source_slice
```

</details>

---

## What changes in Johto (Gen 2)

[Generation 1](https://bulbapedia.bulbagarden.net/wiki/Generation_I) suffers from the legacy of its unified *Special* stat, leaving only 3 Pokémon above 120 in `SpD`. Adding the 100 Pokémon from [Generation 2](https://bulbapedia.bulbagarden.net/wiki/Generation_II) shifts both extremes:

- **Shuckle** brings `230` `Def` and `230` `SpD` (directly covering Gen 1's biggest bottleneck), balanced by `20` `HP`, `10` `Atk`, `10` `SpA`, and `5` `Spe`. It works both to rescue an Arceus run and to tank a Magikarp run.
- **Blissey** raises the `HP` ceiling (`255`) and adds `135` `SpD`, while Lugia and Ho-Oh bring `154` `SpD` with `680` BST.
- **Sunkern** sets a new individual Pokédex floor at `180` BST (`30` across all 6 stats, below Magikarp's `200`), pulling the lowest possible 6-Pokémon team down to `65` points.

The Python scripts, test suite, and the Web Component for the simulator are available in the [`pokestats`](https://github.com/gabrielpmonte/pokestats) repository.

---

## Notes & References

[^1]: In the original [Generation I](https://bulbapedia.bulbagarden.net/wiki/Generation_I) (*Red/Blue/Yellow*), *Special* was a single stat; following modern filters and the [Pokémon Database](https://pokemondb.net/pokedex/all) table, we use the 6 updated stats (`HP`, `Atk`, `Def`, `SpA`, `SpD`, `Spe`), which already include permanent stat buffs introduced in Generations 6 and 7 (such as Electrode's `Spe` rising from `140` to `150`, raising Gen 1's theoretical team ceiling from `983` to `993` points). The dataset (`elroytan/pokemondata`) covers all 151 canonical Gen 1 species including the 5 Legendaries/Mythicals (`Mewtwo`, `Mew`, `Articuno`, `Zapdos`, `Moltres`); without `Articuno`, only `Mr. Mime` and `Tentacruel` reach `SpD ≥ 120`.
[^2]: Exact combinatorial count via 6-bit Bitmask Dynamic Programming (`2^6 = 64` states), cross-checked against brute force and `sum(dp) == P(151, 6)`. Minimum team sums were computed in polynomial time $O(n^3)$ using the Hungarian Algorithm (`scipy.optimize.linear_sum_assignment`).
[^3]: The `50,000`-game simulation (`simulate_draft_challenge`) draws distinct options per round and prevents repeating species already locked into the team in earlier rounds, using a greedy heuristic (not Bellman/Expectimax), with 95% CIs of `±0.09%` for Arceus (`1.05%`) and `±0.12%` for Magikarp (`1.97%`). Johto comparisons follow [Generation II data on Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Generation_II).

<dialog id="chart-lightbox" class="chart-lightbox" aria-label="Expanded chart view">
  <div class="chart-lightbox-bar">
    <span class="chart-lightbox-title" id="chart-lightbox-title">CHART</span>
    <button type="button" class="chart-lightbox-close" id="chart-lightbox-close">[CLOSE / ESC]</button>
  </div>
  <div class="chart-lightbox-body">
    <img id="chart-lightbox-img" src="" alt="" />
  </div>
</dialog>

<script is:inline>
  if (!window.__pokestatsLightboxBound) {
    window.__pokestatsLightboxBound = true;
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const dialog = document.getElementById("chart-lightbox");
      if (!(dialog instanceof HTMLDialogElement)) return;

      const chartImg = target.closest("figure.themed-chart img.chart-img");
      if (chartImg instanceof HTMLImageElement) {
        const figure = chartImg.closest("figure.themed-chart");
        const idx = figure?.querySelector(".themed-chart-idx")?.textContent?.trim() || "";
        const title = figure?.querySelector(".themed-chart-title")?.textContent?.trim() || "";
        const modalImg = document.getElementById("chart-lightbox-img");
        const modalTitle = document.getElementById("chart-lightbox-title");

        if (modalImg instanceof HTMLImageElement) {
          modalImg.src = chartImg.currentSrc || chartImg.src;
          modalImg.alt = chartImg.alt;
        }
        if (modalTitle) {
          modalTitle.textContent = title ? `${idx} — ${title}` : idx || "CHART";
        }
        dialog.showModal();
        return;
      }

      if (target.closest("#chart-lightbox-close") || target === dialog) {
        dialog.close();
      }
    });
  }
</script>
