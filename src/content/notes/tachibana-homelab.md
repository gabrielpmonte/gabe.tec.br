---
title: "Tachibana: Arquitetura do Homelab & Infraestrutura Pessoal"
description: "Documentação viva do homelab Tachibana: nós de computação local (Fedora Server + i5-8500), Podman Quadlets rootless, túnel Rathole para VPS pública, Tailscale mesh e stack *arr/Jellyfin."
publishDate: 2026-10-08
updatedDate: 2026-10-08
stage: "evergreen"
tags: ["homelab", "linux", "podman", "infraestrutura", "redes"]
aliases: ["tachibana", "homelab"]
---

O **Tachibana** é o nó primário de computação e armazenamento da minha infraestrutura pessoal auto-hospedada (*self-hosted*). Ele opera sob uma topologia híbrida: processamento local de alta performance com aceleração por hardware combinado com a VPS de borda pública [[wired-vps]] para contornar CGNAT residencial e expor serviços críticos com baixa latência e segurança estrita. O ecossistema também conta com o nó de suporte [[navi-homelab]] (Raspberry Pi 4).

Por ser um sistema vivo e em refinamento contínuo, esta nota é mantida no estágio **evergreen** como referência central de configuração, decisões arquiteturais e mapeamento de portas.

---

## 1. Especificações de Hardware & Sistema

> [!note] Filosofia de Hardware
> Priorização de eficiência energética, silêncio e capacidade de decodificação/transcodificação de vídeo em tempo real via silício dedicado Intel QuickSync (QSV), operando 24/7 sem necessidade de GPU discreta consumindo energia em *idle*.

| Componente | Especificação Técnica | Papel no Nó |
| :--- | :--- | :--- |
| **Processador** | Intel® Core™ i5-8500 (6C/6T @ 3.00 GHz base, 4.10 GHz boost) | Computação geral, transcodificação QSV |
| **Gráficos Integrados** | Intel® UHD Graphics 630 (`/dev/dri/renderD128`) | Aceleração por hardware no Jellyfin (VA-API / QSV) |
| **Memória RAM** | 16 GB DDR4 (15 GiB endereçáveis + 8 GB zram swap) | Alocação para containers e cache de I/O |
| **Armazenamento** | 512 GB NVMe SSD (`nvme0n1` LVM2 sobre XFS) | Sistema base, bancos MariaDB e metadados rápidos |
| **Sistema Operacional** | Fedora Linux 44 (Server Edition) — Kernel 7.2 | Base estável, SELinux ativo e suporte de ponta a Quadlets |

---

## 2. Topologia de Rede & Ingress Híbrido

O maior desafio de um homelab residencial é a presença de **CGNAT (Carrier-Grade NAT)** e a falta de IPv4 público fixo. A arquitetura do Tachibana resolve isso através de três camadas coordenadas:

```
[ Usuários / Internet ]
         │
         ▼
[ VPS Pública Wired ([[wired-vps]]) (191.252.218.186) ]  ◄── Rathole Server (TCP Multiplex)
         │
         │ (Túnel Criptografado de Alta Velocidade)
         ▼
[ Tachibana (Homelab Local) ]                            ◄── Rathole Client + Caddy Reverse Proxy
         │
    ┌────┴───────────────────────────┐
    ▼                                ▼
[ Podman Pods (arr / torrent) ]  [ Tailscale Mesh (100.64.0.0/10) ]
(Isolamento e VPN Killswitch)    (Acesso Administrativo Restrito)
```

### Camadas de Tráfego:

1. **Rathole (NAT Traversal Rust-based):**
   - Um cliente leve e de alta performance escrito em Rust (`rathole-client.service`) conecta-se à VPS remota [[wired-vps]] na porta `2333`.
   - Serviços de alta demanda de banda como **Jellyfin** (`:8096`) e **Navidrome** (`:4533`) são multiplexados diretamente por este canal TCP, garantindo taxa de transferência nativa sem gargalos de CPU.

2. **Caddy Reverse Proxy (`localhost/caddy-cloudflare`):**
   - Gerencia certificados TLS automáticos via Cloudflare DNS-01 Challenge (`cf_tls`), permitindo certificados SSL válidos mesmo em serviços que nunca abrem portas HTTP no firewall residencial.
   - Aplica a diretiva `(local_only)` para proteger painéis administrativos (AdGuard Home, Lidarr, Grimmory, Bindery), permitindo requisições apenas originadas da LAN privada (`192.168.0.0/16`) ou da malha do **Tailscale** (`100.64.0.0/10`).

3. **Tailscale Mesh VPN:**
   - Rede segura ponto-a-ponto WireGuard (`100.113.31.106`) para manutenção SSH remota sem expor a porta 22 para a internet aberta.

---

## 3. Runtime de Containers: Systemd Quadlets & Podman Rootless

Diferente de instalações convencionais dependentes de um daemon Docker monolítico rodando como root, o Tachibana utiliza **Podman Rootless gerenciado nativamente pelo Systemd através de Quadlets** (`~/.config/containers/systemd/`).

> [!tip] Benefícios dos Quadlets
> 1. **Zero Daemon:** Sem processos fantasmas em segundo plano; cada container é um processo filho de um serviço systemd isolado.
> 2. **Supervisão do SO:** O systemd gerencia reinicializações automáticas (`Restart=always`), dependências de ordem de boot (`After=network-online.target`) e timeouts.
> 3. **Segurança SELinux:** Volumes montados com o sufixo `:Z` respeitam as políticas de confinamento do Fedora.

### Organização em Pods (Estilo Kubernetes)

Os containers interdependentes compartilham o mesmo *Network Namespace* e *IPC* através de definições de `.pod`:

#### A. `torrent.pod` (Isolamento com Killswitch)
- **Gluetun (`gluetun.container`):** Estabelece o túnel WireGuard VPN.
- **qBittorrent (`qbittorrent.container`):** Roteado diretamente **através** da interface de rede do Gluetun. Se o túnel cair, todo o tráfego do cliente de torrent é abortado instantaneamente, impedindo vazamento de IP residencial.

#### B. `arr.pod` (Automação de Mídia)
- **Sonarr** (`:8989`), **Radarr** (`:7878`), **Prowlarr** (`:9696`), **Lidarr** (`:8686`), **Bazarr** (`:6767`).
- **FlareSolverr:** Bypassa verificações Cloudflare em indexers públicos.
- **Cleanuparr:** Limpeza automatizada de downloads incompletos ou órfãos.

#### C. `streamystats.pod` (Analytics de Streaming)
- Frontend Next.js (`streamystats-web`) + Daemon de ingestão em segundo plano (`streamystats-job`) e banco de dados para métricas de reprodução do Jellyfin.

#### D. `grimmory.pod` (Biblioteca de Mangás/Livros)
- Servidor Grimmory acoplado a uma instância dedicada de MariaDB 11.4.

---

## 4. Aceleração de Hardware: Jellyfin Transcoding

Para garantir reprodução suave em clientes móveis ou com largura de banda restrita sem sobrecarregar os 6 núcleos da CPU, o container do Jellyfin mapeia diretamente o dispositivo de renderização do processador Intel Coffee Lake:

```ini
# ~/.config/containers/systemd/jellyfin.container
[Container]
Image=docker.io/jellyfin/jellyfin:latest
GroupAdd=keep-groups
AddDevice=/dev/dri/renderD128:/dev/dri/renderD128
Volume=%h/services/jellyfin/config:/config:Z
Volume=%h/data/media:/media:ro
PublishPort=127.0.0.1:8096:8096
```

Com o driver VA-API / QSV ativo, formatos modernos como HEVC 10-bit e H.264 são convertidos em tempo real na GPU integrada com menos de 5% de consumo de CPU.

---

## 5. Mapeamento de Serviços e Subdomínios

Todos os serviços operam sob o domínio `gabe.tec.br` com roteamento configurado no Caddy:

| Serviço | Subdomínio | Tipo / Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| **Jellyfin** | `flix.gabe.tec.br` | Público (via Rathole) | Streaming de filmes, séries e animes |
| **Jellyseerr** | `catalogo.gabe.tec.br` | Público | Portal de requisições de mídia |
| **Navidrome** | `music.gabe.tec.br` | Público (via Rathole) | Servidor de streaming de música (Subsonic) |
| **Homepage** | `home.gabe.tec.br` | Restrito / LAN | Dashboard central com status de containers |
| **qBittorrent** | `qb.gabe.tec.br` | Restrito (Gluetun) | Cliente de download |
| **Sonarr / Radarr** | `sonarr.` / `radarr.` | Restrito / Tailscale | Automação e indexação de séries e filmes |
| **AdGuard Home** | `dns.gabe.tec.br` | Restrito (Porta 53/DNS) | Bloqueador de anúncios e DoH na rede local |
| **Dozzle** | `dozzle.gabe.tec.br` | Restrito / Tailscale | Visualizador de logs em tempo real dos containers |
| **Pelican Panel** | `games.gabe.tec.br` | Público | Gerenciamento de servidores de jogos (Minecraft) |
| **Grimmory** | `books.gabe.tec.br` | Restrito / Local | Leitor e gerenciador de mangás/livros |
| **Bindery** | `bindery.gabe.tec.br` | Restrito / Local | Utilitário de formatação de cadernos/livros |

---

## 6. Próximos Passos & Evolução Contínua

- [ ] Expansão de armazenamento em array redundante dedicado (ZFS ou Btrfs RAID1 em discos mecânicos para cold storage de mídia).
- [ ] Rotina automatizada de backup de volumes com Restic enviando snapshots criptografados para armazenamento offsite S3/Backblaze.
- [ ] Alertas de telemetria via Gotify ou Webhooks no Discord monitorando integridade de containers e espaço em disco via SMART.
