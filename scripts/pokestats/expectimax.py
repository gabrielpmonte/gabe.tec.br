"""Expectimax (Bellman) solver and simulator for the Gen 1 PokéStats draft.

Computes exact optimal win-probability tables V[mask, current_sum] via
backward induction with joint-CDF telescoping over order statistics,
runs 50,000-game benchmarks without replacement of locked Pokémon, and
exports a compact little-endian Float32 binary for the web demo.
"""

from __future__ import annotations

import json
import math
import random
import struct
from pathlib import Path
from typing import Literal

Mode = Literal["arceus", "magikarp"]

STAT_KEYS = (
    "hp",
    "attack",
    "defense",
    "special_attack",
    "special_defense",
    "speed",
)


def load_gen1_matrix(json_path: Path) -> list[list[int]]:
    """Load (151, 6) base-stat matrix from gen1_pokemon.json."""
    with json_path.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    return [[int(p[k]) for k in STAT_KEYS] for p in data]


def solve_draft_expectimax(
    stats_matrix: list[list[int]],
    target: int = 720,
    mode: Mode = "arceus",
) -> tuple[list[list[float]], int]:
    """Compute V[mask][current_sum] via backward induction and CDF telescoping."""
    n_pokemon = len(stats_matrix)
    n_stats = len(STAT_KEYS)
    max_single_stat = max(max(row) for row in stats_matrix)
    max_total_sum = max_single_stat * n_stats
    stride = max_total_sum + 1
    full_mask = (1 << n_stats) - 1

    V: list[list[float]] = [[0.0] * stride for _ in range(1 << n_stats)]

    for s in range(stride):
        if mode == "arceus":
            V[full_mask][s] = 1.0 if s >= target else 0.0
        else:
            V[full_mask][s] = 1.0 if s <= target else 0.0

    inv_n = 1.0 / float(n_pokemon)

    for filled_count in range(n_stats - 1, -1, -1):
        max_reachable_sum = max_single_stat * filled_count
        for mask in range(full_mask):
            if mask.bit_count() != filled_count:
                continue

            open_slots = [j for j in range(n_stats) if not (mask & (1 << j))]
            k = len(open_slots)
            next_masks = [mask | (1 << j) for j in open_slots]
            col_stats = [[stats_matrix[i][j] for i in range(n_pokemon)] for j in open_slots]

            row_out = V[mask]
            for s in range(max_reachable_sum + 1):
                # Gather (value, slot_local_idx) for all k * N candidates
                candidates: list[tuple[float, int]] = []
                for idx in range(k):
                    nm_row = V[next_masks[idx]]
                    c_stats = col_stats[idx]
                    for i in range(n_pokemon):
                        candidates.append((nm_row[s + c_stats[i]], idx))

                candidates.sort(key=lambda x: x[0])

                counts = [0] * k
                prev_cdf = 0.0
                expected = 0.0

                for val, slot_idx in candidates:
                    counts[slot_idx] += 1
                    cdf = 1.0
                    for c in counts:
                        cdf *= c * inv_n
                    pmf = cdf - prev_cdf
                    if pmf > 0.0:
                        expected += val * pmf
                    prev_cdf = cdf

                row_out[s] = expected

    return V, stride


def recommend_best_pick(
    V: list[list[float]],
    stats_matrix: list[list[int]],
    mask: int,
    current_sum: int,
    drawn_pokemon: list[int],
    open_slots: list[int],
    mode: Mode = "arceus",
) -> tuple[int, int, float]:
    """Select (slot, pokemon_idx, win_prob) maximizing V[next_mask][next_sum]."""
    best_slot = -1
    best_poke = -1
    best_prob = -1.0
    best_stat = -1 if mode == "arceus" else 10**9

    for poke_idx, slot in zip(drawn_pokemon, open_slots):
        stat_val = stats_matrix[poke_idx][slot]
        win_prob = V[mask | (1 << slot)][current_sum + stat_val]

        is_better = win_prob > best_prob or (
            win_prob == best_prob
            and (
                (mode == "arceus" and stat_val > best_stat)
                or (mode == "magikarp" and stat_val < best_stat)
            )
        )
        if is_better:
            best_prob = win_prob
            best_slot = slot
            best_poke = poke_idx
            best_stat = stat_val

    return best_slot, best_poke, best_prob


def simulate_expectimax_draft(
    stats_matrix: list[list[int]],
    V: list[list[float]],
    target: int = 720,
    mode: Mode = "arceus",
    n_games: int = 50_000,
    seed: int = 42,
) -> tuple[float, float, float]:
    """Simulate n_games real drafts without repeating locked Pokémon."""
    rng = random.Random(seed)
    n_pokemon = len(stats_matrix)
    n_stats = len(STAT_KEYS)
    wins = 0
    total_score = 0

    for _ in range(n_games):
        locked_pokes: set[int] = set()
        mask = 0
        current_sum = 0

        for _ in range(n_stats):
            open_slots = [j for j in range(n_stats) if not (mask & (1 << j))]
            pool = [i for i in range(n_pokemon) if i not in locked_pokes]
            drawn = rng.sample(pool, len(open_slots))

            chosen_slot, chosen_poke, _ = recommend_best_pick(
                V=V,
                stats_matrix=stats_matrix,
                mask=mask,
                current_sum=current_sum,
                drawn_pokemon=drawn,
                open_slots=open_slots,
                mode=mode,
            )

            locked_pokes.add(chosen_poke)
            mask |= 1 << chosen_slot
            current_sum += stats_matrix[chosen_poke][chosen_slot]

        total_score += current_sum
        if (mode == "arceus" and current_sum >= target) or (
            mode == "magikarp" and current_sum <= target
        ):
            wins += 1

    win_rate = wins / n_games
    ci95 = 1.96 * math.sqrt(win_rate * (1.0 - win_rate) / n_games)
    mean_score = total_score / n_games
    return win_rate, ci95, mean_score


def export_binary(
    out_path: Path,
    stride: int,
    v_arceus: list[list[float]],
    v_magikarp: list[list[float]],
) -> None:
    """Write little-endian binary: [uint32 n_stats=6, uint32 stride, float32* V_arceus, float32* V_magikarp]."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("wb") as fh:
        fh.write(struct.pack("<II", len(STAT_KEYS), stride))
        for table in (v_arceus, v_magikarp):
            for row in table:
                fh.write(struct.pack(f"<{stride}f", *row))


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    json_path = repo_root / "public/demos/pokestats/gen1_pokemon.json"
    bin_path = repo_root / "public/demos/pokestats/expectimax_v.bin"

    stats_matrix = load_gen1_matrix(json_path)

    v_arceus, stride = solve_draft_expectimax(stats_matrix, target=720, mode="arceus")
    v_magikarp, _ = solve_draft_expectimax(stats_matrix, target=200, mode="magikarp")

    export_binary(bin_path, stride, v_arceus, v_magikarp)
    print(f"Exported {bin_path} ({bin_path.stat().st_size} bytes, stride={stride})")

    rate_a, ci_a, mean_a = simulate_expectimax_draft(
        stats_matrix, v_arceus, target=720, mode="arceus", n_games=50_000, seed=42
    )
    print(
        f"Arceus   | V[0,0]={v_arceus[0][0]:.4%} | Sim 50k={rate_a:.4%} ± {ci_a:.4%} | Mean={mean_a:.2f}"
    )

    rate_m, ci_m, mean_m = simulate_expectimax_draft(
        stats_matrix, v_magikarp, target=200, mode="magikarp", n_games=50_000, seed=42
    )
    print(
        f"Magikarp | V[0,0]={v_magikarp[0][0]:.4%} | Sim 50k={rate_m:.4%} ± {ci_m:.4%} | Mean={mean_m:.2f}"
    )


if __name__ == "__main__":
    main()
