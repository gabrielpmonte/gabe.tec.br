---
title: "Reversing strings with emojis"
description: "Why String.prototype.split('') breaks on compound emojis and complex graphemes in JavaScript, and how to handle them accurately with Intl.Segmenter."
publishDate: 2021-11-26
tags: ["javascript", "unicode"]
lang: "en"
translationKey: "revertendo-string-com-emojis"
---

When splitting a string character by character or reversing text in JavaScript, people often reach for [`split()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split). However, MDN itself warns that [reversing a string using `split("")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split#reversing_a_string_using_split) breaks on non-BMP characters.

## Problems with `String.prototype.split("")`

Calling `.split("")` splits by UTF-16 code units rather than visual characters (grapheme clusters), which leads to corrupted output on emojis and combining marks.

For instance, `😃` takes 2 UTF-16 code units, while `😶🌫️` takes 6:

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

Trying to split strings with these characters produces broken surrogate pairs and stray modifiers:

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

## Approaches that fall short

None of the common workarounds handle compound emojis like `[ "😶🌫️", "🏳️🌈", ...]` reliably because they operate on code points instead of grapheme clusters.

### 1. Spread syntax (`...`)

Using the [spread operator (`...`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) iterates over Unicode code points, which fixes single emojis but still splits ZWJ (Zero-Width Joiner) sequences:

```javascript
> [..."🦀 Rust & 🐹 Go"]
Array(13) [ "🦀", " ", "R", "u", "s", "t", " ", "&", " ", "🐹", … ]

> [..."😶🌫️"]
Array(4) [ "😶", "", "🌫", "️" ]
```

### 2. `Array.from`

[`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) converts the string into an array using the same string iterator, so it hits the exact same code-point limitation.

### 3. RegExp with the `u` flag

Using [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) via `split(/(?:)/u)` hurts readability and still breaks on ZWJ sequences.

### 4. `for...of` and `reduce`

Because `for...of` also iterates over code points rather than grapheme clusters, you end up managing manual state without guaranteeing correct results across all Unicode sequences.

## The `Intl.Segmenter` solution

The standard modern approach is [`Intl.Segmenter()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter), which provides locale-aware text segmentation and [extracts grapheme clusters, words, or sentences accurately](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter#basic_usage_and_difference_from_string.prototype.split).

### Generator approach

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

### Direct approach with Spread / `Array.from`

```javascript
const segmenter = new Intl.Segmenter();

console.log([...segmenter.segment('😶🌫️ 🏁')].map(({ segment }) => segment).reverse());
// ['🏁', ' ', '😶🌫️']

console.log(Array.from(segmenter.segment('👨👨👧👦 🇧🇷')).map(({ segment }) => segment).reverse());
// ['🇧🇷', ' ', '👨👨👧👦']
```
