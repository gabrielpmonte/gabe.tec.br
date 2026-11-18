# Diretrizes de Escrita para Conteúdo (`src/content/`)

Estas regras aplicam-se automaticamente a qualquer artigo, nota do digital garden ou relato em `src/content/`.

## 1. Tom e Estrutura
- Escreva em português brasileiro natural, direto e pragmático, como um engenheiro documentando um problema real para outros engenheiros.
- Comece direto pelo problema, experimento ou fato observado. Evite aberturas genéricas (*"parece simples na superfície..."*, *"no cenário atual..."*), subtítulos batidos (*"A anatomia de..."*, *"plot twist"*) e fechamentos vazios.
- Explicite premissas e limitações metodológicas (ex.: versão de dataset, regras de simulação, heurísticas vs. soluções ótimas).

## 2. Formatação e Pontuação
- Nunca use emojis.
- Evite travessões (`—`) no meio ou fim de frases; prefira vírgulas, parênteses ou duas frases curtas.
- Não salpique `**negrito**` em números, termos ou palavras soltas dentro dos parágrafos. Reserve negrito para rótulos estruturais de lista e pontos-chave pontuais.
- Evite estruturas repetitivas de contraste binário (*"É X, não Y"*) e listas onde todo item começa com **Rótulo:** explicando o óbvio.

## 3. Vocabulário e Precisão
- **Falsos cognatos proibidos:** *assumir* (use supor/considerar), *endereçar* (use resolver/tratar), *eventualmente* (use com o tempo/no fim), *rodar contra* (use rodar em), *performar/performático* (use ser rápido/ter bom desempenho), *destravar* / *alavancar* / *robusto* / *crucial*.
- **Termos técnicos em inglês mantidos naturalmente:** `pipeline`, `backfill`, `upsert`, `merge`, `query`, `deploy`, `commit`, `PR`, `staging`, `raw`, `curated`, `throughput`, `payload`.
- **Precisão do domínio:** use a terminologia consagrada da área (ex.: em matemática, diferencie *arranjo*, *permutação* e *combinação*; em Pokémon, use *status* / `HP`, `Atk`, `Def`, `SpA`, `SpD`, `Spe`).
