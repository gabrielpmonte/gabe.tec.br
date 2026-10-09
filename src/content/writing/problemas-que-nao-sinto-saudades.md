---
title: "Problemas que não sinto saudades"
description: "Reflexões sobre o caos de gerenciar pacotes, PPAs quebradas no Ubuntu e Elementary OS versus a abordagem declarativa no NixOS."
publishDate: 2024-11-16
tags: ["linux", "nixos", "nix"]
---

## Relembrando o Caos do `apt`

Ontem ajudei uma amiga a instalar o Elementary OS em seu notebook. O processo de instalação correu bem até chegarmos à parte de instalação de programas como Docker, algumas IDEs da JetBrains, PostgreSQL e outras ferramentas. Foi então que me lembrei do caos que é gerenciar pacotes em sistemas baseados no `apt`.

Sou usuário de NixOS há alguns anos e me acostumei a configurar o sistema operacional de forma declarativa, caso quisesse instalar a `steam`, `idea-ultimate`, `docker`, faria mais ou menos assim:

```nix
home.packages = with pkgs; [
    jetbrains.idea-ultimate
];

programs.steam.enable = true;
virtualisation.docker.enable = true;
```

Porém, no Elementary OS (baseado em Ubuntu), pode instalar os pacotes de algumas formas:
- Alguns estão disponíveis como `.deb`, mas frequentemente dependem de bibliotecas que precisam ser instaladas manualmente.  
- Outros como `.AppImage`, mas requerem configuração adicional para integração com o sistema.  
- Alguns softwares exigem a adição de PPAs (Personal Package Archive).

Então levei um tempo até conseguir ajudá-la a instalar os programas. Completamente *skill issue* da minha parte, porém não sinto saudades de passar por isso. 

## O Problema com as PPAs

Um dos momentos mais frustrantes foi tentar instalar o **pgAdmin 4**, seguindo o [tutorial oficial](https://www.pgadmin.org/download/pgadmin-4-apt/):  

```sh
# Instale a chave pública do repositório:
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg

# Crie o arquivo de configuração do repositório:
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update'

# Instale o pgadmin4:
sudo apt install pgadmin4
```  

Embora o processo pareça simples e direto, o problema surgiu no trecho:  

```sh
curl -fsS https://.../pgadmin4/apt/$(lsb_release -cs)
```  

O comando `lsb_release -cs` retorna o codename do sistema operacional. Em distribuições baseadas no `Ubuntu 22.04 LTS`, como o Elementary OS, seria esperado que fosse `"jammy"`. No entanto, o `Elementary OS 7.1` tem o codename `"horus"`, que não é reconhecido pelo repositório do pgAdmin. Isso resultou em um link inválido na configuração da PPA.

A solução foi editar manualmente o arquivo de repositório gerado e substituir `horus` por `jammy`. Apesar de simples, esse problema acabou passando despercebido. O que deveria ser um script simples de automatização se transformou em um pequeno contratempo, exigindo tempo e trabalho manual para ser resolvido. Essa experiência me fez lembrar o quanto aprecio usar NixOS.
