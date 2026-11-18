---
title: "Vencer o Arceus ou perder para o Magikarp: a matemática por trás do desafio da Gen 1"
description: "Análise combinatória exata dos 10,72 trilhões de times possíveis da Geração 1 e simulação de 50.000 partidas do draft em 6 rodadas — com demo jogável."
publishDate: 2026-11-18
tags: ["python", "matematica", "pokemon", "dados"]
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
  /* Lightbox Cathode (0px radius, 1px hairline) */
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
  /* Estilo Cathode para citações e notas de rodapé clicáveis */
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
  section[data-footnotes] li {
    margin-bottom: 0.55rem;
    scroll-margin-top: 2rem;
  }
</style>

Vi um Reels do **@malamarisuno** com dois desafios que parecem simples na superfície, mas escondem uma matemática bem curiosa:

1. **Desafio Arceus (`≥ 720` pts):** Em **6 rodadas**, sorteiam-se Pokémon aleatórios da [Geração 1](https://bulbapedia.bulbagarden.net/wiki/Generation_I) para preencher os 6 atributos do seu time. Na 1ª rodada aparecem 6 opções (uma para cada atributo aberto); você escolhe **1** e trava aquele Pokémon ali — sem poder trocar de lugar depois. Na 2ª rodada aparecem 5 opções, depois 4, 3, 2 e 1. O objetivo é terminar com a soma **maior ou igual à do Arceus (720 pontos)**.
2. **Desafio Magikarp (`≤ 200` pts):** A mesma regra, só que tentando terminar **menor ou igual ao Magikarp (200 pontos)**.

Para descobrir qual dos dois é realmente mais difícil, escrevi um pipeline em Python que calcula **todas as combinações possíveis** da Gen 1 e simula **50.000 partidas reais** desse draft.

---

## Teste na prática antes de ver os números

> [!tip] Como jogar o simulador
> Você pode jogar clicando nos cards ou usando as **teclas `1` a `6`**. Para reproduzir exatamente a experiência do filtro original (só sprite e nome), desmarque **Dicas visuais**; para estudar a estratégia, deixe as dicas ligadas.

<div class="demo-stage">
  <pokestats-draft data-src="/demos/pokestats/gen1_pokemon.json"></pokestats-draft>
  <script type="module" src="/demos/pokestats/pokestats-draft.js"></script>
</div>

---

## A anatomia do problema: 10,72 trilhões de combinações

Cada Pokémon tem 6 atributos base ([*Base Stats*](https://pokemondb.net/pokedex/all))[^1]: **HP** (Pontos de Vida), **ATK** (Ataque), **DEF** (Defesa), **SPA** (Ataque Especial), **SPD** (Defesa Especial) e **SPE** (Velocidade).

- **Arceus** soma **720 pontos** (exatos **120** em cada um dos 6 atributos).
- **Magikarp** soma **200 pontos** (média de **33,3** por atributo).

Como a [Geração 1](https://bulbapedia.bulbagarden.net/wiki/Generation_I) possui **151 Pokémon** e não repetimos espécies entre os 6 slots, o universo completo de times ordenados possíveis é:

$$P(151, 6) = 151 \times 150 \times 149 \times 148 \times 147 \times 146 = 10.719.792.543.600$$

São **10,72 trilhões** de combinações distintas. Se alguém preenchesse os 6 slots totalmente às cegas, o time médio da Gen 1 somaria apenas **407,64 pontos** — um buraco de **-312 pontos** abaixo do Arceus e **+208 pontos** acima do Magikarp.

---

## Desafio 1: Superar o Arceus (≥ 720 pts)

Nenhum Pokémon da Gen 1 alcança 720 pontos sozinho. Olhando o saldo atributo a atributo frente à faixa de **120 pts**, até os dois maiores símbolos da geração ficam no negativo:

- **Mew** (600 pts): `100` em tudo, gerando um déficit uniforme de `-20` em cada slot (**-120 pts** no total).
- **Mewtwo** (680 pts): abre folga em `SPA (+34)` e `SPE (+10)`, mas perde em `HP (-14)`, `ATK (-10)`, `DEF (-30)` e `SPD (-30)` — fechando em **-40 pts**.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 01/10 • REFERÊNCIA BASE</span>
    <strong class="themed-chart-title">O Desafio Arceus: Saldo da Gen 1 vs. 120 pts</strong>
    <span class="themed-chart-sub">Mesmo Mewtwo (680 pts) fecha com saldo -40 pts; Mew (600 pts) fica em -120 pts</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/01_alvo_referencias-light.webp" alt="Gráfico de barras divergentes mostrando o saldo de Mew e Mewtwo em relação a 120 pontos por status" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/01_alvo_referencias-dark.webp" alt="Gráfico de barras divergentes mostrando o saldo de Mew e Mewtwo em relação a 120 pontos por status" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

Juntando o **maior especialista de cada atributo**, conseguimos montar um time com **6 espécies distintas** que bate **993 pontos** — uma folga acumulada de **+273 pts** sobre o Arceus. Mas repare em como essa folga é concentrada: **Chansey (`+130`)** e **Cloyster (`+60`)** respondem sozinhos por quase **70%** do excedente, enquanto **Articuno (`+5`)** mal cruza a linha de 120 em `SPD`.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 02/10 • TETO TEÓRICO</span>
    <strong class="themed-chart-title">Folga dos Especialistas Máximos da Gen 1</strong>
    <span class="themed-chart-sub">Excedente total = +273 pts (993 vs. 720) • 6 Pokémon distintos</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/02_especialistas_maximos-light.webp" alt="Excedente acima de 120 pontos dos 6 maiores especialistas da Gen 1" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/02_especialistas_maximos-dark.webp" alt="Excedente acima de 120 pontos dos 6 maiores especialistas da Gen 1" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

### O gargalo em SPD, o "Efeito Chansey" e os coringas

Se impusermos uma regra rígida — **todos os 6 slots precisam ter `≥ 120` individualmente** — a combinatória seca na hora. A mediana dos atributos da Gen 1 gira entre **60 e 70 pontos**, e apenas **3 Pokémon** (`2,0%` da Pokédex) atingem `120+` em **SPD** (Articuno com 125, Mr. Mime com 120 e Tentacruel com 120). Por causa desse funil, existem apenas **35.880** combinações rígidas válidas em todo o universo.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 03/10 • GARGALO COMBINATÓRIO</span>
    <strong class="themed-chart-title">Distribuição por Atributo e o Gargalo em SPD</strong>
    <span class="themed-chart-sub">Cenário rígido: apenas 35.880 combinações mantêm todos os 6 status ≥ 120</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/03_distribuicao_gargalo-light.webp" alt="Violin plot com distribuição real dos status e barra destacando o gargalo de 3 elegíveis em SPD" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/03_distribuicao_gargalo-dark.webp" alt="Violin plot com distribuição real dos status e barra destacando o gargalo de 3 elegíveis em SPD" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

O que destrava o desafio é a **compensação**: quando permitimos que um especialista extremo carregue colegas abaixo de 120, o número de times `≥ 720` explode de **35.880** para **1.620.378.634** (**45.161×** mais soluções!).

> [!note] Os coringas da Gen 1 (Mew e Ditto)
> Na base do gráfico abaixo (`desvio padrão = 0`), **Mew (`100 ± 0`)** e **Ditto (`48 ± 0`)** são os únicos Pokémon com todos os 6 atributos idênticos. Diferente de especialistas que dependem do slot certo, eles funcionam como **coringas**: se não quiser arriscar nas últimas rodadas, o **Mew** garante `100` pontos em qualquer atributo no desafio do Arceus (ótimo em `SPD`), enquanto o **Ditto** entrega `48` estáveis no desafio do Magikarp quando a rodada vem cheia de evoluções pesadas.

Já no topo do gráfico estão os **especialistas extremos**: todos os 10 Pokémon de maior amplitude têm **média abaixo da do Mew (100)**, mas concentram pontos absurdos em um único atributo. A campeã absoluta é a **Chansey**: vai de **5** (em ATK e DEF) até **250** (em HP) — uma amplitude de **245 pontos** (`Δ 245`).

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 04/10 • COMPENSAÇÃO &amp; CORINGAS</span>
    <strong class="themed-chart-title">Status Médio vs. Variação entre Atributos</strong>
    <span class="themed-chart-sub">Compensação destrava +1.620.342.754 combinações (total: 1.620.378.634)</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/04_media_vs_variacao-light.webp" alt="Dispersão de status médio vs. desvio padrão destacando especialistas extremos e os coringas Mew e Ditto" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/04_media_vs_variacao-dark.webp" alt="Dispersão de status médio vs. desvio padrão destacando especialistas extremos e os coringas Mew e Ditto" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 05/10 • AMPLITUDE DE STATUS</span>
    <strong class="themed-chart-title">O Efeito Chansey: Amplitude dos Maiores Especialistas</strong>
    <span class="themed-chart-sub">Top 10 maiores variações da Gen 1 comparados ao Mew (todos com média abaixo de 100)</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/05_amplitude_especialistas-light.webp" alt="Gráfico dumbbell com mínimo, média e máximo dos 10 Pokémon de maior amplitude na Gen 1" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/05_amplitude_especialistas-dark.webp" alt="Gráfico dumbbell com mínimo, média e máximo dos 10 Pokémon de maior amplitude na Gen 1" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

No gráfico de saldos abaixo, dá para ver a compensação funcionando na prática: no segundo time, **Chansey (`+130` HP)** e **Mewtwo (`+10` SPE)** cobrem exatamente os déficits de Poliwhirl (`-55`), Persian (`-60`), Omastar (`-5`) e Muk (`-20`), fechando na conta exata de **720 pts (`+0`)**.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 06/10 • SALDOS VS. ARCEUS</span>
    <strong class="themed-chart-title">Saldo por Status vs. Faixa de 120 pts (Arceus)</strong>
    <span class="themed-chart-sub">Comparativo de saldos positivos e negativos para 3 times que superam 720 pts</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/06_times_vs_arceus-light.webp" alt="Saldos positivos e negativos por status de 3 times que superam o Arceus" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/06_times_vs_arceus-dark.webp" alt="Saldos positivos e negativos por status de 3 times que superam o Arceus" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

---

## Desafio 2: Perder para o Magikarp (≤ 200 pts)

No outro extremo, usei o **Algoritmo Húngaro** para encontrar a menor soma possível sem repetir Pokémon:

- **Pior combinação absoluta:** **80 pontos** (Diglett `10` HP, Magikarp `10` ATK, Chansey `5` DEF, Caterpie `20` SPA, Weedle `20` SPD, Slowpoke `15` SPE).
- **Pior combinação só com estágios finais:** **175 pontos** (Dugtrio `35` HP, Chansey `5` ATK, Jynx `35` DEF, Onix `30` SPA, Tangela `40` SPD, Parasect `30` SPE).

> [!warning] A armadilha (e o trunfo) da Chansey
> A **Chansey** é simultaneamente a peça mais valiosa para vencer o Arceus (`250` de HP) e a melhor âncora para perder do Magikarp (`5` de ATK e `5` de DEF). Se ela cair no slot errado no meio da partida, pode destruir sua run em qualquer um dos dois modos!

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 07/10 • SALDOS VS. MAGIKARP</span>
    <strong class="themed-chart-title">Saldo por Status vs. Faixa de 33 pts (Magikarp)</strong>
    <span class="themed-chart-sub">Comparativo dos piores times da Gen 1 frente ao teto de 200 pts</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/07_piores_times_vs_magikarp-light.webp" alt="Saldos por status dos piores times comparados à faixa de 33 pts" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/07_piores_times_vs_magikarp-dark.webp" alt="Saldos por status dos piores times comparados à faixa de 33 pts" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

---

## O veredito combinatório (e o primeiro plot twist)

Computando a soma exata de todos os **10,72 trilhões** de times possíveis[^2], chegamos à curva completa da Gen 1:

| Cenário | Combinações Válidas | Probabilidade | Chance Aproximada |
| :--- | ---: | ---: | :--- |
| **≤ Magikarp (≤ 200 pts)** | 1.426.963.484 | 0,013311% | **1 em 7.512** |
| **Faixa Intermediária (201 a 719 pts)** | 10.716.745.201.482 | 99,971573% | Maioria absoluta |
| **≥ Arceus (≥ 720 pts)** | 1.620.378.634 | 0,015116% | **1 em 6.616** |

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 08/10 • DISTRIBUIÇÃO EXATA</span>
    <strong class="themed-chart-title">A Curva Completa dos 10,72 Trilhões de Times</strong>
    <span class="themed-chart-sub">Universo exato: 10.719.792.543.600 times possíveis (Gen 1) • Faixas de 5 pts</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/08_distribuicao_probabilidade-light.webp" alt="Curva completa da distribuição de probabilidade com zoom nas caudas do Magikarp e Arceus" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/08_distribuicao_probabilidade-dark.webp" alt="Curva completa da distribuição de probabilidade com zoom nas caudas do Magikarp e Arceus" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

**Plot twist 1 (no sorteio cego):** sem nenhuma escolha entre rodadas, **perder para o Magikarp (1 em 7.512) é ligeiramente mais raro do que superar o Arceus (1 em 6.616)**. Pela curva de tentativas independentes $1 - (1 - p)^k$, seriam necessárias **4.586 tentativas** no Arceus e **5.207 tentativas** no Magikarp apenas para atingir 50% de chance de vencer uma única vez.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 09/10 • BASELINE CEGO</span>
    <strong class="themed-chart-title">Quantas Tentativas São Necessárias no Sorteio Cego?</strong>
    <span class="themed-chart-sub">Sem escolha entre rodadas, a chance acumulada segue 1 − (1 − p)^k</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/09_curva_tentativas-light.webp" alt="Curvas de probabilidade acumulada até 20.000 tentativas" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/09_curva_tentativas-dark.webp" alt="Curvas de probabilidade acumulada até 20.000 tentativas" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

---

## O jogo real: o draft `6 → 5 → 4 → 3 → 2 → 1` inverte tudo

Só que no desafio real você **escolhe** 1 par `(Pokémon, slot)` por rodada. Se uma Chansey aparecer em `DEF` na rodada 1 do desafio Arceus, basta ignorá-la — ela ainda pode aparecer em `HP` depois.

Simulando **50.000 partidas**[^3] com uma regra simples (pegar sempre o maior ou menor valor bruto disponível na rodada) contra escolher pelo **melhor percentil no slot** (quão raro aquele número é dentro daquele atributo):

- **Desafio Arceus (`≥ 720`):** a média salta de **407,6** para **541,2 pts**, e a chance de vitória sobe para **1,05%** (**~1 em 96** — **69× maior** que o sorteio cego!).
- **Desafio Magikarp (`≤ 200`):** a média cai de **407,6** para **287,3 pts**, e a chance de vitória dispara para **1,97%** (**~1 em 51** — **148× maior** que o sorteio cego!).
- **Por que valor bruto ganha de percentil (`1,05%` vs. `0,95%`)?** Porque a meta de `720` é **aditiva em pontos absolutos**, não relativa: travar um `130` em `ATK` soma `10` pontos a mais no placar final do que travar um `120` em `SPD`, mesmo que `120` esteja no topo percentual de `SPD`.

<figure class="themed-chart">
  <div class="themed-chart-head">
    <span class="themed-chart-idx">// 10/10 • SIMULAÇÃO DO DRAFT REAL</span>
    <strong class="themed-chart-title">O Jogo Real em 6 Rodadas (Sem Trocar Slot)</strong>
    <span class="themed-chart-sub">Poder escolher 1 opção por rodada torna perder para o Magikarp quase 2× mais fácil que vencer o Arceus</span>
  </div>
  <div class="themed-chart-frame">
    <img src="/images/posts/arceus-vs-magikarp-gen1/10_simulacao_draft-light.webp" alt="Comparação das distribuições e taxas de vitória em 50.000 partidas do draft real" class="chart-img chart-light" loading="lazy" />
    <img src="/images/posts/arceus-vs-magikarp-gen1/10_simulacao_draft-dark.webp" alt="Comparação das distribuições e taxas de vitória em 50.000 partidas do draft real" class="chart-img chart-dark" loading="lazy" />
  </div>
  <figcaption class="themed-chart-foot">FONTE: POKÉDEX GEN 1 (KAGGLE / POKÉMONDB) • ANÁLISE COMBINATÓRIA EXATA</figcaption>
</figure>

**Plot twist 2 (no draft real):** a assimetria da Pokédex entra em cena e **inverte a dificuldade**. Na Gen 1 existem muito mais pré-evoluções com atributos baixos (`≤ 25`) do que especialistas extremos (`≥ 120`). Por isso, escolher entre `6 → 5 → 4 → 3 → 2 → 1` opções faz **perder para o Magikarp (~1 em 51) ser quase duas vezes mais fácil do que superar o Arceus (~1 em 96)**.

<details class="method-box">
  <summary>// VER CÓDIGO DA DP COM BITMASK (COMO CALCULAMOS 10,72 TRILHÕES EM &lt; 1s)</summary>

Em vez de enumerar `10,72` trilhões de permutações, representamos o conjunto de atributos já preenchidos como uma máscara de `6` bits (`0` a `63`). O núcleo em `src/pokestats/analysis.py` faz a transição em memória em poucos milissegundos:

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

## E se abrirmos as portas de Johto (Gen 2)?

A [Geração 1](https://bulbapedia.bulbagarden.net/wiki/Generation_I) sofre daquela herança histórica do *Special* unificado — deixando apenas **3 Pokémon** acima de 120 em `SPD`. Mas quando entramos na [Geração 2](https://bulbapedia.bulbagarden.net/wiki/Generation_II) (mais **100 Pokémon** introduzidos em Johto), o cenário muda de forma radical nos dois extremos:

- **Shuckle** entra em cena com absurdos **`230` de DEF e `230` de SPD** (atacando justamente o maior gargalo da Gen 1!) — mas com **`20` de HP, `10` de ATK, `10` de SPA e `5` de SPE**. É a peça mais extrema já feita tanto para salvar o Arceus quanto para afundar o Magikarp.
- **Blissey** eleva ainda mais o teto de **HP (`255`)** e traz **`135` de SPD**, enquanto **Lugia** e **Ho-Oh** entregam **`154` de SPD** com `680` totais.
- E no fundo da tabela aparece **Sunkern**, com apenas **`180` pontos totais** (`30` em todos os 6 status — abaixo até dos `200` do Magikarp!).

Com esses monstros de variância e o novo piso de 180 pontos, o que acontece com as chances do Arceus e do Magikarp quando juntamos Johto ao sorteio? Esse é o tema da **Parte 2** — e se quiser explorar o código em Python, os testes e o Web Component do simulador, todo o projeto está aberto no repositório [`pokestats`](https://github.com/gabrielpmonte/pokestats).

---

## Notas e Referências

[^1]: Na [Geração I](https://bulbapedia.bulbagarden.net/wiki/Generation_I) original (*Red/Blue/Yellow*), *Special* era um único atributo; seguindo os filtros modernos e a tabela de [Pokémon Database](https://pokemondb.net/pokedex/all), usamos os 6 atributos (`HP`, `ATK`, `DEF`, `SPA`, `SPD`, `SPE`). O dataset (`elroytan/pokemondata`) reúne as **151 espécies** canônicas da Gen 1 mantendo os 5 Lendários/Míticos (`Mewtwo`, `Mew`, `Articuno`, `Zapdos`, `Moltres`); sem `Articuno`, apenas `Mr. Mime` e `Tentacruel` atingem `SPD ≥ 120`.
[^2]: Cálculo combinatório exato por **Programação Dinâmica com Bitmask de 6 bits** (`2^6 = 64` estados) validado contra força bruta e `soma_dp == P(151, 6)`. Os pisos mínimos foram obtidos em tempo polinomial $O(n^3)$ via **Algoritmo Húngaro** (`scipy.optimize.linear_sum_assignment`).
[^3]: A simulação de `50.000` partidas (`simulate_draft_challenge`) assume sorteio **sem reposição** entre rodadas e aplica uma heurística gulosa (não Bellman/Expectimax), com IC 95% de `±0,09%` no Arceus (`1,05%`) e `±0,12%` no Magikarp (`1,97%`). Os comparativos de Johto seguem os dados da [Geração II na Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Generation_II).

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
