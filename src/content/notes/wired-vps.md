---
title: "Wired: Arquitetura da VPS de Borda & Ingress Público"
description: "Documentação viva da VPS Wired (Debian 13 Trixie, Xen): ponto de presença público com IPv4 dedicado, terminação TLS via Caddy e terminação de túnel Rathole para o homelab Tachibana."
publishDate: 2026-10-08
updatedDate: 2026-10-08
stage: "evergreen"
tags: ["vps", "linux", "infraestrutura", "redes", "debian"]
aliases: ["wired", "vps"]
---

O **Wired** (hostname `vps71744`) opera como o *Point of Presence* (PoP) e gateway de borda (*Edge Gateway*) da minha infraestrutura pessoal. Em uma topologia homelab moderna, manter servidores potentes em ambiente residencial traz inúmeras vantagens de armazenamento e computação com silício dedicado (como no [[tachibana-homelab]]), mas esbarra no isolamento de rede imposto pelo CGNAT das operadoras e na ausência de IPv4 público fixo.

O Wired resolve este desafio: hospedado em datacenter com conectividade de baixa latência e endereço IPv4 dedicado, ele atua como o ponto de terminação TLS e multiplexador de tráfego, encaminhando requisições de forma segura e transparente para o nó local.

---

## 1. Especificações de Hardware & Virtualização

> [!note] Princípio de Operação Minimalista
> Como a VPS executa estritamente funções de roteamento, terminação SSL e túnel reverso, o sistema foi projetado para operar com consumo de memória inferior a 400 MiB e footprint de disco irrisório (menos de 6% do disco em uso).

| Componente | Especificação Técnica | Papel no Nó |
| :--- | :--- | :--- |
| **Virtualizador** | Xen HVM / Paravirtualizado | Camada de abstração de hardware em nuvem |
| **Processador** | Intel® Xeon® Silver 4214 (2 vCPUs @ 2.20 GHz) | Roteamento de pacotes e criptografia TLS |
| **Memória RAM** | 1 GB (963 MiB total, ~383 MiB em uso, 953 MiB swap) | Buffer de socket TCP e runtime Caddy/Rathole |
| **Armazenamento** | 40 GB (`xvda3` ext4, apenas 1.9 GB utilizado — 6%) | Sistema operacional enxuto e logs essenciais |
| **Sistema Operacional** | Debian GNU/Linux 13 (Trixie) — Kernel 6.12.63 | Base de alta estabilidade e previsibilidade de pacotes |
| **Conectividade** | Interface `enX0` com IPv4 público dedicado (`191.252.218.186`) | Gateway de entrada WAN da infraestrutura |

---

## 2. Topologia de Ingress & Arquitetura de Portas

O tráfego de entrada dos usuários na internet chega ao IP público do Wired e é roteado conforme a natureza do serviço:

```
[ Internet / Clientes WAN ]
             │
             ├──► [ Portas 80/443 (HTTP/HTTPS) ] ──► Caddy Reverse Proxy (TLS Automático)
             │                                          │
             │                                          ├──► 127.0.0.1:18096 (Túnel Rathole) ──► [[tachibana-homelab]] (Jellyfin)
             │                                          └──► 127.0.0.1:14533 (Túnel Rathole) ──► [[tachibana-homelab]] (Navidrome)
             │
             └──► [ Porta 25565 (TCP Game) ] ────────► Rathole Server ────────────────────────► [[tachibana-homelab]] (Minecraft)
```

### Mapeamento Detalhado de Processos em Escuta:

| Porta / Binding | Processo / PID | Visibilidade | Finalidade Técnica |
| :--- | :--- | :--- | :--- |
| `0.0.0.0:2333` | `rathole` | Pública | Porta de controle e handshake do túnel. O [[tachibana-homelab]] conecta-se aqui como cliente autenticado. |
| `*:80`, `*:443` | `caddy` | Pública | Ponto de entrada web público. Gerencia certificados TLS automáticos Let's Encrypt/ZeroSSL e encerra conexões HTTPS. |
| `0.0.0.0:25565` | `rathole` | Pública | Encaminhamento direto de tráfego TCP bruto para o servidor de Minecraft hospedado no Pelican Panel do nó local. |
| `127.0.0.1:18096` | `rathole` | Loopback Privado | Ponta receptora do túnel para o **Jellyfin** (`:8096` no Tachibana). Isolada no localhost da VPS para forçar a passagem pelo Caddy. |
| `127.0.0.1:14533` | `rathole` | Loopback Privado | Ponta receptora do túnel para o **Navidrome** (`:4533` no Tachibana), consumida pelo upstream do Caddy. |
| `127.0.0.1:2019` | `caddy` | Loopback Privado | Endpoint administrativo interno e controle dinâmico da API do Caddy. |
| `0.0.0.0:22` | `sshd` | Pública | Acesso de manutenção remota protegido por chave criptográfica Ed25519. |

---

## 3. Por que Rathole sobre a VPS?

A escolha do **Rathole** (implementado em Rust) sobre túneis tradicionais como SSH Port Forwarding, FRP ou VPNs pesadas baseia-se em eficiência de transferência de dados:

1. **Multiplexação Nativa em TCP:** Uma única conexão TCP transporta múltiplos fluxos de streaming de mídia simultâneos, reduzindo o *handshake overhead* e a fragmentação de janelas de controle de congestionamento.
2. **Zero Garbage Collection:** Com menos de 20 MiB de consumo de memória RAM por instância, o Rathole não sofre com pausas de GC em momentos de alto pico de throughput (como streaming de vídeo 4K remux via Jellyfin).
3. **Resiliência a Quedas:** Caso a conexão residencial do [[tachibana-homelab]] oscile, o cliente reconecta em microssegundos sem requerer intervenção manual no Wired.

---

## 4. Integração no Ecossistema

O Wired integra a malha ao lado dos outros nós da topologia pessoal:

- **[[tachibana-homelab]]:** Nó de computação pesada, decodificação por hardware Intel QSV e orquestração de containers com Podman Quadlets.
- **[[navi-homelab]]:** Nó satélite de baixo consumo energético baseado em Raspberry Pi 4 / DietPi para monitoramento contínuo e serviços secundários.
- **Conectividade Administrativa:** Paralelamente ao Rathole, os nós mantêm conectividade interna e remota via malha privada do Tailscale.