---
title: "Arceus vs. Magikarp (Parte 2): Expectimax e o impacto de Johto (Gen 2)"
description: "Substituindo a heurística gulosa por Programação Dinâmica Estocástica (Bellman/Expectimax) com telescopagem de CDF e expandindo a análise para os 251 Pokémon até a Geração 2."
publishDate: 2026-11-25
tags: ["python", "matematica", "pokemon", "dados"]
draft: true
series:
  name: "Arceus vs. Magikarp"
  part: 2
repoUrl: "https://git.gabe.tec.br/eiri/pokestats"
---

Na [Parte 1](/writing/arceus-vs-magikarp-gen1), calculamos os 10,72 trilhões de arranjos da Gen 1 e usamos uma heurística gulosa simples para simular o draft em 6 rodadas (`1,05%` de vitória no Arceus e `1,97%` no Magikarp). Como uma política gulosa queima vagas cedo sem considerar a assimetria entre os status, ela funciona apenas como limite inferior.

Nesta continuação, calculamos a **política ótima** via Programação Dinâmica Estocástica (Bellman / Expectimax) e expandimos o pool para os 251 Pokémon de Kanto e Johto.

---

## Política Ótima vs. Heurística Gulosa na Gen 1

Na Gen 1, a política ótima obtida por Expectimax produz os seguintes resultados em 50.000 partidas simuladas (sem repetir espécies já travadas no time):

| Modo | Heurística Gulosa | Expectimax (50k sim.) | Modelo Teórico `V[0, 0]` | Média de Pontos |
| :--- | ---: | ---: | ---: | ---: |
| **Arceus (`≥ 720`)** | 1,05% | **1,24% ± 0,10%** | 1,2508% | 526,11 |
| **Magikarp (`≤ 200`)** | 1,97% | **1,94% ± 0,12%** | 2,1885% | 287,37 |

Dois comportamentos explicam por que o Expectimax supera a heurística gulosa no desafio do Arceus (ganho relativo de ~18%):

1. **Preservação de status assimétricos:** a política gulosa trava um `130` em `Atk` na Rodada 1 sem considerar que existem dezenas de Pokémon com `Atk ≥ 120`, enquanto `SpD ≥ 120` tem apenas 3 elegíveis. O Expectimax atribui valor maior a `V[mask | (1 << SpD), s + 120]` do que a `V[mask | (1 << Atk), s + 130]` no início do draft.
2. **Gestão dinâmica de variância:** a média de pontos do Expectimax no modo Arceus cai de `541,2` (guloso) para `526,11`, mas a taxa de vitória sobe. Quando está atrás no placar, a política ótima rejeita valores medianos para manter vagas abertas esperando especialistas extremos como Chansey (`250` HP); quando já abriu folga, passa a aceitar escolhas seguras como Mew (`100`) para fechar `SpD`.

<!-- TODO: Gerar e inserir gráfico comparativo Guloso vs. Expectimax (distribuição de cauda e taxa por rodada) -->

---

## Como resolver o Expectimax sem explodir a memória

Tentar rastrear o estado exato `(mask, soma_atual, subconjunto_pokemon_usados)` é computacionalmente intratável: só na 5ª rodada existem $\binom{151}{5} \times 6 = 3,69 \times 10^9$ combinações de máscara e elenco antes mesmo de multiplicar pela soma acumulada ($\sim 10^{12}$ estados), e a árvore de sorteios tem fator de ramificação $\approx 10^{31}$.

A solução é desacoplar o espaço de estados ignorando a reposição dos no máximo 5 Pokémon já travados no pool de 151 (erro máximo $\le 3,3\%$ na composição do baralho). Com isso, o estado colapsa para `(mask, soma_atual)`: apenas $64 \times 1501 = 96.064$ estados ($\sim 750\text{ KB}$ em RAM).

Para calcular a esperança do máximo entre os $k$ status abertos sem enumerar $151^k$ tuplas ($151^6 \approx 1,18 \times 10^{13}$), usamos a **identidade telescópica da CDF** sobre os valores ordenados por status:

$$\mathbb{E}\left[\max_{j \in \text{abertos}} Y_j\right] = \sum_{t=1}^{151k} v_{(t)} \Big( F_M(v_{(t)}) - F_M(v_{(t-1)}) \Big), \quad F_M(v) = \prod_{j \in \text{abertos}} \frac{\#\{i : y_{j,i} \le v\}}{151}$$

Isso reduz cada transição de $O(151^k)$ para $O(k \cdot 151 \log(151k))$ e resolve a tabela inteira em ~0,15 segundos com NumPy vetorizado.

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

## Expandindo para Johto (Gen 1 + Gen 2 = 251 Pokémon)

<!-- TODO: Rodar DP com bitmask, Algoritmo Húngaro e Expectimax no dataset de 251 espécies (Gen 1 + Gen 2) -->

Com a entrada dos 100 Pokémon da [Geração 2](https://bulbapedia.bulbagarden.net/wiki/Generation_II), o universo de arranjos cresce para $P(251, 6) \approx 2,34 \times 10^{14}$, e o gargalo de `SpD` da Gen 1 recebe reforços extremos como Shuckle (`230` de `Def` e `230` de `SpD`), Blissey (`255` de `HP` e `135` de `SpD`), Lugia (`154` de `SpD`) e Ho-Oh (`154` de `SpD`), enquanto o piso do pior time possível cai para `65` pontos.

<!-- TODO: Inserir tabela comparativa Gen 1 vs. Gen 1+2 (sorteio cego, guloso e Expectimax) e gráficos -->
