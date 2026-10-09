---
title: "Navi: Arquitetura do Homelab & Infraestrutura Pessoal"
description: "Documentação viva do nó homelab Navi: Raspberry Pi 4 Model B (1GB) rodando DietPi, atuando como nó satélite de baixo consumo."
publishDate: 2026-10-08
updatedDate: 2026-10-08
stage: "seed"
tags: ["homelab", "linux", "infraestrutura", "redes", "arm"]
aliases: ["navi", "homelab"]
---

O **Navi** é o nó satélite de baixo consumo energético da minha infraestrutura pessoal. Operando sobre um **Raspberry Pi 4 Model B (1 GB RAM)** com a distribuição minimalista **DietPi**, sua função é fornecer serviços leves e essenciais 24/7 com consumo elétrico irrisório (~3 a 5 Watts).

Diferente do nó de computação pesada e mídia [[tachibana-homelab]] e da VPS de borda pública [[wired-vps]], o Navi foi projetado para alta eficiência em arquitetura ARM64.

---

## 1. Especificações de Hardware

| Componente | Especificação Técnica | Papel no Nó |
| :--- | :--- | :--- |
| **Placa / SBC** | Raspberry Pi 4 Model B | Computação de baixo consumo contínuo |
| **SoC / CPU** | Broadcom BCM2711, quad-core Cortex-A72 (ARM v8) 64-bit @ 1.5 GHz | Execução de tarefas leves em background |
| **Memória RAM** | 1 GB LPDDR4 | Footprint otimizado via DietPi |
| **Sistema Operacional** | DietPi (Debian-based ARM64) | Base enxuta sem daemons desnecessários |
| **Rede** | Gigabit Ethernet / Wi-Fi | Conexão cabeada na rede local |

---

## 2. Papel no Ecossistema

- Opera em conjunto com o [[tachibana-homelab]] na rede local.
- Conecta-se à infraestrutura remota e à VPS [[wired-vps]] através da malha privada do Tailscale.

*(Nota em estágio seed — em evolução conforme novos serviços e métricas forem documentados)*