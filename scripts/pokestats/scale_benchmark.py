"""Benchmark Expectimax vs. Greedy across Gen 1 through Gen 1-9 (1,025 Pokémon)."""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Literal

import numpy as np

Mode = Literal["arceus", "magikarp"]

STAT_KEYS = (
    "hp",
    "attack",
    "defense",
    "special_attack",
    "special_defense",
    "speed",
)

STAT_LABELS = ("HP", "Atk", "Def", "SpA", "SpD", "Spe")

GEN_ORDER = [
    ("Generation-i", "Gen 1", "Kanto"),
    ("Generation-ii", "Gen 2", "Johto"),
    ("Generation-iii", "Gen 3", "Hoenn"),
    ("Generation-iv", "Gen 4", "Sinnoh"),
    ("Generation-v", "Gen 5", "Unova"),
    ("Generation-vi", "Gen 6", "Kalos"),
    ("Generation-vii", "Gen 7", "Alola"),
    ("Generation-viii", "Gen 8", "Galar"),
    ("Generation-ix", "Gen 9", "Paldea"),
]


def solve_draft_expectimax(
    stats_matrix: np.ndarray,
    target: int,
    mode: Mode,
) -> np.ndarray:
    """Vectorized Bellman / Expectimax solver with joint-CDF telescoping."""
    n_pokemon, n_stats = stats_matrix.shape
    max_single_stat = int(stats_matrix.max())
    max_total_sum = max_single_stat * n_stats
    full_mask = (1 << n_stats) - 1

    V = np.zeros((1 << n_stats, max_total_sum + 1), dtype=np.float64)
    sums = np.arange(max_total_sum + 1)
    if mode == "arceus":
        V[full_mask, :] = (sums >= target).astype(np.float64)
    else:
        V[full_mask, :] = (sums <= target).astype(np.float64)

    for filled_count in range(n_stats - 1, -1, -1):
        max_reachable_sum = max_single_stat * filled_count
        s_grid = np.arange(max_reachable_sum + 1)[:, None]

        for mask in range(full_mask):
            if mask.bit_count() != filled_count:
                continue

            open_slots = [j for j in range(n_stats) if not (mask & (1 << j))]
            k = len(open_slots)

            slot_values = np.empty((max_reachable_sum + 1, k, n_pokemon), dtype=np.float64)
            for idx, j in enumerate(open_slots):
                next_sums = s_grid + stats_matrix[:, j][None, :]
                slot_values[:, idx, :] = V[mask | (1 << j), next_sums]

            flat_vals = slot_values.reshape(max_reachable_sum + 1, k * n_pokemon)
            slot_ids = np.repeat(np.arange(k), n_pokemon)[None, :]

            order = np.argsort(flat_vals, axis=1, kind="mergesort")
            sorted_vals = np.take_along_axis(flat_vals, order, axis=1)
            sorted_slots = np.take_along_axis(
                np.broadcast_to(slot_ids, flat_vals.shape), order, axis=1
            )

            cdf = np.ones_like(sorted_vals)
            for idx in range(k):
                counts = np.cumsum(sorted_slots == idx, axis=1, dtype=np.float64)
                cdf *= counts / float(n_pokemon)

            pmf = np.diff(cdf, axis=1, prepend=0.0)
            V[mask, : max_reachable_sum + 1] = np.sum(sorted_vals * pmf, axis=1)

    return V


def simulate_policy(
    stats_matrix: np.ndarray,
    policy: Literal["greedy", "expectimax"],
    mode: Mode,
    target: int,
    V: np.ndarray | None = None,
    n_games: int = 50_000,
    seed: int = 42,
) -> tuple[float, float, float, np.ndarray]:
    """Simulate n_games real drafts without repeating locked Pokémon."""
    rng = np.random.default_rng(seed)
    n_pokemon, n_stats = stats_matrix.shape
    final_scores = np.zeros(n_games, dtype=np.int32)

    for g in range(n_games):
        available = np.ones(n_pokemon, dtype=bool)
        mask = 0
        current_sum = 0

        for _ in range(n_stats):
            open_slots = [j for j in range(n_stats) if not (mask & (1 << j))]
            k = len(open_slots)
            pool = np.flatnonzero(available)
            drawn = rng.choice(pool, size=k, replace=False)

            best_slot = open_slots[0]
            best_poke = int(drawn[0])
            best_val = int(stats_matrix[best_poke, best_slot])

            if policy == "greedy":
                for poke_idx, slot in zip(drawn[1:], open_slots[1:]):
                    val = int(stats_matrix[poke_idx, slot])
                    if (mode == "arceus" and val > best_val) or (
                        mode == "magikarp" and val < best_val
                    ):
                        best_val = val
                        best_slot = slot
                        best_poke = int(poke_idx)
            else:
                assert V is not None
                best_prob = float(V[mask | (1 << best_slot), current_sum + best_val])
                for poke_idx, slot in zip(drawn[1:], open_slots[1:]):
                    val = int(stats_matrix[poke_idx, slot])
                    prob = float(V[mask | (1 << slot), current_sum + val])
                    if prob > best_prob or (
                        prob == best_prob
                        and (
                            (mode == "arceus" and val > best_val)
                            or (mode == "magikarp" and val < best_val)
                        )
                    ):
                        best_prob = prob
                        best_slot = slot
                        best_poke = int(poke_idx)
                        best_val = val

            available[best_poke] = False
            mask |= 1 << best_slot
            current_sum += best_val

        final_scores[g] = current_sum

    win_rate = float(
        np.mean(final_scores >= target)
        if mode == "arceus"
        else np.mean(final_scores <= target)
    )
    ci95 = 1.96 * math.sqrt(win_rate * (1.0 - win_rate) / n_games)
    return win_rate, ci95, float(final_scores.mean()), final_scores


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    with (base_dir / "complete_pokedex.json").open("r", encoding="utf-8") as fh:
        raw = json.load(fh)

    by_gen: dict[str, np.ndarray] = {}
    for gen_key, _, _ in GEN_ORDER:
        rows = [
            [int(p["stats"][k]) for k in STAT_KEYS]
            for p in raw
            if p["generation"] == gen_key
        ]
        by_gen[gen_key] = np.array(rows, dtype=np.int32)

    # 1. Per-generation anatomy
    gen_anatomy = []
    for gen_key, short_label, region in GEN_ORDER:
        mat = by_gen[gen_key]
        flat = mat.flatten()
        bst = mat.sum(axis=1)
        spd_col = mat[:, 4]
        gen_anatomy.append(
            {
                "gen": short_label,
                "region": region,
                "count": int(len(mat)),
                "stat_median": float(np.median(flat)),
                "stat_p95": float(np.percentile(flat, 95)),
                "bst_mean": float(np.mean(bst)),
                "bst_median": float(np.median(bst)),
                "spd_120_plus": int(np.sum(spd_col >= 120)),
                "stat_120_plus_total": int(np.sum(flat >= 120)),
            }
        )

    # 2. Cumulative scaling benchmarks (Gen 1 -> Gen 1-9)
    scaling = []
    gen1_distributions = {}
    round1_examples = {}

    cum_rows: list[np.ndarray] = []
    for idx, (gen_key, short_label, region) in enumerate(GEN_ORDER, start=1):
        cum_rows.append(by_gen[gen_key])
        mat = np.vstack(cum_rows)
        pool_label = "Gen 1" if idx == 1 else f"Gen 1-{idx}"

        V_arc = solve_draft_expectimax(mat, target=720, mode="arceus")
        V_mag = solve_draft_expectimax(mat, target=200, mode="magikarp")

        g_arc_rate, g_arc_ci, g_arc_mean, g_arc_scores = simulate_policy(
            mat, "greedy", "arceus", 720, n_games=50_000, seed=42
        )
        e_arc_rate, e_arc_ci, e_arc_mean, e_arc_scores = simulate_policy(
            mat, "expectimax", "arceus", 720, V=V_arc, n_games=50_000, seed=42
        )

        g_mag_rate, g_mag_ci, g_mag_mean, g_mag_scores = simulate_policy(
            mat, "greedy", "magikarp", 200, n_games=50_000, seed=42
        )
        e_mag_rate, e_mag_ci, e_mag_mean, e_mag_scores = simulate_policy(
            mat, "expectimax", "magikarp", 200, V=V_mag, n_games=50_000, seed=42
        )

        if idx == 1:
            round1_examples = {
                "initial_arceus": float(V_arc[0, 0]),
                "atk_130": float(V_arc[1 << 1, 130]),
                "spd_120": float(V_arc[1 << 4, 120]),
                "hp_250": float(V_arc[1 << 0, 250]),
                "def_180": float(V_arc[1 << 2, 180]),
                "spd_100": float(V_arc[1 << 4, 100]),
            }
            gen1_distributions = {
                "arceus_greedy": g_arc_scores.tolist(),
                "arceus_expectimax": e_arc_scores.tolist(),
                "magikarp_greedy": g_mag_scores.tolist(),
                "magikarp_expectimax": e_mag_scores.tolist(),
            }

        entry = {
            "pool": pool_label,
            "n_pokemon": int(len(mat)),
            "arceus": {
                "v00": float(V_arc[0, 0]),
                "greedy_rate": g_arc_rate,
                "greedy_ci": g_arc_ci,
                "greedy_mean": g_arc_mean,
                "expectimax_rate": e_arc_rate,
                "expectimax_ci": e_arc_ci,
                "expectimax_mean": e_arc_mean,
            },
            "magikarp": {
                "v00": float(V_mag[0, 0]),
                "greedy_rate": g_mag_rate,
                "greedy_ci": g_mag_ci,
                "greedy_mean": g_mag_mean,
                "expectimax_rate": e_mag_rate,
                "expectimax_ci": e_mag_ci,
                "expectimax_mean": e_mag_mean,
            },
        }
        scaling.append(entry)
        print(
            f"{pool_label:8s} (N={len(mat):4d}) | "
            f"Arceus: G={g_arc_rate:.2%} vs E={e_arc_rate:.2%} | "
            f"Magikarp: G={g_mag_rate:.2%} vs E={e_mag_rate:.2%}"
        )

    out = {
        "round1_examples": round1_examples,
        "gen_anatomy": gen_anatomy,
        "scaling": scaling,
        "gen1_distributions": gen1_distributions,
    }
    with (base_dir / "scale_results.json").open("w", encoding="utf-8") as fh:
        json.dump(out, fh)
    print("Saved scale_results.json")


if __name__ == "__main__":
    main()
