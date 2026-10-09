---
title: "Revertendo string com emojis"
description: "Por que String.prototype.split('') falha com emojis compostos e grafemas complexos em JavaScript, e como resolver de forma precisa com Intl.Segmenter."
publishDate: 2021-11-26
tags: ["javascript", "unicode"]
---

Quando queremos separar uma string letra por letra ou até mesmo reverter um texto utilizamos o método [`split()`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/split), porém, existem diversos problemas em se utilizar este método. A própria documentação faz um breve comentário sobre [reverter uma String usando `split("")`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/split#revertendo_uma_string_usando_split) não ser a melhor opção.

## Problemas do `String.prototype.split("")`

Ao fazer `.split("")` a divisão não é feita "letra por letra" por conta da maneira que o JavaScript lida com strings: esta divisão pode não ocorrer como o esperado.

Por exemplo, enquanto este emoji `😃` é representado por 2 caracteres, `😶🌫️` ocupa 6 caracteres. Isto é:

```javascript
> "a".length
1
> "😃".length
2
> "😶🌫️".length
6
> "H̵̙͗ė̴̘l̴̥͒ḷ̶͂o̶̰͝".length
20
```

E o resultado de tentar utilizar este método para lidar com símbolos mais complexos é este:

```javascript
> "Rust & Go".split("")
Array(9) [ "R", "u", "s", "t", " ", "&", " ", "G", "o" ]

> "𝟘𝟙𝟚𝟛".split('')
Array(8) [ "\ud835", "\udfd8", "\ud835", "\udfd9", "\ud835", "\udfda", "\ud835", "\udfdb" ]

> '🦀 Rust & 🐹 Go'.split('')
Array(15) [ "\ud83e", "\udd80", " ", "R", "u", "s", "t", " ", "&", … ]

> "😶🌫️".split('')
Array(6) [ "\ud83d", "\ude36", "", "\ud83c", "\udf2b", "️" ]
```

## Tentativas falhas

Nenhum desses métodos resolvem o problema de fato e todos retornam o mesmo output incorreto. Emojis compostos como `[ "😶🌫️", "🏳️🌈", ...]` ainda não serão divididos corretamente.

### 1. Spread syntax (`...`)

Utilizar o [spread operator (`...`)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Spread_syntax) na String dentro de um array:

```javascript
> [..."🦀 Rust & 🐹 Go"]
Array(13) [ "🦀", " ", "R", "u", "s", "t", " ", "&", " ", "🐹", … ]

> [..."😶🌫️"]
Array(4) [ "😶", "", "🌫", "️" ]
```

### 2. `Array.from`

Nesse método o [`Array.from`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/from) te permite transformar a string em um array, mas sofre dos mesmos limites de separação por code point.

### 3. RegExp com flag `u`

Nesse método é utilizado [RegExp](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/RegExp) via `split(/(?:)/u)`, porém compromete a legibilidade e ainda pode falhar com sequências ZWJ (Zero-Width Joiner).

### 4. Método com `for...of` e Reduce

Nesse método, por conta da iteração iterar code points em vez de grafemas (clusters), é necessário acumular variáveis e a complexidade cresce sem garantir o resultado correto.

## Solução com `Intl.Segmenter`

A solução moderna é utilizar o [Intl.Segmenter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter). Ele serve para padronizar datas e textos de acordo com o locale, [permitindo obter grafemas, palavras ou sentenças de forma precisa](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter#basic_usage_and_difference_from_string.prototype.split).

### Abordagem com Generator

```javascript
function* splitEmoji(s) { 
  for (const ch of new Intl.Segmenter().segment(s)) 
    yield ch.segment;
}

console.log([...splitEmoji('😶🌫️ 🏁')].reverse());
// ['🏁', ' ', '😶🌫️']

console.log([...splitEmoji('👨👨👧👦 🇧🇷')].reverse());
// ['🇧🇷', ' ', '👨👨👧👦']
```

### Abordagem direta com Spread / `Array.from`

```javascript
const segmenter = new Intl.Segmenter();

console.log([...segmenter.segment('😶🌫️ 🏁')].map(({ segment }) => segment).reverse());
// ['🏁', ' ', '😶🌫️']

console.log(Array.from(segmenter.segment('👨👨👧👦 🇧🇷')).map(({ segment }) => segment).reverse());
// ['🇧🇷', ' ', '👨👨👧👦']
```
