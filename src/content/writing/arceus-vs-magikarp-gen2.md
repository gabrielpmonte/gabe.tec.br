---
title: "Arceus vs. Magikarp (Parte 2): Expectimax e o desafio em todas as gerações"
description: "Por que a heurística gulosa perde partidas ganhas na Gen 1, como resolvemos a política ótima com Expectimax e o que acontece com as chances quando escalamos de 151 para 1.025 Pokémon (Gen 1 a Gen 9)."
publishDate: 2026-11-25
tags: ["python", "matematica", "pokemon", "dados"]
draft: true
series:
  name: "Arceus vs. Magikarp"
  part: 2
repoUrl: "https://git.gabe.tec.br/eiri/pokestats"
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
    content: "[CLIQUE NA IMAGEM PARA AMPLIAR]";
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
</style>

Imagine abrir a Rodada 1 do desafio Arceus na Gen 1 e receber duas opções fortes na mesma mão: um `125` em `Atk` (como Flareon ou Machamp) e um `120` em `SpD` (como Tentacruel ou Mr. Mime).

Se você jogar pelo maior número imediato, a escolha parece óbvia: `125 > 120`, então você trava o `Atk`. Só que os números exatos mostram o contrário. Travar `Atk = 125` na Rodada 1 deixa a sua probabilidade de fechar em `720+` pontos em **1,59%**, enquanto travar `SpD = 120` sobe essa chance para **1,72%**. Pior ainda se aparecesse um `120` em `HP`: travar ali derrubaria sua chance para **0,25%**, porque você acabou de fechar a vaga da Chansey (`250` de `HP`).

Na [Parte 1](/writing/arceus-vs-magikarp-gen1), usamos uma heurística gulosa simples como piso conservador (`1,04%` no Arceus e `1,95%` no Magikarp com a seed padrão). Agora vamos substituir o chute guloso pela **política ótima via Expectimax** e testar como os dois algoritmos se comportam quando o sorteio cresce de 151 Pokémon (Gen 1) para todos os **1.025 Pokémon** até a Gen 9.

---

## Onde o Expectimax ganha do guloso na Gen 1

Rodando 50.000 partidas na Gen 1 sem repetir espécies já travadas no time, o Expectimax eleva a taxa de vitória no Arceus em ~22% relativos frente à heurística gulosa, enquanto no Magikarp a diferença fica dentro da margem de erro:

| Modo (Gen 1, `N = 151`) | Heurística Gulosa | Expectimax (50k sim.) | Modelo Teórico `V[0, 0]` | Média Guloso → Expectimax |
| :--- | ---: | ---: | ---: | ---: |
| **Arceus (`≥ 720`)** | 1,04% | **1,27% ± 0,10%** | 1,25% | 541,6 → **526,5 pts** |
| **Magikarp (`≤ 200`)** | 1,95% | **2,00% ± 0,12%** | 2,19% | 287,5 → **287,5 pts** |

Repare em um detalhe curioso na última coluna: no desafio Arceus, o Expectimax tem **média menor** do que o guloso (`526,5` contra `541,6` pontos), mas ganha mais vezes (`1,27%` contra `1,04%`).

O motivo aparece na distribuição abaixo. O guloso aceita qualquer ponto mediano cedo (como `105` em `HP`) para inflar a soma garantida. O Expectimax faz o oposto: quando percebe que ficou atrás no placar, ele adota uma postura *variance-seeking* (rejeita pontos medianos em `HP` ou `Def` na esperança de pescar uma Chansey ou Cloyster nas rodadas finais). Quando já abriu vantagem, ele inverte para *variance-averse* e aceita valores seguros como `100` em `SpD` para não morrer no gargalo.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 01/03 • POLÍTICA ÓTIMA VS. GULOSA (GEN 1)</span>
    <strong class="themed-chart-title">Distribuição de Pontos em 50.000 Partidas no Desafio Arceus</strong>
    <span class="themed-chart-sub">O Expectimax reduz a média (541,6 → 526,5), mas empurra a cauda direita acima de 720 pts (1,04% → 1,27%)</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen2/01_gen1_guloso_vs_expectimax-light.webp" alt="Histogramas sobrepostos da distribuição completa e zoom na cauda acima de 680 pontos comparando heurística gulosa e Expectimax na Gen 1" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen2/01_gen1_guloso_vs_expectimax-dark.webp" alt="Histogramas sobrepostos da distribuição completa e zoom na cauda acima de 680 pontos comparando heurística gulosa e Expectimax na Gen 1" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: ELROYTAN/POKEMODATA (GEN 1, N=151) • 50.000 SIMULAÇÕES MONTE CARLO</figcaption>
</figure>

---

## Como resolver o Expectimax sem explodir a memória

Tentar calcular o Expectimax exato rastreando `(mask, soma_atual, subconjunto_pokemon_usados)` é inviável: só na 5ª rodada existem $\binom{151}{5} \times 6 = 3,69 \times 10^9$ combinações antes mesmo de multiplicar pela soma acumulada ($\sim 10^{12}$ estados), e expandir a árvore completa teria fator de ramificação $\approx 10^{31}$.

Para tornar o problema tratável, desacoplamos o espaço de estados ignorando a reposição dos no máximo 5 Pokémon já travados no pool de $N$ espécies (o que introduz um desvio máximo de $\le 3,3\%$ na composição do baralho da Gen 1 e $< 0,5\%$ com todas as gerações). Com isso, o estado colapsa para `(mask, soma_atual)`: apenas $64 \times 1501 = 96.064$ estados ($\sim 750\text{ KB}$ em RAM).

Mesmo assim, calcular o valor esperado do máximo entre os $k$ status abertos por força bruta exigiria enumerar $N^k$ tuplas (em `N = 1025` e `k = 6`, seriam $1,16 \times 10^{18}$ combinações por soma). Resolvemos isso em tempo quase linear usando a **identidade telescópica da CDF** sobre os $N \cdot k$ valores candidatos ordenados $v_{(1)} \le \dots \le v_{(N k)}$:

$$\mathbb{E}\left[\max_{j \in \text{abertos}} Y_j\right] = \sum_{t=1}^{N \cdot k} v_{(t)} \Big( F_M(v_{(t)}) - F_M(v_{(t-1)}) \Big)$$

$$F_M(v) = \prod_{j \in \text{abertos}} \frac{\#\{i : y_{j,i} \le v\}}{N}$$

Isso reduz cada transição de $O(N^k)$ para $O(k \cdot N \log(N k))$ e permite pré-computar a tabela inteira $V[\text{mask}, \text{soma}]$ em poucos décimos de segundo com NumPy vetorizado. No [simulador interativo da Parte 1](/writing/arceus-vs-magikarp-gen1), é exatamente essa tabela serializada em `Float32` que alimenta o modo **Dicas visuais** no navegador.

<details class="method-box">
  <summary>// VER IMPLEMENTAÇÃO VETORIZADA EM NUMPY (solve_draft_expectimax)</summary>

```python
def solve_draft_expectimax(
    stats_matrix: np.ndarray,
    target: int = 720,
    mode: str = "arceus",
) -> np.ndarray:
    n_pokemon, n_stats = stats_matrix.shape
    max_single_stat = int(stats_matrix.max())
    max_total_sum = max_single_stat * n_stats
    full_mask = (1 << n_stats) - 1

    V = np.zeros((1 << n_stats, max_total_sum + 1), dtype=np.float64)
    sums = np.arange(max_total_sum + 1)
    V[full_mask, :] = (sums >= target) if mode == "arceus" else (sums <= target)

    for filled_count in range(n_stats - 1, -1, -1):
        max_reachable_sum = max_single_stat * filled_count
        s_grid = np.arange(max_reachable_sum + 1)[:, None]

        for mask in range(full_mask):
            if mask.bit_count() != filled_count:
                continue

            open_slots = [j for j in range(n_stats) if not (mask & (1 << j))]
            k = len(open_slots)

            slot_values = np.empty((max_reachable_sum + 1, k, n_pokemon), dtype=np.float64)
            for idx, j in enumerate(open_slots):
                next_sums = s_grid + stats_matrix[:, j][None, :]
                slot_values[:, idx, :] = V[mask | (1 << j), next_sums]

            flat_vals = slot_values.reshape(max_reachable_sum + 1, k * n_pokemon)
            slot_ids = np.repeat(np.arange(k), n_pokemon)[None, :]

            order = np.argsort(flat_vals, axis=1, kind="mergesort")
            sorted_vals = np.take_along_axis(flat_vals, order, axis=1)
            sorted_slots = np.take_along_axis(
                np.broadcast_to(slot_ids, flat_vals.shape), order, axis=1
            )

            cdf = np.ones_like(sorted_vals)
            for idx in range(k):
                counts = np.cumsum(sorted_slots == idx, axis=1, dtype=np.float64)
                cdf *= counts / float(n_pokemon)

            pmf = np.diff(cdf, axis=1, prepend=0.0)
            V[mask, : max_reachable_sum + 1] = np.sum(sorted_vals * pmf, axis=1)

    return V
```

</details>

---

## O que acontece quando escalamos da Gen 1 até a Gen 9 (1.025 Pokémon)

Aplicando o mesmo benchmark de 50.000 partidas conforme cada geração entra no pool (mantendo as 1.025 espécies padrão do dataset `elroytan/pokemondata`), a curva revela uma inversão completa de dificuldade:

| Pool Acumulado | Espécies (`N`) | Arceus Guloso | Arceus Expectimax | Magikarp Guloso | Magikarp Expectimax |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **Gen 1** (Kanto) | 151 | 1,04% | **1,27%** | 1,95% | **2,00%** |
| **Gen 1–2** (+ Johto) | 251 | 1,87% | **2,11%** | 2,87% | **2,90%** |
| **Gen 1–3** (+ Hoenn) | 386 | 1,64% | **1,73%** | 2,87% | **2,91%** |
| **Gen 1–4** (+ Sinnoh) | 493 | 1,62% | **1,83%** | 2,26% | **2,32%** |
| **Gen 1–5** (+ Unova) | 649 | 1,37% | **1,51%** | 1,46% | **1,45%** |
| **Gen 1–6** (+ Kalos) | 721 | 1,30% | **1,45%** | 1,17% | **1,23%** |
| **Gen 1–7** (+ Alola) | 809 | 1,59% | **1,76%** | 1,06% | **1,12%** |
| **Gen 1–8** (+ Galar) | 905 | 1,68% | **1,85%** | 0,96% | **1,05%** |
| **Gen 1–9** (+ Paldea) | 1.025 | 1,81% | **1,96%** | 0,80% | **0,82%** |

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 02/03 • ESCALA ACUMULADA (GEN 1 → GEN 9)</span>
    <strong class="themed-chart-title">Taxa de Vitória Conforme Novas Gerações Entram no Sorteio</strong>
    <span class="themed-chart-sub">O Expectimax supera o guloso em todas as janelas no Arceus; a partir da Gen 6, vencer o Arceus fica mais fácil que perder para o Magikarp</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen2/02_escala_gen1_a_gen9-light.webp" alt="Dois gráficos de linha mostrando a evolução da taxa de vitória de Gen 1 até Gen 1-9 para Guloso e Expectimax nos modos Arceus e Magikarp" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen2/02_escala_gen1_a_gen9-dark.webp" alt="Dois gráficos de linha mostrando a evolução da taxa de vitória de Gen 1 até Gen 1-9 para Guloso e Expectimax nos modos Arceus e Magikarp" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: ELROYTAN/POKEMODATA (N=151 A 1.025) • 50.000 SIMULAÇÕES POR JANELA</figcaption>
</figure>

Três efeitos ficam claros quando olhamos a anatomia de cada geração ao lado dessas curvas:

1. **O salto imediato de Johto (Gen 1–2):** a entrada de Shuckle (`230` de `Def` e `230` de `SpD`, mas `20` de `HP`, `10` de `Atk`, `10` de `SpA` e `5` de `Spe`), Blissey (`255` de `HP` e `135` de `SpD`), Lugia (`154` de `SpD`), Ho-Oh (`154` de `SpD`) e Sunkern (`180` de BST) puxa os dois extremos ao mesmo tempo. Tanto o Arceus (`1,27% → 2,11%`) quanto o Magikarp (`2,00% → 2,90%`) atingem seus melhores índices com Johto.
2. **A virada na Gen 5 e Gen 6:** até a Gen 4, perder para o Magikarp é mais fácil. Na `Gen 1–5` (`N = 649`), os dois desafios empatam na casa de `1,5%`. A partir da `Gen 1–6` (`N = 721`), vencer o Arceus passa a ser mais provável (`1,45%` vs. `1,23%`) e a distância abre até a **`Gen 1–9`**, onde superar o Arceus (`1,96%`, ou ~1 em 51) é **2,4 vezes mais fácil** do que perder para o Magikarp (`0,82%`, ou ~1 em 122).
3. **O *power creep* explica tudo:** na Gen 1 e Gen 2, a mediana dos status é `65` pontos (BST médio ~`407`). A partir de Sinnoh (Gen 4) e principalmente em Alola (Gen 7) e Paldea (Gen 9), a mediana sobe para **`75` pontos** (BST médio `457,4` em Paldea, percentil 95 em `127–131`) e entram dezenas de novos elegíveis com `SpD ≥ 120`. O pool deixa de ter pré-evoluções fracas suficientes para sustentar o desafio Magikarp, enquanto a vantagem relativa do Expectimax no Arceus cai de `+22%` na Gen 1 para `+8%` na Gen 1–9 porque o gargalo de `SpD` vai sendo diluído.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 03/03 • ANATOMIA DO POWER CREEP</span>
    <strong class="themed-chart-title">Mediana, Percentil 95 e Elegíveis em SpD por Geração</strong>
    <span class="themed-chart-sub">A mediana sobe de 65 (Gen 1) para 75 (Gen 9) e o número de Pokémon com SpD ≥ 120 salta de 3 em Kanto para 53 no pool completo</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen2/03_anatomia_geracoes-light.webp" alt="Gráfico comparando mediana e percentil 95 dos status por geração e barras de espécies com SpD maior ou igual a 120" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen2/03_anatomia_geracoes-dark.webp" alt="Gráfico comparando mediana e percentil 95 dos status por geração e barras de espécies com SpD maior ou igual a 120" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: ELROYTAN/POKEMODATA (1.025 ESPÉCIES PADRÃO, GEN 1 A GEN 9)</figcaption>
</figure>

---

## Conclusão

O Expectimax mostra que a heurística gulosa perde principalmente quando há **escassez assimétrica** (como `SpD` na Gen 1) e **espaço para esperar variância** nas rodadas finais. À medida que o pool cresce para 1.025 Pokémon, o *power creep* elimina o gargalo de `SpD` e empurra a dificuldade para o outro lado: em todas as gerações juntas, montar um time mais fraco que o Magikarp se torna mais raro do que bater o deus Pokémon.

Os scripts de benchmark em NumPy, a geração dos gráficos e o Web Component atualizado estão disponíveis em [`pokestats`](https://git.gabe.tec.br/eiri/pokestats).

<dialog id="chart-lightbox" class="chart-lightbox" aria-label="Visualização ampliada do gráfico">
  <div class="chart-lightbox-bar">
    <span class="chart-lightbox-title" id="chart-lightbox-title">GRÁFICO</span>
    <button type="button" class="chart-lightbox-close" id="chart-lightbox-close">[FECHAR / ESC]</button>
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
          modalTitle.textContent = title ? `${idx} — ${title}` : idx || "GRÁFICO";
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
