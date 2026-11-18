"""Generate light/dark WebP charts for Arceus vs. Magikarp Part 2."""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from PIL import Image

THEMES = {
    "light": {
        "bg": "#ffffff",
        "surface": "#f8f8f9",
        "grid": "#e4e4e7",
        "spine": "#a1a1aa",
        "text": "#09090b",
        "muted": "#3f3f46",
        "dim": "#52525b",
        "amber": "#b45309",
        "emerald": "#047857",
        "blue": "#1d4ed8",
        "slate": "#71717a",
    },
    "dark": {
        "bg": "#15171c",
        "surface": "#1c1f26",
        "grid": "#2c303a",
        "spine": "#4a505e",
        "text": "#eeeeec",
        "muted": "#c2c7d0",
        "dim": "#8b93a1",
        "amber": "#f59e0b",
        "emerald": "#34d399",
        "blue": "#60a5fa",
        "slate": "#94a3b8",
    },
}


def save_webp(fig: plt.Figure, out_path: Path) -> None:
    tmp_png = out_path.with_suffix(".png")
    fig.savefig(tmp_png, dpi=180, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    with Image.open(tmp_png) as img:
        img.save(out_path, format="WEBP", quality=92, method=6)
    tmp_png.unlink()


def apply_theme(ax: plt.Axes, t: dict[str, str]) -> None:
    ax.set_facecolor(t["bg"])
    ax.grid(True, linestyle="--", linewidth=0.6, color=t["grid"], alpha=0.9)
    ax.set_axisbelow(True)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(t["spine"])
        ax.spines[side].set_linewidth(0.8)
    ax.tick_params(colors=t["muted"], labelsize=9)
    ax.xaxis.label.set_color(t["muted"])
    ax.yaxis.label.set_color(t["muted"])


def plot_chart1_gen1_distributions(
    results: dict, out_dir: Path, theme_name: str, t: dict[str, str]
) -> None:
    dists = results["gen1_distributions"]
    greedy = np.array(dists["arceus_greedy"], dtype=np.float64)
    expectimax = np.array(dists["arceus_expectimax"], dtype=np.float64)

    fig, (ax_main, ax_tail) = plt.subplots(
        1,
        2,
        figsize=(11, 4.3),
        gridspec_kw={"width_ratios": [1.55, 1.0]},
        facecolor=t["bg"],
    )
    fig.subplots_adjust(wspace=0.24)

    # Left panel: full score distribution
    apply_theme(ax_main, t)
    bins = np.arange(320, 820, 12)
    ax_main.hist(
        greedy,
        bins=bins,
        density=True,
        alpha=0.25,
        color=t["slate"],
        edgecolor=t["slate"],
        linewidth=0.7,
        label=f"Guloso (média {greedy.mean():.1f})",
    )
    ax_main.hist(
        expectimax,
        bins=bins,
        density=True,
        alpha=0.32,
        color=t["blue"],
        edgecolor=t["blue"],
        linewidth=0.8,
        label=f"Expectimax (média {expectimax.mean():.1f})",
    )
    ax_main.axvline(720, color=t["amber"], linestyle="--", linewidth=1.3, label="Meta Arceus (720)")
    ax_main.axvline(greedy.mean(), color=t["slate"], linestyle=":", linewidth=1.2)
    ax_main.axvline(expectimax.mean(), color=t["blue"], linestyle=":", linewidth=1.2)
    ax_main.set_title("Distribuição completa (50.000 partidas)", color=t["text"], fontsize=10.5, loc="left", pad=10)
    ax_main.set_xlabel("Pontuação final do time", fontsize=9.5)
    ax_main.set_ylabel("Densidade", fontsize=9.5)
    ax_main.legend(frameon=False, fontsize=8.5, labelcolor=t["text"], loc="upper left")

    # Right panel: zoom on right tail (>= 680)
    apply_theme(ax_tail, t)
    tail_bins = np.arange(680, 810, 10)
    g_tail = greedy[greedy >= 680]
    e_tail = expectimax[expectimax >= 680]
    g_counts, _ = np.histogram(g_tail, bins=tail_bins)
    e_counts, _ = np.histogram(e_tail, bins=tail_bins)
    g_pct = (g_counts / len(greedy)) * 100.0
    e_pct = (e_counts / len(expectimax)) * 100.0

    g_win_pct = (greedy >= 720).mean() * 100.0
    e_win_pct = (expectimax >= 720).mean() * 100.0
    centers = (tail_bins[:-1] + tail_bins[1:]) / 2.0
    w = 4.0
    ax_tail.bar(centers - w / 2, g_pct, width=w, color=t["slate"], alpha=0.65, label=f"Guloso ({g_win_pct:.2f}%)")
    ax_tail.bar(centers + w / 2, e_pct, width=w, color=t["blue"], alpha=0.88, label=f"Expectimax ({e_win_pct:.2f}%)")
    ax_tail.axvline(720, color=t["amber"], linestyle="--", linewidth=1.3)
    ax_tail.set_title("Zoom na cauda vencedora (≥ 680 pts)", color=t["text"], fontsize=10.5, loc="left", pad=10)
    ax_tail.set_xlabel("Pontuação final", fontsize=9.5)
    ax_tail.set_ylabel("% das 50.000 partidas", fontsize=9.5)
    ax_tail.legend(frameon=False, fontsize=8.5, labelcolor=t["text"], loc="upper right")

    save_webp(fig, out_dir / f"01_gen1_guloso_vs_expectimax-{theme_name}.webp")


def plot_chart2_scaling(
    results: dict, out_dir: Path, theme_name: str, t: dict[str, str]
) -> None:
    scaling = results["scaling"]
    labels = [s["pool"] for s in scaling]
    x = np.arange(len(labels))

    arc_g = [s["arceus"]["greedy_rate"] * 100 for s in scaling]
    arc_e = [s["arceus"]["expectimax_rate"] * 100 for s in scaling]
    mag_g = [s["magikarp"]["greedy_rate"] * 100 for s in scaling]
    mag_e = [s["magikarp"]["expectimax_rate"] * 100 for s in scaling]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.3), facecolor=t["bg"])
    fig.subplots_adjust(wspace=0.24)

    for ax, g_vals, e_vals, title, color_e in (
        (ax1, arc_g, arc_e, "Desafio Arceus (≥ 720 pts)", t["blue"]),
        (ax2, mag_g, mag_e, "Desafio Magikarp (≤ 200 pts)", t["emerald"]),
    ):
        apply_theme(ax, t)
        ax.plot(x, g_vals, marker="o", markersize=4.5, linewidth=1.7, linestyle="--", color=t["slate"], label="Guloso")
        ax.plot(x, e_vals, marker="o", markersize=5.0, linewidth=2.2, color=color_e, label="Expectimax")
        ax.fill_between(x, g_vals, e_vals, color=color_e, alpha=0.10)
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=28, ha="right", fontsize=8.2)
        ax.set_ylabel("Taxa de vitória (%)", fontsize=9.5)
        ax.set_title(title, color=t["text"], fontsize=10.5, loc="left", pad=10)
        ax.legend(frameon=False, fontsize=8.5, labelcolor=t["text"], loc="upper left")

        # Annotate first and last Expectimax values
        for xi in (0, len(x) - 1):
            ax.annotate(
                f"{e_vals[xi]:.2f}%",
                (x[xi], e_vals[xi]),
                textcoords="offset points",
                xytext=(0, 8),
                ha="center",
                fontsize=8,
                color=color_e,
                fontweight="bold",
            )

    save_webp(fig, out_dir / f"02_escala_gen1_a_gen9-{theme_name}.webp")


def plot_chart3_anatomy(
    results: dict, out_dir: Path, theme_name: str, t: dict[str, str]
) -> None:
    anat = results["gen_anatomy"]
    labels = [f"{a['gen']}\n({a['count']})" for a in anat]
    x = np.arange(len(labels))
    medians = [a["stat_median"] for a in anat]
    p95s = [a["stat_p95"] for a in anat]
    spd120 = [a["spd_120_plus"] for a in anat]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.3), facecolor=t["bg"])
    fig.subplots_adjust(wspace=0.24)

    apply_theme(ax1, t)
    ax1.plot(x, p95s, marker="s", markersize=4.5, linewidth=2.0, color=t["amber"], label="Percentil 95")
    ax1.plot(x, medians, marker="o", markersize=4.5, linewidth=2.0, color=t["blue"], label="Mediana")
    ax1.fill_between(x, medians, p95s, color=t["amber"], alpha=0.08)
    ax1.set_xticks(x)
    ax1.set_xticklabels(labels, fontsize=8)
    ax1.set_ylabel("Pontos por status", fontsize=9.5)
    ax1.set_title("Mediana vs. P95 dos status por geração", color=t["text"], fontsize=10.5, loc="left", pad=10)
    ax1.legend(frameon=False, fontsize=8.5, labelcolor=t["text"], loc="upper left")

    apply_theme(ax2, t)
    bars = ax2.bar(x, spd120, width=0.58, color=t["emerald"], alpha=0.82)
    ax2.set_xticks(x)
    ax2.set_xticklabels(labels, fontsize=8)
    ax2.set_ylabel("Espécies elegíveis", fontsize=9.5)
    ax2.set_title("Espécies com SpD ≥ 120 por geração", color=t["text"], fontsize=10.5, loc="left", pad=10)
    for bar, val in zip(bars, spd120):
        ax2.text(
            bar.get_x() + bar.get_width() / 2,
            val + 0.35,
            str(val),
            ha="center",
            va="bottom",
            fontsize=8.2,
            color=t["text"],
        )

    save_webp(fig, out_dir / f"03_anatomia_geracoes-{theme_name}.webp")


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    repo_root = base_dir.parents[1]
    out_dir = repo_root / "public/images/posts/arceus-vs-magikarp-gen2"
    out_dir.mkdir(parents=True, exist_ok=True)

    with (base_dir / "scale_results.json").open("r", encoding="utf-8") as fh:
        results = json.load(fh)

    sns.set_style("whitegrid")
    for theme_name, theme_colors in THEMES.items():
        plot_chart1_gen1_distributions(results, out_dir, theme_name, theme_colors)
        plot_chart2_scaling(results, out_dir, theme_name, theme_colors)
        plot_chart3_anatomy(results, out_dir, theme_name, theme_colors)
        print(f"Generated {theme_name} charts in {out_dir}")


if __name__ == "__main__":
    main()
