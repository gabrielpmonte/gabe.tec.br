---
title: "Problems I don't miss"
description: "Notes on the chaos of managing packages, broken PPAs on Ubuntu and elementary OS versus a declarative setup on NixOS."
publishDate: 2024-11-16
tags: ["linux", "nixos", "nix"]
lang: "en"
translationKey: "problemas-que-nao-sinto-saudades"
---

## Remembering the chaos of `apt`

Yesterday I helped a friend install elementary OS on her laptop. The OS installation went smoothly until we got to setting up tools like Docker, a few JetBrains IDEs, PostgreSQL, and other utilities. That immediately reminded me of how messy package management can get on `apt`-based distributions.

I have been a NixOS user for a few years and got used to declaring my system configuration. If I want to install `steam`, `idea-ultimate`, and `docker`, I write something like this:

```nix
home.packages = with pkgs; [
    jetbrains.idea-ultimate
];

programs.steam.enable = true;
virtualisation.docker.enable = true;
```

On elementary OS (which is Ubuntu-based), installing packages usually splits across multiple mechanisms:
- Some ship as `.deb` files, often requiring manual dependency resolution.
- Others come as `.AppImage`, needing extra steps for desktop integration.
- Some software requires adding PPAs (Personal Package Archives).

It took a while to get everything running for her. Mostly a *skill issue* on my part, sure, but not something I miss dealing with.

## The problem with PPAs

One of the most frustrating parts was trying to install **pgAdmin 4** by following the [official guide](https://www.pgadmin.org/download/pgadmin-4-apt/):

```sh
# Install the public key for the repository:
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg

# Create the repository configuration file:
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update'

# Install pgadmin4:
sudo apt install pgadmin4
```

The steps look straightforward until you hit this line:

```sh
curl -fsS https://.../pgadmin4/apt/$(lsb_release -cs)
```

The `lsb_release -cs` command returns the OS codename. On distributions based on Ubuntu 22.04 LTS, such as elementary OS 7.1, you might expect `"jammy"`. Instead, elementary OS 7.1 returns `"horus"`, which the pgAdmin repository does not recognize, producing an invalid PPA URL.

The fix was editing the generated repository file manually and replacing `horus` with `jammy`. Simple once spotted, yet easy to overlook. What should have been a quick automated install turned into manual debugging. Experiences like this make it very clear why I prefer NixOS.
