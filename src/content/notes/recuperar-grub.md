---
title: "Recuperar Grub após Dual Boot"
description: "Guia prático para restaurar o bootloader Grub no Linux após instalação ou atualização do Windows em dual boot."
publishDate: 2022-12-27
updatedDate: 2022-12-27
stage: "evergreen"
tags: ["linux", "grub", "sysadmin", "bootloader"]
aliases: ["recuperar-grub"]
---

Após fazer dual boot com o Windows ou após certas atualizações do sistema, o inicializador Grub do Linux pode desaparecer do menu de inicialização da máquina. Para recuperá-lo através de uma mídia live, siga estes passos:

## Requisitos

- Mídia de boot USB/Live com qualquer distribuição Linux.

---

## Passo a Passo

### 1. Inicializar e identificar partições

Dê boot pelo live USB e identifique em qual partição o Linux está instalado:

```bash
sudo fdisk -l
```

Exemplo de saída:

```text
Device     Boot     Start       End   Sectors   Size Id Type
/dev/sda1            2048 488978431 488976384 233,2G  7 HPFS/NTFS/exFAT
/dev/sda2  *    488978434 976769023 487790590 232,6G 83 Linux
```

Identifique a partição pelo tipo `Linux` (na coluna `Type`) e aponte o identificador em `Device` (por exemplo, `/dev/sda2` ou `/dev/nvme0n1p2`).

### 2. Montar a partição raiz

Monte a partição no diretório `/mnt` (substitua `sdX` pela sua unidade/partição correspondente):

```bash
sudo mount -t ext4 /dev/sdX /mnt
```

### 3. Reinstalar o Grub

Execute o `grub-install` apontando o diretório raiz para `/mnt` e o disco de destino:

```bash
sudo grub-install --root-directory=/mnt /dev/sdX
```

### 4. Reiniciar o sistema

Concluída a instalação, desmonte ou reinicie a máquina:

```bash
sudo reboot
```
