# gabe.tec.br

Código-fonte do site pessoal e digital garden acessível em [gabe.tec.br](https://gabe.tec.br).

O projeto consolida artigos técnicos, notas atômicas interconectadas (Zettelkasten), registros de campo e portfólio em uma única aplicação estática.

## Stack

- **Framework:** [Astro](https://astro.build) (geração estática, `output: 'static'`)
- **Linguagem:** TypeScript
- **Estilização:** CSS puro com variáveis nativas e tipografia Geist (Sans e Mono)
- **Conteúdo:** Astro Content Collections com Markdown/MDX
- **Busca:** [Pagefind](https://pagefind.app) (indexação estática pós-build)
- **Matemática:** Remark-Math e Rehype-Katex
- **Syntax Highlighting:** Shiki (temas github-light e github-dark)
- **Deploy:** GitHub Actions para GitHub Pages em domínio customizado

## Estrutura do Projeto

- `src/content/writing/`: Artigos técnicos.
- `src/content/notes/`: Notas atômicas do digital garden com wikilinks e estágios de maturação (seed, growing, evergreen).
- `src/content/field_notes/`: Registros de campo, montanhismo e fotografia documental.
- `src/pages/`: Rotas estáticas, busca local, página now e geração de imagens OpenGraph.
- `src/plugins/`: Plugins remark e rehype para suporte a wikilinks, callouts e otimização de imagens.

## Desenvolvimento

```sh
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção (Astro + Pagefind)
npm run build

# Preview do build
npm run preview

# Validação de tipos
npx astro check
```
